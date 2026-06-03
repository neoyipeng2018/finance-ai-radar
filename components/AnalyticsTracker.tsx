'use client';

import { useEffect, useRef } from 'react';

type EventPayload = {
  eventType: string;
  itemId?: string;
  sourceType?: string;
  theme?: string;
  query?: string;
  rankPosition?: number;
  jobId?: string;
  roleFamily?: string;
  financeDomain?: string;
  location?: string;
  dwellMs?: number;
  scrollDepth?: number;
};

function storedId(key: string): string {
  const existing = localStorage.getItem(key);
  if (existing) return existing;
  const next = crypto.randomUUID();
  localStorage.setItem(key, next);
  return next;
}

export function sendAnalyticsEvent(event: EventPayload): void {
  const endpoint = process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT;
  if (!endpoint) return;

  const anonymousId = storedId('finance-ai-radar-anonymous-id');
  const sessionId = storedId('finance-ai-radar-session-id');
  const payload = JSON.stringify({
    anonymousId,
    sessionId,
    path: `${location.pathname}${location.hash}`,
    referrer: document.referrer,
    createdAt: new Date().toISOString(),
    ...event,
  });
  if (navigator.sendBeacon) {
    navigator.sendBeacon(endpoint, payload);
    return;
  }
  fetch(endpoint, { method: 'POST', body: payload, keepalive: true });
}

export function AnalyticsTracker() {
  const startedAt = useRef(0);
  const maxScroll = useRef(0);

  useEffect(() => {
    startedAt.current = Date.now();
    sendAnalyticsEvent({ eventType: 'page_view' });

    const onScroll = () => {
      const height = document.documentElement.scrollHeight - window.innerHeight;
      const pct = height <= 0 ? 100 : Math.round((window.scrollY / height) * 100);
      maxScroll.current = Math.max(maxScroll.current, Math.min(100, Math.max(0, pct)));
    };

    const onBeforeUnload = () => {
      sendAnalyticsEvent({
        eventType: 'session_end',
        dwellMs: Date.now() - startedAt.current,
        scrollDepth: maxScroll.current,
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('beforeunload', onBeforeUnload);
    };
  }, []);

  return null;
}
