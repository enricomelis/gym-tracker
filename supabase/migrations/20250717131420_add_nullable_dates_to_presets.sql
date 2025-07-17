alter table public.daily_routine_presets
    add column if not exists data date;

alter table public.microcycles_presets
    add column if not exists week_number int,
    add column if not exists year int;

