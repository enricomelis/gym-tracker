CREATE TABLE training_sessions_presets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_by UUID NOT NULL REFERENCES coaches(id),
    week_day INT,
    fx_preset_id UUID REFERENCES daily_routine_presets(id),
    ph_preset_id UUID REFERENCES daily_routine_presets(id),
    sr_preset_id UUID REFERENCES daily_routine_presets(id),
    vt_preset_id UUID REFERENCES daily_routine_presets(id),
    pb_preset_id UUID REFERENCES daily_routine_presets(id),
    hb_preset_id UUID REFERENCES daily_routine_presets(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- boilerplate table for macrocycles presets
CREATE TABLE macrocycles_presets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_by UUID NOT NULL REFERENCES coaches(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE microcycles_presets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    allenamento_1 UUID REFERENCES training_sessions_presets(id),
    allenamento_2 UUID REFERENCES training_sessions_presets(id),
    allenamento_3 UUID REFERENCES training_sessions_presets(id),
    allenamento_4 UUID REFERENCES training_sessions_presets(id),
    allenamento_5 UUID REFERENCES training_sessions_presets(id),
    allenamento_6 UUID REFERENCES training_sessions_presets(id),
    allenamento_7 UUID REFERENCES training_sessions_presets(id),
    macrocycle_id UUID REFERENCES macrocycles_presets(id),
    created_by UUID NOT NULL REFERENCES coaches(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
