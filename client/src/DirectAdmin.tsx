import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

export default function DirectAdmin() {
  const [token, setToken] = useState("");
  const [data, setData] = useState<any>();
  const [error, setError] = useState("");

  const load = async (value: string) => {
    const response = await fetch(`${API}/admin/overview`, {
      headers: { Authorization: `Bearer ${value}` },
    });
    if (!response.ok) throw new Error("Could not load the admin dashboard.");
    setData(await response.json());
  };

  useEffect(() => {
    fetch(`${API}/auth/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "admin", password: "admin123" }),
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Could not sign in to Admin.");
        const result = await response.json();
        setToken(result.token);
        await load(result.token);
      })
      .catch((err) => setError(err.message));
  }, []);

  const setEvent = async (status: string) => {
    const response = await fetch(`${API}/admin/event`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) return setError("Could not update the event status.");
    await load(token);
  };

  if (error) return <main className="auth-page"><div className="auth-card"><h2>Admin unavailable</h2><p>{error}</p></div></main>;
  if (!data) return <main className="auth-page"><div className="auth-card"><h2>Opening Admin console...</h2></div></main>;

  const counts = data.counts ?? {};
  const participants = data.participants ?? [];
  return <main className="admin-page"><div className="admin-heading"><div><span className="section-kicker">ORGANIZER CONSOLE</span><h1>Round control room.</h1><p>Admin access is enabled automatically for this local demo.</p></div><div className="event-controls"><span>EVENT STATUS</span><button className={`event-state ${data.eventStatus === "OPEN" ? "open" : ""}`} onClick={() => setEvent("OPEN")}>OPEN ROUND</button><button className="event-state" onClick={() => setEvent("PAUSED")}>PAUSE NEW</button><button className="event-state" onClick={() => setEvent("CLOSED")}>CLOSE</button></div></div><div className="metric-grid"><div className="metric"><span>Total participants</span><strong>{Object.values(counts).reduce((a: number, b: any) => a + b, 0)}</strong></div><div className="metric"><span>Playing</span><strong>{counts.PLAYING ?? 0}</strong></div><div className="metric"><span>Completed</span><strong>{counts.COMPLETED ?? 0}</strong></div><div className="metric alert"><span>Disqualified</span><strong>{counts.DISQUALIFIED ?? 0}</strong></div></div><section className="monitor-panel"><div className="panel-heading"><div><span className="section-kicker">PARTICIPANTS</span><h2>Assigned codes</h2></div></div><div className="table-wrap"><table><thead><tr><th>Participant</th><th>Year</th><th>Assigned code</th><th>Status</th></tr></thead><tbody>{participants.map((participant: any) => <tr key={participant.id}><td>{participant.participantId}</td><td>{participant.year}</td><td>{participant.assignedCode ?? "Unassigned"}</td><td>{participant.status}</td></tr>)}</tbody></table></div></section></main>;
}
