import "express";
declare global {
  namespace Express {
    interface Request {
      claims?: {
        sub: string;
        role: "participant" | "admin";
        participantDbId?: number;
      };
    }
  }
}
