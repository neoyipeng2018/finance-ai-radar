import { NextRequest, NextResponse } from 'next/server';
import { AnalyticsEventSchema } from '../../../lib/analytics';
import { appendAnalyticsEvent } from '../../../lib/analyticsStore';

export async function POST(request: NextRequest) {
  const text = await request.text();
  const payload: object = JSON.parse(text);
  const parsed = AnalyticsEventSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  appendAnalyticsEvent(parsed.data);
  return NextResponse.json({ ok: true });
}
