# M-Suite Control Plane Setup

This guide will help you set up the M-Suite Control Plane for seamless Dock-based launching and service management.

## Quick Setup

### 1. Install the LaunchAgent

```bash
# Copy the plist to LaunchAgents directory
cp com.msuite.dev.plist ~/Library/LaunchAgents/

# Update the WorkingDirectory path if needed
# Edit ~/Library/LaunchAgents/com.msuite.dev.plist and change:
# /Users/neiljones/Developer/M_Suite
# to your actual M-Suite directory path
```

### 2. Create Dock Launcher

```bash
# Make the launch script executable (already done)
chmod +x scripts/launch-msuite.sh

# Create an app bundle for the Dock
mkdir -p ~/Applications/M-Suite.app/Contents/MacOS
cp scripts/launch-msuite.sh ~/Applications/M-Suite.app/Contents/MacOS/M-Suite
chmod +x ~/Applications/M-Suite.app/Contents/MacOS/M-Suite

# Drag ~/Applications/M-Suite.app to your Dock
```

### 3. Test the Setup

```bash
# Start the suite
./scripts/launch-msuite.sh

# Or use launchctl directly
launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/com.msuite.dev.plist

# Check status
launchctl print gui/$(id -u)/com.msuite.dev

# Stop the suite
launchctl bootout gui/$(id -u)/com.msuite.dev
```

## Features

### Portal Control Panel

The Portal (http://localhost:4000) provides:

- **Live Service Health** - Real-time status of all services
- **Start/Stop/Restart** - Control the entire suite
- **Logs Viewer** - View suite logs in real-time
- **Offline Mode** - Graceful handling when services are down

### API Endpoints

- `POST /api/suite/start` - Start all services
- `POST /api/suite/stop` - Stop all services  
- `POST /api/suite/restart` - Restart all services
- `GET /api/logs?lines=100` - Get recent log lines

### Service Health Monitoring

The Portal monitors these services:

- **Practice Web UI** (port 3000)
- **Practice API** (port 3001)
- **Customs UI** (port 5173)
- **Customs Backend** (port 3100)

## LaunchAgent Configuration

The `com.msuite.dev.plist` includes:

- **KeepAlive** - Restarts on crash, stays stopped when manually stopped
- **ThrottleInterval** - 5 second delay between restart attempts
- **WorkingDirectory** - Ensures correct context for pnpm commands
- **Logging** - Outputs to `/tmp/msuite.log`

## Troubleshooting

### Services won't start

```bash
# Check the logs
tail -f /tmp/msuite.log

# Verify LaunchAgent is loaded
launchctl list | grep msuite

# Manually test the command
cd ~/Developer/M_Suite
pnpm suite
```

### Portal shows services as down

- Wait 10-15 seconds for services to fully start
- Check individual service logs
- Verify ports aren't already in use

### LaunchAgent won't load

```bash
# Validate the plist
plutil -lint ~/Library/LaunchAgents/com.msuite.dev.plist

# Check for errors
launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/com.msuite.dev.plist
```

## Architecture

```
┌─────────────────────────────────────────┐
│         Dock Icon / Launcher            │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│         LaunchAgent (macOS)             │
│      com.msuite.dev.plist               │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│         pnpm suite (concurrently)       │
└──────────────┬──────────────────────────┘
               │
       ┌───────┴───────┬───────────┬───────┐
       ▼               ▼           ▼       ▼
   Portal         Practice     Customs  Customs
  (4000)        Web+API      UI       Backend
              (3000/3001)   (5173)    (3100)
```

## Next Steps

1. **Add Service-Level Control** - Individual service start/stop
2. **Enhanced Logging** - Per-service log streams
3. **Auto-Recovery** - Intelligent restart policies
4. **Notifications** - macOS notifications for service events
5. **Performance Metrics** - CPU/Memory monitoring

## Development

To modify the control plane:

```bash
# Edit Portal routes
cd apps/portal/app/api/suite

# Test changes
pnpm -C apps/portal dev

# Rebuild Portal
pnpm -C apps/portal build
```
