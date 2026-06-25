create table content_overlays (
  id          uuid primary key default gen_random_uuid(),
  hook        text not null,
  body        text not null,
  caption     text not null,
  cta         text not null,
  style       char(1) not null check (style in ('A','B','C','D')),
  style_label text not null,
  used_at     timestamptz,
  post_id     uuid references content_posts(id),
  created_at  timestamptz default now()
);

create index content_overlays_unused_idx on content_overlays(created_at) where used_at is null;

alter table content_overlays enable row level security;

create policy "admin_only" on content_overlays
  for all using (auth.role() = 'authenticated');
