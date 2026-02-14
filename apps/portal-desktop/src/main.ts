import { invoke } from "@tauri-apps/api/core";
import "./styles.css";

type ServiceId = "practiceWeb" | "practiceApi" | "customsUi" | "customsBackend";
type Action = "start" | "stop" | "restart";

interface ServiceInfo {
  id: ServiceId;
  name: string;
  description: string;
  ports: number[];
}

interface ServiceStatus {
  id: ServiceId;
  running: boolean;
  ports: number[];
  pids: number[];
}

interface PortInfo {
  port: number;
  running: boolean;
  pids: number[];
}

const app = document.querySelector("#app");
if (!app) throw new Error("app root not found");

const state = {
  loadingKey: "",
  services: [] as ServiceInfo[],
  statuses: new Map<ServiceId, ServiceStatus>(),
  ports: [] as PortInfo[],
  message: "",
  view: "home" as "home" | "control",
};

function render() {
  if (state.view === "home") {
    app.innerHTML = `
      <div class="home-shell">
        <div class="hero-container">
          <div class="pulse-ring"></div>
          <div class="orbit-container"><div class="dot"></div></div>
          <svg class="logo-circle" width="160" height="160"><circle class="circle-path" cx="80" cy="80" r="65" /></svg>
          <div class="main-logo-text"><img src="/M_Logo_Silver.png" alt="M Logo" /></div>
        </div>
        <h1 class="home-title">M-Suite Desktop Portal</h1>
        <p class="home-sub">Unified launcher for Practice + Customs apps</p>
        <p class="home-sub">Portal helps you control and monitor software ports</p>
        <button class="btn-portal" data-open-control="1">Open Controls</button>
        <div class="log">${state.message}</div>
      </div>
    `;

    document.querySelector("[data-open-control]")?.addEventListener("click", async () => {
      state.view = "control";
      await refreshStatus();
    });
    return;
  }

  const practiceServices = state.services.filter((service) =>
    service.id === "practiceWeb" || service.id === "practiceApi"
  );
  const customsServices = state.services.filter((service) =>
    service.id === "customsUi" || service.id === "customsBackend"
  );

  app.innerHTML = `
    <div class="control-shell">
    <div class="panel">
      <div class="panel-head">
        <div>
          <h1 class="panel-title">Control Center</h1>
          <div class="panel-sub">Start, stop, restart and monitor each service with one instance per service.</div>
        </div>
        <button class="btn-ghost" data-go-home="1">Home</button>
      </div>

      <div class="surface">
        <div class="toolbar">
          <button class="btn-start" data-suite-action="start">Start Suite</button>
          <button class="btn-restart" data-suite-action="restart">Restart Suite</button>
          <button class="btn-stop" data-suite-action="stop">Stop Suite</button>
          <button class="btn-ghost" data-refresh="1">Refresh</button>
        </div>

        <div class="group-grid">
          ${renderGroupCard("practice", "Practice Manager", "/M_Logo_PurpleD.png", practiceServices)}
          ${renderGroupCard("customs", "Customs Manager", "/M_Logo_Gold.png", customsServices)}
        </div>

        <div class="port-grid">
          ${state.ports.map(renderPort).join("")}
        </div>

        <div class="log">${state.message}</div>
      </div>
    </div>
    </div>
  `;

  bindActions();
}

function renderGroupCard(
  theme: "practice" | "customs",
  title: string,
  logo: string,
  services: ServiceInfo[]
) {
  return `
    <section class="group-card ${theme}">
      <div class="group-head">
        <div class="group-brand">
          <img src="${logo}" alt="${title} logo" />
          <div>
            <h2>${title}</h2>
            <div class="muted">Dedicated controls for ${title.toLowerCase()}</div>
          </div>
        </div>
      </div>
      <div class="group-services">
        ${services.map((service) => renderServiceCard(service)).join("")}
      </div>
    </section>
  `;
}

function renderServiceCard(service: ServiceInfo) {
  const status = state.statuses.get(service.id);
  const running = status?.running ?? false;
  return `
    <article class="service-card">
      <div class="row">
        <strong>${service.name}</strong>
        <span class="badge"><span class="dot-status" style="background:${running ? "var(--ok)" : "var(--bad)"}"></span>${running ? "Running" : "Offline"}</span>
      </div>
      <div class="muted">${service.description}</div>
      <div class="muted">Ports: ${service.ports.join(", ")} | PIDs: ${status?.pids?.join(", ") || "-"}</div>
      <div class="controls">
        <button class="btn-start" data-service="${service.id}" data-action="start">Start</button>
        <button class="btn-restart" data-service="${service.id}" data-action="restart">Restart</button>
        <button class="btn-stop" data-service="${service.id}" data-action="stop">Stop</button>
      </div>
    </article>
  `;
}

function renderPort(port: PortInfo) {
  return `
    <div class="port">
      <div><strong>${port.port}</strong></div>
      <div class="muted">${port.running ? "Listening" : "Closed"}</div>
      <div class="muted">PIDs: ${port.pids.length ? port.pids.join(",") : "-"}</div>
      <button class="btn-ghost btn-open-port" data-open-port="${port.port}">Open</button>
    </div>
  `;
}

function bindActions() {
  document.querySelector("[data-go-home]")?.addEventListener("click", () => {
    state.view = "home";
    render();
  });

  document.querySelectorAll("[data-service][data-action]").forEach((el) => {
    el.addEventListener("click", async () => {
      const service = (el as HTMLElement).dataset.service as ServiceId;
      const action = (el as HTMLElement).dataset.action as Action;
      await runAction(service, action);
    });
  });

  document.querySelectorAll("[data-suite-action]").forEach((el) => {
    el.addEventListener("click", async () => {
      const action = (el as HTMLElement).dataset.suiteAction as Action;
      await runSuite(action);
    });
  });

  document.querySelector("[data-refresh]")?.addEventListener("click", async () => {
    await refreshStatus();
  });

  document.querySelectorAll("[data-open-port]").forEach((el) => {
    el.addEventListener("click", async () => {
      const port = Number((el as HTMLElement).dataset.openPort);
      await openPort(port);
    });
  });
}

async function runAction(service: ServiceId, action: Action) {
  if (state.loadingKey) return;
  state.loadingKey = `${service}:${action}`;
  state.message = `${action} ${service}...`;
  render();

  try {
    await invoke("service_action", { serviceId: service, action });
    state.message = `${service} ${action} complete`;
    await refreshStatus();
  } catch (error) {
    state.message = `Action failed: ${String(error)}`;
  } finally {
    state.loadingKey = "";
    render();
  }
}

async function runSuite(action: Action) {
  if (state.loadingKey) return;
  state.loadingKey = `suite:${action}`;
  state.message = `${action} suite...`;
  render();

  try {
    await invoke("suite_action", { action });
    state.message = `suite ${action} complete`;
    await refreshStatus();
  } catch (error) {
    state.message = `Suite action failed: ${String(error)}`;
  } finally {
    state.loadingKey = "";
    render();
  }
}

async function refreshStatus() {
  const statuses = (await invoke("service_status")) as ServiceStatus[];
  const ports = (await invoke("port_status")) as PortInfo[];
  state.statuses = new Map(statuses.map((status) => [status.id, status]));
  state.ports = ports;
  render();
}

async function openPort(port: number) {
  const url = `http://localhost:${port}`;
  try {
    await invoke("open_url", { url });
    state.message = `Opened ${url}`;
  } catch (error) {
    state.message = `Open failed: ${String(error)}`;
  }
  render();
}

async function init() {
  state.services = (await invoke("list_services")) as ServiceInfo[];
  render();
  setInterval(() => {
    if (state.view === "control") {
      refreshStatus().catch(() => {
        state.message = "Status refresh failed";
        render();
      });
    }
  }, 3000);
}

init().catch((error) => {
  state.message = `Initialization failed: ${String(error)}`;
  render();
});
