alter table public.microcycles_presets
    add column if not exists week_number int,
    add column if not exists year int;

alter table public.microcycles_presets
    add constraint microcycles_presets_week_year_unique unique (week_number, year);
