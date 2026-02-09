# API Server Restart Required

## Issue

The Practice Manager API (port 3001) is returning 404 errors for all endpoints, including `/clients/1V001/with-parties`. This is causing the frontend to receive empty responses `{}`.

## Root Cause

The API server is running but hasn't loaded the updated code after we:
1. Updated `UpdateClientDto` and `CreateClientDto` interfaces
2. Rebuilt the API with `npm run build`
3. Regenerated the Prisma client

The server needs to be restarted to pick up these changes.

## Solution

Restart the Practice Manager API service:

### Option 1: Using pnpm (from workspace root)
```bash
# Stop the current API process (Ctrl+C if running in terminal)
# Then restart:
pnpm practice-api
```

### Option 2: Using npm (from API directory)
```bash
cd external/M-Practice-Manager/apps/api
npm run start:dev
```

### Option 3: Restart all services
```bash
# From workspace root
pnpm suite
```

## Verification

After restarting, verify the API is working:

```bash
# Test health endpoint (if available)
curl http://localhost:3001/health

# Test client endpoint
curl http://localhost:3001/clients/1V001/with-parties
```

You should see JSON data returned instead of 404 errors.

## What This Fixes

Once the API is restarted:
- ✅ Client detail pages will load properly
- ✅ Edit client page will be able to fetch client data
- ✅ Save functionality will work with all consolidated fields
- ✅ All API endpoints will respond correctly

## Next Steps

1. **Restart the API** using one of the methods above
2. **Refresh the browser** on the client detail page
3. **Test editing a client** to verify the save functionality works
4. **Verify data persists** by checking the client detail page after saving

The consolidation project is complete - this is just a deployment step to activate the changes.
