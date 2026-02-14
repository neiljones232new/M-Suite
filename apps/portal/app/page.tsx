"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

type ServiceKey = "practiceWeb" | "practiceApi" | "customsUi" | "customsBackend";
type Action = "start" | "stop" | "restart";

type StatusState = Record<ServiceKey, boolean>;

const initialStatus: StatusState = {
  practiceWeb: false,
  practiceApi: false,
  customsUi: false,
  customsBackend: false,
};

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

function ServiceControls({
  service,
  running,
  loadingKey,
  onAction,
}: {
  service: ServiceKey;
  running: boolean;
  loadingKey: string | null;
  onAction: (service: ServiceKey, action: Action) => void;
}) {
  const startBusy = loadingKey === `${service}:start`;
  const stopBusy = loadingKey === `${service}:stop`;
  const restartBusy = loadingKey === `${service}:restart`;

  return (
    <div style={{ marginTop: 12, display: "flex", gap: 8, justifyContent: "center" }}>
      <button
        onClick={() => onAction(service, "start")}
        disabled={startBusy || running}
        style={controlBtn("#22c55e", startBusy || running)}
      >
        {startBusy ? "Starting..." : "Start"}
      </button>
      <button
        onClick={() => onAction(service, "restart")}
        disabled={restartBusy || !running}
        style={controlBtn("#facc15", restartBusy || !running)}
      >
        {restartBusy ? "Restarting..." : "Restart"}
      </button>
      <button
        onClick={() => onAction(service, "stop")}
        disabled={stopBusy || !running}
        style={controlBtn("#ef4444", stopBusy || !running)}
      >
        {stopBusy ? "Stopping..." : "Stop"}
      </button>
    </div>
  );
}

export default function Home() {
  const [status, setStatus] = useState<StatusState>(initialStatus);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");

  async function loadStatus() {
    try {
      const res = await fetch("/api/status", { cache: "no-store" });
      const data = await res.json();
      setStatus({
        practiceWeb: Boolean(data.practiceWeb),
        practiceApi: Boolean(data.practiceApi),
        customsUi: Boolean(data.customsUi),
        customsBackend: Boolean(data.customsBackend),
      });
    } catch {
      setMessage("Status check failed.");
    }
  }

  useEffect(() => {
    loadStatus();
    const interval = setInterval(loadStatus, 8000);
    return () => clearInterval(interval);
  }, []);

  async function runAction(target: "suite" | ServiceKey, action: Action) {
    const key = `${target}:${action}`;
    setLoadingAction(key);
    setMessage("");

    try {
      if (target === "suite" && action === "stop") {
        window.location.href = "/offline.html";
      }

      const res = await fetch("/api/control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, target }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Control action failed");
      }

      setMessage(`${target} ${action} request sent.`);
      setTimeout(loadStatus, 1200);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Action failed.");
    } finally {
      setTimeout(() => setLoadingAction(null), 600);
    }
  }

  const allRunning = useMemo(() => Object.values(status).every(Boolean), [status]);

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
        {message ? <p style={{ marginTop: 8, fontSize: 13, color: "#d1d5db" }}>{message}</p> : null}
      </header>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(320px, 1fr))",
          gap: 30,
          maxWidth: 760,
          width: "100%",
        }}
      >
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
          <ServiceControls
            service="practiceWeb"
            running={status.practiceWeb}
            loadingKey={loadingAction}
            onAction={runAction}
          />

          <StatusLight label="Practice API" online={status.practiceApi} />
          <ServiceControls
            service="practiceApi"
            running={status.practiceApi}
            loadingKey={loadingAction}
            onAction={runAction}
          />

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
          <ServiceControls
            service="customsUi"
            running={status.customsUi}
            loadingKey={loadingAction}
            onAction={runAction}
          />

          <StatusLight label="Backend API" online={status.customsBackend} />
          <ServiceControls
            service="customsBackend"
            running={status.customsBackend}
            loadingKey={loadingAction}
            onAction={runAction}
          />

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

      <div
        style={{
          display: "flex",
          gap: 14,
          marginTop: 35,
        }}
      >
        <button
          onClick={() => runAction("suite", "start")}
          style={controlBtn("#22c55e", Boolean(loadingAction))}
          disabled={Boolean(loadingAction) || allRunning}
        >
          {loadingAction === "suite:start" ? "Starting..." : "Start Suite"}
        </button>

        <button
          onClick={() => runAction("suite", "restart")}
          style={controlBtn("#facc15", Boolean(loadingAction))}
          disabled={Boolean(loadingAction)}
        >
          {loadingAction === "suite:restart" ? "Restarting..." : "Restart Suite"}
        </button>

        <button
          onClick={() => runAction("suite", "stop")}
          style={controlBtn("#ef4444", Boolean(loadingAction))}
          disabled={Boolean(loadingAction)}
        >
          {loadingAction === "suite:stop" ? "Stopping..." : "Stop Suite"}
        </button>
      </div>
    </main>
  );
}

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

function controlBtn(color: string, disabled: boolean) {
  return {
    padding: "10px 16px",
    borderRadius: 14,
    border: "none",
    cursor: disabled ? "not-allowed" : "pointer",
    fontWeight: 700,
    background: color,
    color: "#000",
    fontSize: 13,
    opacity: disabled ? 0.6 : 1,
  };
}
