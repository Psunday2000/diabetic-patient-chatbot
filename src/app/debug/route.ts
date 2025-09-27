import { NextResponse } from 'next/server';
import { readDebug } from '@/lib/debug-log';

export async function GET() {
  try {
    const body = readDebug() || 'No debug logs yet.';
    return NextResponse.json({ ok: true, logs: body });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) });
  }
}
