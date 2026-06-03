'use client';

import { sendAnalyticsEvent } from './AnalyticsTracker';

export function NewsletterBox() {
  return (
    <div className="newsletter">
      <input
        aria-label="Email"
        placeholder="you@fund.com — get the weekly AI finance brief"
        onFocus={() => sendAnalyticsEvent({ eventType: 'newsletter_focus' })}
      />
      <button onClick={() => sendAnalyticsEvent({ eventType: 'newsletter_submit' })}>Join the brief</button>
    </div>
  );
}
