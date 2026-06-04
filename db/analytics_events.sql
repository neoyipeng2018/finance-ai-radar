create table if not exists analytics_events (
  id bigserial primary key,
  event_type text not null,
  anonymous_id text not null,
  session_id text not null,
  path text not null,
  item_id text,
  source_type text,
  theme text,
  query text,
  date_window text,
  custom_days integer,
  rank_position integer,
  job_id text,
  role_family text,
  finance_domain text,
  location text,
  dwell_ms integer,
  scroll_depth integer,
  referrer text,
  created_at timestamptz not null
);

create index if not exists analytics_events_created_at_idx on analytics_events (created_at);
create index if not exists analytics_events_event_type_idx on analytics_events (event_type);
create index if not exists analytics_events_session_id_idx on analytics_events (session_id);
