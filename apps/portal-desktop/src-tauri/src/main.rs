#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::Serialize;
use std::path::PathBuf;
use std::process::Command;

#[derive(Clone)]
struct ServiceDef {
    id: &'static str,
    name: &'static str,
    description: &'static str,
    ports: &'static [u16],
    script_name: &'static str,
}

#[derive(Serialize)]
struct ServiceInfo {
    id: String,
    name: String,
    description: String,
    ports: Vec<u16>,
}

#[derive(Serialize)]
struct ServiceStatus {
    id: String,
    running: bool,
    ports: Vec<u16>,
    pids: Vec<u32>,
}

#[derive(Serialize)]
struct PortInfo {
    port: u16,
    running: bool,
    pids: Vec<u32>,
}

fn repo_root() -> Result<PathBuf, String> {
    let cwd = std::env::current_dir().map_err(|e| e.to_string())?;
    if cwd.join("package.json").exists() {
        return Ok(cwd);
    }

    let manifest = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    manifest
        .ancestors()
        .nth(3)
        .map(PathBuf::from)
        .ok_or_else(|| "Could not resolve repository root".to_string())
}

fn services() -> Vec<ServiceDef> {
    vec![
        ServiceDef {
            id: "practiceWeb",
            name: "Practice Web",
            description: "Practice Manager web frontend",
            ports: &[3000],
            script_name: "practice",
        },
        ServiceDef {
            id: "practiceApi",
            name: "Practice API",
            description: "Practice Manager API",
            ports: &[3001],
            script_name: "practice-api",
        },
        ServiceDef {
            id: "customsUi",
            name: "Customs UI",
            description: "Customs Manager frontend",
            ports: &[5173],
            script_name: "customs",
        },
        ServiceDef {
            id: "customsBackend",
            name: "Customs Backend",
            description: "Customs Manager backend API",
            ports: &[3100],
            script_name: "customs-backend",
        },
    ]
}

fn run_shell(script: &str, working_dir: &PathBuf) -> Result<String, String> {
    let output = Command::new("zsh")
        .arg("-lc")
        .arg(script)
        .current_dir(working_dir)
        .output()
        .map_err(|e| e.to_string())?;

    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).trim().to_string())
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr).to_string();
        Err(if stderr.is_empty() {
            "command failed".to_string()
        } else {
            stderr
        })
    }
}

fn pids_for_port(port: u16) -> Vec<u32> {
    let output = Command::new("zsh")
        .arg("-lc")
        .arg(format!("lsof -nP -t -iTCP:{port} -sTCP:LISTEN 2>/dev/null || true"))
        .output();

    match output {
        Ok(result) => String::from_utf8_lossy(&result.stdout)
            .lines()
            .filter_map(|line| line.trim().parse::<u32>().ok())
            .collect(),
        Err(_) => Vec::new(),
    }
}

fn stop_on_port(port: u16, root: &PathBuf) -> Result<(), String> {
    let cmd = format!(
        "PIDS=\"$(lsof -nP -t -iTCP:{port} -sTCP:LISTEN 2>/dev/null || true)\"; if [ -n \"$PIDS\" ]; then kill $PIDS || true; sleep 1; kill -9 $PIDS 2>/dev/null || true; fi"
    );
    run_shell(&cmd, root)?;
    Ok(())
}

fn start_service(service: &ServiceDef, root: &PathBuf) -> Result<(), String> {
    let log_name = service.id.replace(" ", "-").to_lowercase();
    let launch = format!(
        "set -e; \
         export PATH=\"/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH\"; \
         LATEST_NODE_BIN=\"$(ls -d \"$HOME\"/.nvm/versions/node/*/bin 2>/dev/null | sort -V | tail -n 1)\"; \
         if [ -n \"$LATEST_NODE_BIN\" ]; then export PATH=\"$LATEST_NODE_BIN:$PATH\"; fi; \
         if [ -f \"$HOME/.cargo/env\" ]; then . \"$HOME/.cargo/env\"; fi; \
         if [ -s \"$HOME/.nvm/nvm.sh\" ]; then . \"$HOME/.nvm/nvm.sh\"; nvm use --silent default >/dev/null 2>&1 || true; fi; \
         if command -v pnpm >/dev/null 2>&1; then PNPM='pnpm'; \
         elif command -v corepack >/dev/null 2>&1; then PNPM='corepack pnpm'; \
         else echo 'pnpm not found in PATH' >&2; exit 127; fi; \
         exec $PNPM {}",
        service.script_name
    );
    let command = format!(
        "nohup zsh -lc '{}' > /tmp/msuite-{log_name}.log 2>&1 &",
        launch.replace('\'', "'\\''")
    );
    run_shell(&command, root)?;
    Ok(())
}

fn stop_service(service: &ServiceDef, root: &PathBuf) -> Result<(), String> {
    for port in service.ports {
        stop_on_port(*port, root)?;
    }
    Ok(())
}

fn service_running(service: &ServiceDef) -> bool {
    service.ports.iter().any(|port| !pids_for_port(*port).is_empty())
}

fn find_service(id: &str) -> Result<ServiceDef, String> {
    services()
        .into_iter()
        .find(|s| s.id == id)
        .ok_or_else(|| format!("Unknown service id: {id}"))
}

#[tauri::command]
fn list_services() -> Vec<ServiceInfo> {
    services()
        .into_iter()
        .map(|s| ServiceInfo {
            id: s.id.to_string(),
            name: s.name.to_string(),
            description: s.description.to_string(),
            ports: s.ports.to_vec(),
        })
        .collect()
}

#[tauri::command]
fn service_status() -> Vec<ServiceStatus> {
    services()
        .into_iter()
        .map(|service| {
            let mut pids: Vec<u32> = Vec::new();
            for port in service.ports {
                pids.extend(pids_for_port(*port));
            }
            pids.sort_unstable();
            pids.dedup();

            ServiceStatus {
                id: service.id.to_string(),
                running: !pids.is_empty(),
                ports: service.ports.to_vec(),
                pids,
            }
        })
        .collect()
}

#[tauri::command]
fn port_status() -> Vec<PortInfo> {
    let mut ports = vec![3000_u16, 3001, 3100, 4000, 4174, 5173];
    ports.sort_unstable();
    ports.dedup();

    ports
        .into_iter()
        .map(|port| {
            let pids = pids_for_port(port);
            PortInfo {
                port,
                running: !pids.is_empty(),
                pids,
            }
        })
        .collect()
}

#[tauri::command]
fn service_action(service_id: String, action: String) -> Result<String, String> {
    let root = repo_root()?;
    let service = find_service(&service_id)?;

    match action.as_str() {
        "start" => {
            // Prevent duplicate starts: one service instance per configured port.
            if service_running(&service) {
                return Ok(format!("{} already running", service.id));
            }
            start_service(&service, &root)?;
        }
        "stop" => stop_service(&service, &root)?,
        "restart" => {
            stop_service(&service, &root)?;
            start_service(&service, &root)?;
        }
        _ => return Err(format!("Unknown action: {action}")),
    }

    Ok(format!("{} {} complete", service.id, action))
}

#[tauri::command]
fn suite_action(action: String) -> Result<String, String> {
    let root = repo_root()?;

    match action.as_str() {
        "start" => {
            for service in services() {
                if !service_running(&service) {
                    start_service(&service, &root)?;
                }
            }
        }
        "stop" => {
            for service in services() {
                stop_service(&service, &root)?;
            }
        }
        "restart" => {
            for service in services() {
                stop_service(&service, &root)?;
            }
            for service in services() {
                start_service(&service, &root)?;
            }
        }
        _ => return Err(format!("Unknown action: {action}")),
    }

    Ok(format!("suite {} complete", action))
}

#[tauri::command]
fn open_url(url: String) -> Result<String, String> {
    Command::new("open")
        .arg(&url)
        .spawn()
        .map_err(|e| e.to_string())?;
    Ok(format!("opened {url}"))
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            list_services,
            service_status,
            port_status,
            service_action,
            suite_action,
            open_url
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
