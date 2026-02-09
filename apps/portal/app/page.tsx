"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

/* ===============================
   Status Light Component
================================ */
function StatusLight({ label, online }: { label: string; online: boolean }) {
  return (
    <div
      style={{
        marginTop: 10,
        fontSize: 12,
        opacity: 0.85,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
      }}
    >
      <span
        style={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: online ? "#22c55e" : "#ef4444",
          boxShadow: online
            ? "0 0 10px rgba(34,197,94,0.6)"
            : "0 0 10px rgba(239,68,68,0.6)",
        }}
      />
      {label}: {online ? "Running" : "Offline"}
    </div>
  );
}

/* ===============================
   Main Portal Page
================================ */
export default function Home() {
  const [status, setStatus] = useState({
    practiceWeb: false,
    practiceApi: false,
    customsUi: false,
    customsBackend: false,
  });

  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  /* Status Refresh */
  useEffect(() => {
    async function loadStatus() {
      try {
        const res = await fetch("/api/status");
        const data = await res.json();
        setStatus(data);
      } catch {
        console.log("Status check failed");
      }
    }

    loadStatus();
    const interval = setInterval(loadStatus, 8000);

    return () => clearInterval(interval);
  }, []);

  /* LaunchAgent Control */
  async function runAction(action: "start" | "stop" | "restart") {
    setLoadingAction(action);

    // ✅ STOP: Redirect instantly before shutdown
    if (action === "stop") {
      // Redirect same tab (Safari-safe)
      window.location.href = "/offline.html";

      // Fire stop request in background
      fetch("/api/control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      return;
    }

    // Normal start/restart
    await fetch("/api/control", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });

    setTimeout(() => setLoadingAction(null), 1500);
  }

  return (
    <main
      style={{
        flex: 1,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "30px 20px",
        textAlign: "center",
      }}
    >
      {/* Header */}
      <header style={{ marginBottom: 30 }}>
        <Image
          src="/M_Logo_Silver.png"
          alt="M-Suite Logo"
          width={70}
          height={70}
          style={{
            margin: "0 auto 14px",
            filter: "drop-shadow(0 0 14px rgba(200,200,200,0.25))",
          }}
        />

        <h1 style={{ fontSize: 40, fontWeight: 700 }}>M-Suite</h1>

        <p style={{ marginTop: 10, fontSize: 14, opacity: 0.7 }}>
          Unified launcher for Practice + Customs apps.
        </p>
      </header>

      {/* Cards Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(320px, 1fr))",
          gap: 30,
          maxWidth: 760,
          width: "100%",
        }}
      >
        {/* Practice */}
        <div style={cardStyle("rgba(109,40,217,0.40)")}>
          <Image
            src="/M_Logo_PurpleD.png"
            alt="Practice Logo"
            width={55}
            height={55}
            style={{ margin: "0 auto 14px" }}
          />

          <h2 style={titleStyle}>Practice Manager</h2>
          <p style={descStyle}>Client management + compliance platform</p>

          <StatusLight label="Practice Web" online={status.practiceWeb} />
          <StatusLight label="Practice API" online={status.practiceApi} />

          <div style={{ marginTop: 18, display: "grid", gap: 10 }}>
            <a
              href="http://localhost:3000"
              target="_blank"
              style={btn("#6d28d9")}
            >
              Open Practice Web UI
            </a>

            <a
              href="http://localhost:3001/api/v1/docs"
              target="_blank"
              style={btn("rgba(109,40,217,0.22)")}
            >
              View Practice API
            </a>
          </div>
        </div>

        {/* Customs */}
        <div style={cardStyle("rgba(202,138,4,0.40)")}>
          <Image
            src="/M_Logo_Gold.png"
            alt="Customs Logo"
            width={55}
            height={55}
            style={{ margin: "0 auto 14px" }}
          />

          <h2 style={titleStyle}>Customs Manager</h2>
          <p style={descStyle}>Duty + VAT repayment automation suite</p>

          <StatusLight label="Customs UI" online={status.customsUi} />
          <StatusLight label="Backend API" online={status.customsBackend} />

          <div style={{ marginTop: 18, display: "grid", gap: 10 }}>
            <a
              href="http://localhost:5173"
              target="_blank"
              style={btn("#ca8a04")}
            >
              Open Customs UI
            </a>

            <a
              href="http://localhost:3100/health"
              target="_blank"
              style={btn("rgba(202,138,4,0.22)")}
            >
              View Customs Backend API
            </a>
          </div>
        </div>
      </div>

      {/* Control Buttons BELOW Cards */}
      <div
        style={{
          display: "flex",
          gap: 14,
          marginTop: 35,
        }}
      >
        <button
          onClick={() => runAction("start")}
          style={controlBtn("#22c55e")}
        >
          {loadingAction === "start" ? "Starting..." : "▶ Start Suite"}
        </button>

        <button
          onClick={() => runAction("restart")}
          style={controlBtn("#facc15")}
        >
          {loadingAction === "restart" ? "Restarting..." : "🔄 Restart"}
        </button>

        <button
          onClick={() => runAction("stop")}
          style={controlBtn("#ef4444")}
        >
          {loadingAction === "stop" ? "Stopping..." : "⛔ Stop"}
        </button>
      </div>
    </main>
  );
}

/* Helpers */
const titleStyle = { color: "#fff", fontSize: 20 };
const descStyle = { marginTop: 6, fontSize: 13, opacity: 0.65 };

function cardStyle(glow: string) {
  return {
    background: "#050505",
    borderRadius: 22,
    padding: 24,
    boxShadow: `0 0 55px ${glow}`,
    border: "1px solid rgba(255,255,255,0.08)",
  };
}

function btn(color: string) {
  return {
    display: "block",
    padding: "12px 14px",
    borderRadius: 14,
    textDecoration: "none",
    fontWeight: 600,
    fontSize: 14,
    background: color,
    color: "#fff",
  };
}

function controlBtn(color: string) {
  return {
    padding: "10px 16px",
    borderRadius: 14,
    border: "none",
    cursor: "pointer",
    fontWeight: 700,
    background: color,
    color: "#000",
    fontSize: 13,
  };
}
