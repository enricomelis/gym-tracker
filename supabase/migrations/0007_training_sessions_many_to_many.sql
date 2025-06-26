-- Migrazione: relazione molti-a-molti tra athletes e training_sessions

CREATE TABLE athlete_training_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    athlete_id UUID NOT NULL REFERENCES athletes(id),
    training_session_id UUID NOT NULL REFERENCES training_sessions(id),
    UNIQUE (athlete_id, training_session_id)
);

INSERT INTO athlete_training_sessions (athlete_id, training_session_id)
SELECT athlete_id, id FROM training_sessions;

ALTER TABLE training_sessions DROP COLUMN athlete_id; 