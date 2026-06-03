'use client';

import type { ReactNode } from 'react';
import { sendAnalyticsEvent } from './AnalyticsTracker';

type Props = {
  href: string;
  itemId: string;
  sourceType: string;
  theme: string;
  rankPosition?: number;
  children: ReactNode;
};

export function TrackedSourceLink({ href, itemId, sourceType, theme, rankPosition, children }: Props) {
  return (
    <a
      href={href}
      onClick={() => sendAnalyticsEvent({
        eventType: sourceType === 'job' ? 'job_click' : 'source_click',
        itemId,
        sourceType,
        theme,
        rankPosition,
        jobId: sourceType === 'job' ? itemId : undefined,
      })}
    >
      {children}
    </a>
  );
}
