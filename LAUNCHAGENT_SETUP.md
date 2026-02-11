# M-Suite LaunchAgent Setup

This guide explains how to set up the macOS LaunchAgent for M-Suite to enable system-level control via the Portal UI.

## Prerequisites

- macOS system
- M-Suite installed in your home directory
- pnpm installed and configured

## Setup Instructions

### 1. Create Your Personal LaunchAgent File

Copy the example file and customize it for your system:

```bash
cp com.msuite.dev.plist.example com.msuite.dev.plist
```

### 2. Update Paths in the File

Edit `com.msuite.dev.plist` and replace the following placeholders:

- `$HOME/Developer/M_Suite` → Your actual M-Suite installation path
- `$HOME/.nvm/versions/node/v22.22.0/bin` → Your actual Node.js path

Example:
```xml
<key>WorkingDirectory</key>
<string>/Users/yourname/Developer/M_Suite</string>

<key>PATH</key>
<string>/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:/Users/yourname/.nvm/versions/node/v22.22.0/bin</string>
```

### 3. Install the LaunchAgent

Copy your customized plist to the LaunchAgents directory:

```bash
cp com.msuite.dev.plist ~/Library/LaunchAgents/
```

### 4. Load the LaunchAgent

```bash
launchctl load ~/Library/LaunchAgents/com.msuite.dev.plist
```

### 5. Test from Portal

1. Start the Portal: `pnpm portal`
2. Open http://localhost:4000
3. Use the Start/Stop/Restart buttons to control the M-Suite services

## Uninstall

To remove the LaunchAgent:

```bash
launchctl unload ~/Library/LaunchAgents/com.msuite.dev.plist
rm ~/Library/LaunchAgents/com.msuite.dev.plist
```

## Troubleshooting

### Services won't start
- Check logs: `tail -f /tmp/msuite.log`
- Verify paths in the plist file are correct
- Ensure pnpm is in your PATH

### Permission denied
- Make sure the plist file is in `~/Library/LaunchAgents/` (user directory)
- Check file permissions: `chmod 644 ~/Library/LaunchAgents/com.msuite.dev.plist`

### Changes not taking effect
After modifying the plist file:
```bash
launchctl unload ~/Library/LaunchAgents/com.msuite.dev.plist
cp com.msuite.dev.plist ~/Library/LaunchAgents/
launchctl load ~/Library/LaunchAgents/com.msuite.dev.plist
```

## Notes

- The `com.msuite.dev.plist` file is personal to your system and should NOT be committed to git
- Always use the `.example` file as a template for new setups
- The Portal API automatically uses `$HOME` variable to find the plist in your user directory
