-- Create custom enum types
CREATE TYPE category_enum AS ENUM ('Allievi', 'Junior', 'Senior');
CREATE TYPE competition_type_enum AS ENUM ('Individuale', 'Squadre');
CREATE TYPE apparatus_enum AS ENUM ('FX', 'PH', 'SR', 'VT', 'PB', 'HB');
CREATE TYPE execution_coefficient_enum AS ENUM ('A+', 'A', 'B+', 'B', 'C+', 'C');
CREATE TYPE macro_enum AS ENUM ('Mixed', 'Competition');
CREATE TYPE micro_enum AS ENUM ('Increasing Load', 'Decreasing Load', 'Model', 'Competition Week');
CREATE TYPE daily_routine_type_enum AS ENUM ('I+', 'I', 'P', 'C', 'U', 'Std', 'G', 'S', 'B', 'D');

-- Create societies table
CREATE TABLE societies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    region TEXT NOT NULL
);

-- Create coaches table
CREATE TABLE coaches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supabase_id UUID UNIQUE REFERENCES auth.users(id),
    society_id UUID REFERENCES societies(id),
    first_name VARCHAR NOT NULL,
    last_name VARCHAR NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- Create athletes table
CREATE TABLE athletes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supabase_id UUID UNIQUE REFERENCES auth.users(id),
    current_coach_id UUID NOT NULL REFERENCES coaches(id),
    registered_society_id UUID REFERENCES societies(id),
    first_name VARCHAR NOT NULL,
    last_name VARCHAR NOT NULL,
    date_of_birth DATE NOT NULL,
    registration_number INT NOT NULL UNIQUE,
    category category_enum NOT NULL
);

-- Create coaches_athletes join table
CREATE TABLE coaches_athletes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coach_id UUID NOT NULL REFERENCES coaches(id),
    athlete_id UUID NOT NULL REFERENCES athletes(id),
    start_date DATE NOT NULL,
    end_date DATE
);

-- Create competitions table
CREATE TABLE competitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    location TEXT NOT NULL,
    category TEXT NOT NULL
);

-- Create athletes_competitions join table
CREATE TABLE athletes_competitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    competition_id UUID NOT NULL REFERENCES competitions(id),
    athlete_id UUID NOT NULL REFERENCES athletes(id),
    apparatus_competed VARCHAR[] NOT NULL,
    type competition_type_enum NOT NULL
);

-- Create training_sessions table
CREATE TABLE training_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    athlete_id UUID NOT NULL REFERENCES athletes(id),
    week_number INT NOT NULL CHECK (week_number >= 1 AND week_number <= 52),
    year INT NOT NULL CHECK (year >= 2020 AND year <= 2100),
    date DATE NOT NULL,
    session_number INT NOT NULL CHECK (session_number >= 1),
    notes TEXT
);

-- Create apparatus_sessions table
CREATE TABLE apparatus_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    training_session_id UUID NOT NULL REFERENCES training_sessions(id),
    apparatus apparatus_enum NOT NULL,
    base_volume INT NOT NULL DEFAULT 0 CHECK (base_volume >= 0),
    total_time INT NOT NULL CHECK (total_time > 0),
    density NUMERIC,
    intensity_sets_count INT DEFAULT 0 CHECK (intensity_sets_count >= 0),
    total_volume INT,
    average_intensity NUMERIC CHECK (average_intensity >= 0),
    max_intensity NUMERIC CHECK (max_intensity >= 0)
);

-- Create training_sets table
CREATE TABLE training_sets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    apparatus_session_id UUID NOT NULL REFERENCES apparatus_sessions(id),
    set_number INT NOT NULL CHECK (set_number >= 1),
    volume_done INT NOT NULL CHECK (volume_done > 0),
    execution_coefficient execution_coefficient_enum,
    execution_penalty NUMERIC CHECK (execution_penalty >= 0 AND execution_penalty <= 10),
    falls INT NOT NULL DEFAULT 0 CHECK (falls >= 0),
    elements_done_number INT NOT NULL CHECK (elements_done_number > 0),
    intensity NUMERIC CHECK (intensity >= 0)
);

-- Create apparatus_weekly_goals table
CREATE TABLE apparatus_weekly_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    athlete_id UUID NOT NULL REFERENCES athletes(id),
    week_number INT NOT NULL CHECK (week_number >= 1 AND week_number <= 52),
    year INT NOT NULL CHECK (year >= 2020 AND year <= 2100),
    apparatus apparatus_enum NOT NULL,
    macro macro_enum NOT NULL,
    micro micro_enum NOT NULL,
    camp TEXT,
    competition_id UUID NOT NULL REFERENCES competitions(id),
    exercise_volume INT NOT NULL CHECK (exercise_volume > 0),
    dismount_volume INT NOT NULL CHECK (dismount_volume >= 0),
    target_penalty NUMERIC NOT NULL CHECK (target_penalty >= 0 AND target_penalty <= 10),
    base_volume INT CHECK (base_volume > 0)
);

-- Create daily_routines table
CREATE TABLE daily_routines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    athlete_id UUID NOT NULL REFERENCES athletes(id),
    session_id UUID NOT NULL REFERENCES training_sessions(id),
    apparatus apparatus_enum NOT NULL,
    type daily_routine_type_enum NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    target_sets INT NOT NULL CHECK (target_sets > 0),
    target_execution execution_coefficient_enum NOT NULL
);

-- Create weekly_goal_presets table
CREATE TABLE weekly_goal_presets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    apparatus apparatus_enum NOT NULL,
    macro macro_enum NOT NULL,
    micro micro_enum NOT NULL,
    exercise_volume INT NOT NULL,
    dismount_volume INT,
    target_penalty NUMERIC NOT NULL,
    base_volume INT,
    created_by UUID REFERENCES coaches(id)
);

-- Create daily_routine_presets table
CREATE TABLE daily_routine_presets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    apparatus apparatus_enum NOT NULL,
    type daily_routine_type_enum NOT NULL,
    quantity INT NOT NULL,
    target_sets INT NOT NULL,
    target_execution execution_coefficient_enum NOT NULL,
    created_by UUID REFERENCES coaches(id)
); 