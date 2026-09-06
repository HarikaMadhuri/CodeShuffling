import "dotenv/config";
import express from "express";
import cors from "cors";
import http from "node:http";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Server } from "socket.io";
import {
  PrismaClient,
  ParticipantStatus,
  ViolationType,
  Year,
} from "@prisma/client";

const prisma = new PrismaClient();
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});
const jwtSecret = process.env.JWT_SECRET ?? "development-secret";
app.use(cors());
app.use(express.json({ limit: "1mb" }));

type Claims = {
  sub: string;
  role: "participant" | "admin";
  participantDbId?: number;
};
function sign(claims: Claims) {
  return jwt.sign(claims, jwtSecret, { expiresIn: "12h" });
}
function auth(role?: Claims["role"]) {
  return (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    const token = req.headers.authorization?.replace("Bearer ", "");
    try {
      const claims = jwt.verify(token ?? "", jwtSecret) as Claims;
      if (role && claims.role !== role)
        return res.status(403).json({ error: "Forbidden" });
      (req as any).claims = claims;
      next();
    } catch {
      res.status(401).json({ error: "Authentication required" });
    }
  };
}
function shuffle<T>(values: T[]) {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
function safeParticipant(p: any) {
  return {
    id: p.participantId,
    name: p.name,
    year: p.year,
    status: p.status,
    assignedCode: p.question ? `Code ${p.question.codeNumber}` : null,
    startTime: p.startTime,
    completionTime: p.completionTime,
    elapsedMs: p.elapsedMs,
    score: p.score,
    disqualified: p.disqualified,
    disqualificationReason: p.disqualificationReason,
  };
}

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.post("/api/auth/participant/login", async (req, res) => {
  const participantId = String(req.body.participantId ?? "").toUpperCase();
  const password = String(req.body.password ?? "").toUpperCase();
  const requestedYear = req.body.year as Year | undefined;
  if (!/^(24|25)A(?:81|85)A05[A-Z0-9]{2}$/.test(participantId))
    return res.status(400).json({
      error: "Enter a valid roll number, for example 24A81A0501 or 25A85A05M2.",
    });
  if (password !== participantId)
    return res.status(401).json({ error: "Password must match your roll number." });
  if (requestedYear !== Year.SECOND && requestedYear !== Year.THIRD)
    return res.status(400).json({ error: "Choose your year before logging in." });
  let p = await prisma.participant.findUnique({
    where: { participantId },
    include: { question: true },
  });
  if (!p) {
    const year = requestedYear;
    // Choose from the full enabled question bank for the participant's year.
    // Questions are intentionally reusable: more than one participant may be
    // assigned the same code during a round.
    const questions = await prisma.question.findMany({
      where: { year, enabled: true },
    });
    if (!questions.length)
      return res.status(503).json({ error: "No challenge is available for this year." });
    const question = questions[Math.floor(Math.random() * questions.length)];
    p = await prisma.participant.create({
      data: {
        participantId,
        name: `Participant ${participantId}`,
        year,
        passwordHash: await bcrypt.hash(password, 12),
        assignedQuestionId: question.id,
      },
      include: { question: true },
    });
  }
  if (p.year !== requestedYear)
    return res.status(409).json({
      error: "This roll number is already registered for the other year.",
    });
  if (!p.enabled || !(await bcrypt.compare(password, p.passwordHash)))
    return res.status(401).json({ error: "Invalid credentials" });
  if (p.sessionId && p.status === ParticipantStatus.PLAYING)
    return res.status(409).json({
      error: "This participant is already active on another session.",
    });
  const sessionId = crypto.randomUUID();
  await prisma.participant.update({ where: { id: p.id }, data: { sessionId } });
  res.json({
    token: sign({
      sub: p.participantId,
      role: "participant",
      participantDbId: p.id,
    }),
    participant: safeParticipant(p),
  });
});
app.post("/api/auth/admin/login", async (req, res) => {
  const { username, password } = req.body;
  const admin = await prisma.admin.findUnique({ where: { username } });
  if (!admin || !(await bcrypt.compare(password, admin.passwordHash)))
    return res.status(401).json({ error: "Invalid credentials" });
  res.json({
    token: sign({ sub: admin.username, role: "admin" }),
    admin: { username: admin.username },
  });
});
app.get("/api/participant/me", auth("participant"), async (req, res) => {
  const c = (req as any).claims as Claims;
  const p = await prisma.participant.findUnique({
    where: { participantId: c.sub },
    include: { question: true, attempts: true },
  });
  if (!p) return res.status(404).json({ error: "Participant not found" });
  const attempt = p.attempts[0];
  let lines: { id: number; content: string }[] = [];
  if (attempt && p.status === ParticipantStatus.PLAYING) {
    const q = await prisma.question.findUnique({
      where: { id: p.assignedQuestionId! },
      include: { lines: true },
    });
    const order = attempt.shuffleOrder as number[];
    lines = order
      .map((id) => q?.lines.find((line) => line.id === id))
      .filter(Boolean)
      .map((line) => ({ id: line!.id, content: line!.content }));
  }
  res.json({
    participant: safeParticipant(p),
    attempt: attempt
      ? { id: attempt.id, startTime: attempt.startTime, lines }
      : null,
  });
});
app.post("/api/participant/start", auth("participant"), async (req, res) => {
  const c = (req as any).claims as Claims;
  const p = await prisma.participant.findUnique({
    where: { participantId: c.sub },
    include: { question: { include: { lines: true } } },
  });
  if (!p?.question) return res.status(400).json({ error: "No code assigned." });
  if (p.status === ParticipantStatus.PLAYING)
    return res.json({ participant: safeParticipant(p) });
  if (p.status !== ParticipantStatus.NOT_STARTED)
    return res
      .status(409)
      .json({ error: "Round cannot be started from the current state." });
  const event = await prisma.eventSetting.findUnique({
    where: { key: "status" },
  });
  if (event?.value !== "OPEN")
    return res.status(409).json({ error: "The round is not open." });
  const startTime = new Date();
  const order = shuffle(p.question.lines.map((line) => line.id));
  const [updated] = await prisma.$transaction([
    prisma.participant.update({
      where: { id: p.id },
      data: { status: ParticipantStatus.PLAYING, startTime },
    }),
    prisma.attempt.create({
      data: {
        participantId: p.id,
        questionId: p.question.id,
        shuffleOrder: order,
        startTime,
        status: ParticipantStatus.PLAYING,
      },
    }),
  ]);
  io.emit("participant:update");
  res.json({
    participant: safeParticipant({ ...p, status: updated.status, startTime }),
    attempt: {
      startTime,
      lines: order
        .map((id) => p.question!.lines.find((line) => line.id === id))
        .map((line) => ({ id: line!.id, content: line!.content })),
    },
  });
});
app.post("/api/participant/submit", auth("participant"), async (req, res) => {
  const c = (req as any).claims as Claims;
  const submittedOrder = req.body.order;
  const p = await prisma.participant.findUnique({
    where: { participantId: c.sub },
    include: { attempts: true },
  });
  const attempt = p?.attempts[0];
  if (
    !p ||
    !attempt ||
    p.status !== ParticipantStatus.PLAYING ||
    !Array.isArray(submittedOrder)
  )
    return res.status(409).json({ error: "No active attempt." });
  const q = await prisma.question.findUnique({
    where: { id: attempt.questionId },
    include: { lines: true },
  });
  const correctOrder =
    q?.lines.sort((a, b) => a.position - b.position).map((line) => line.id) ??
    [];
  const correct =
    JSON.stringify(submittedOrder) === JSON.stringify(correctOrder);
  const now = new Date();
  if (!correct) {
    await prisma.submission.create({
      data: { attemptId: attempt.id, submittedOrder, isCorrect: false },
    });
    return res.json({
      correct: false,
      message: "Incorrect arrangement. Try again.",
    });
  }
  const elapsedMs = now.getTime() - attempt.startTime!.getTime();
  await prisma.$transaction([
    prisma.submission.create({
      data: { attemptId: attempt.id, submittedOrder, isCorrect: true },
    }),
    prisma.attempt.update({
      where: { id: attempt.id },
      data: {
        submittedOrder,
        isCorrect: true,
        completionTime: now,
        elapsedMs,
        status: ParticipantStatus.COMPLETED,
      },
    }),
    prisma.participant.update({
      where: { id: p.id },
      data: {
        status: ParticipantStatus.COMPLETED,
        completionTime: now,
        elapsedMs,
        score: 100,
        sessionId: null,
      },
    }),
  ]);
  io.emit("leaderboard:update");
  return res.json({ correct: true, elapsedMs });
});
app.post(
  "/api/participant/violation",
  auth("participant"),
  async (req, res) => {
    const c = (req as any).claims as Claims;
    const { eventType, details } = req.body as {
      eventType: ViolationType;
      details?: string;
    };
    const p = await prisma.participant.findUnique({
      where: { participantId: c.sub },
      include: { attempts: true },
    });
    if (!p || p.status !== ParticipantStatus.PLAYING)
      return res.status(409).json({ error: "No active attempt." });
    await prisma.$transaction([
      prisma.violation.create({
        data: {
          participantId: p.id,
          attemptId: p.attempts[0]?.id,
          eventType,
          details,
        },
      }),
      prisma.participant.update({
        where: { id: p.id },
        data: {
          status: ParticipantStatus.DISQUALIFIED,
          disqualified: true,
          disqualificationReason: details ?? eventType,
          sessionId: null,
        },
      }),
      prisma.attempt.updateMany({
        where: { id: p.attempts[0]?.id },
        data: { status: ParticipantStatus.DISQUALIFIED },
      }),
    ]);
    io.emit("participant:update");
    res.json({ disqualified: true, reason: details ?? eventType });
  },
);
app.get("/api/leaderboard", async (_req, res) => {
  const rows = await prisma.participant.findMany({
    where: { status: ParticipantStatus.COMPLETED, disqualified: false },
    include: { question: true },
    orderBy: [{ elapsedMs: "asc" }, { completionTime: "asc" }],
  });
  res.json(
    rows.map((p, index) => ({
      rank: index + 1,
      participant: p.participantId,
      name: p.name,
      year: p.year,
      assignedCode: p.question ? `Code ${p.question.codeNumber}` : "-",
      timeMs: p.elapsedMs,
      status: p.status,
      score: p.score,
    })),
  );
});
app.get("/api/admin/overview", auth("admin"), async (_req, res) => {
  const [participants, questions, violations, event] = await Promise.all([
    prisma.participant.findMany({
      include: { question: true, violations: true },
      orderBy: { participantId: "asc" },
    }),
    prisma.question.findMany({
      include: { _count: { select: { participants: true } } },
      orderBy: [{ year: "asc" }, { codeNumber: "asc" }],
    }),
    prisma.violation.findMany({ orderBy: { timestamp: "desc" }, take: 100 }),
    prisma.eventSetting.findUnique({ where: { key: "status" } }),
  ]);
  const counts = participants.reduce(
    (a, p) => {
      a[p.status]++;
      return a;
    },
    { NOT_STARTED: 0, PLAYING: 0, COMPLETED: 0, DISQUALIFIED: 0 } as Record<
      string,
      number
    >,
  );
  res.json({
    counts,
    eventStatus: event?.value ?? "CLOSED",
    participants: participants.map((p) => ({
      ...safeParticipant(p),
      violations: p.violations.length,
      participantId: p.participantId,
    })),
    questions,
    violations,
  });
});
app.post("/api/admin/event", auth("admin"), async (req, res) => {
  const { status } = req.body;
  if (!["OPEN", "CLOSED", "PAUSED"].includes(status))
    return res.status(400).json({ error: "Invalid event status" });
  await prisma.eventSetting.upsert({
    where: { key: "status" },
    update: { value: status },
    create: { key: "status", value: status },
  });
  io.emit("event:update", status);
  res.json({ status });
});
app.post("/api/admin/questions", auth("admin"), async (req, res) => {
  const { codeNumber, year, title, language, difficulty, enabled, code } =
    req.body;
  const lines = String(code).split(/\r?\n/);
  const question = await prisma.question.create({
    data: {
      codeNumber,
      year: year as Year,
      title,
      language,
      difficulty,
      enabled: enabled !== false,
      lines: {
        create: lines.map((content, position) => ({ content, position })),
      },
    },
    include: { lines: true },
  });
  res.status(201).json(question);
});
app.get("/api/admin/questions", auth("admin"), async (_req, res) =>
  res.json(
    await prisma.question.findMany({
      include: { _count: { select: { participants: true } } },
      orderBy: [{ year: "asc" }, { codeNumber: "asc" }],
    }),
  ),
);
app.get("/api/admin/export", auth("admin"), async (_req, res) => {
  const rows = await prisma.participant.findMany({
    where: { status: ParticipantStatus.COMPLETED, disqualified: false },
    include: { question: true },
    orderBy: { elapsedMs: "asc" },
  });
  const csv = [
    "Rank,Participant,Name,Year,Assigned Code,Time (ms),Score",
    ...rows.map(
      (p, i) =>
        `${i + 1},${p.participantId},${p.name},${p.year},${p.question?.codeNumber ?? ""},${p.elapsedMs},${p.score}`,
    ),
  ].join("\n");
  res
    .header("Content-Type", "text/csv")
    .attachment("code-shuffling-leaderboard.csv")
    .send(csv);
});

io.on("connection", (socket) => socket.emit("connected"));
const port = Number(process.env.PORT ?? 4000);
server.listen(port, () =>
  console.log(`Code Shuffling API listening on http://localhost:${port}`),
);
