import { NextRequest, NextResponse } from 'next/server';
import { AnalyticsEventSchema } from '../../../lib/analytics';
import { insertAnalyticsEvent } from '../../../lib/analyticsDb';

export async function POST(request: NextRequest) {
  let payload: object;
  try {
    const body = await request.text();
    if (body.length > 8192) {
      return NextResponse.json({ ok: false, error: 'payload_too_large' }, { status: 413 });
    }
    payload = JSON.parse(body) as object;
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  const parsed = AnalyticsEventSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'invalid_event' }, { status: 400 });
  }

  try {
    await insertAnalyticsEvent(parsed.data);
  } catch {
    return NextResponse.json({ ok: false, error: 'write_failed' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
