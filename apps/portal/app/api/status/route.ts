import { NextResponse } from "next/server";

async function ping(url: string) {
  try {
    const res = await fetch(url, {
      method: "GET",
      cache: "no-store",
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function GET() {
  const practiceWeb = await ping("http://localhost:3000");
  const practiceApi = await ping("http://localhost:3001/api/v1/health");

  const customsUi = await ping("http://localhost:5173");
  const customsBackend = await ping("http://localhost:3100/health");

  return NextResponse.json({
    practiceWeb,
    practiceApi,
    customsUi,
    customsBackend,
  });
}
