-- nuova tabella per la creazione di esercizi per ogni atleta

create table athlete_routines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    athlete_id UUID REFERENCES athletes(id),
    routine_name TEXT NOT NULL,
    routine_volume INT NOT NULL,
    routine_notes TEXT NOT NULL,
    apparatus apparatus_enum NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);