-- 业务表 — 业务侧镜像 Flowable 任务到本地(便于业务状态同步,L4 用)
-- 本期先建表,L4 接入时填充/读取
create table if not exists public.workflow_bridge (
  business_key      text primary key,
  process_instance  text not null,
  process_def_key   text not null,
  business_type     text,
  current_status    text not null default 'in_review',
  last_task_id      text,
  last_action       text,
  last_actor        text,
  started_by        text,
  started_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

create index if not exists workflow_bridge_business_type_idx
  on public.workflow_bridge (business_type);
create index if not exists workflow_bridge_status_idx
  on public.workflow_bridge (current_status);
