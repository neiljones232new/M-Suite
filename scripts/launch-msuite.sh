#!/bin/zsh

# M-Suite Dock Launcher
# This script starts the M-Suite via LaunchAgent and opens the Portal

AGENT="com.msuite.dev"
PLIST="$HOME/Library/LaunchAgents/com.msuite.dev.plist"

# Stop any existing instance
launchctl bootout gui/$(id -u)/$AGENT 2>/dev/null

# Start the suite
launchctl bootstrap gui/$(id -u) $PLIST

# Wait for portal to be ready
echo "Waiting for M-Suite Portal..."
until curl -s http://localhost:4000 >/dev/null 2>&1; do
  sleep 0.5
done

# Open the portal
open http://localhost:4000
