-- Rendi tutte le colonne nullable tranne id, week_number e year in apparatus_weekly_goals
ALTER TABLE apparatus_weekly_goals
    ALTER COLUMN athlete_id DROP NOT NULL,
    ALTER COLUMN apparatus DROP NOT NULL,
    ALTER COLUMN macro DROP NOT NULL,
    ALTER COLUMN micro DROP NOT NULL,
    ALTER COLUMN camp DROP NOT NULL,
    ALTER COLUMN competition_id DROP NOT NULL,
    ALTER COLUMN exercise_volume DROP NOT NULL,
    ALTER COLUMN dismount_volume DROP NOT NULL,
    ALTER COLUMN target_penalty DROP NOT NULL,
    ALTER COLUMN base_volume DROP NOT NULL;
