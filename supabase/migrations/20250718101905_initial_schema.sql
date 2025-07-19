CREATE TYPE "category_enum" AS ENUM (
  'Allievi',
  'Junior',
  'Senior'
);

CREATE TYPE "excel_routine_type" AS ENUM (
  'I+',
  'Int',
  'Par',
  'Com',
  'Usc',
  'Std',
  'G',
  'S',
  'B',
  'D'
);

CREATE TYPE "apparatus_enum" AS ENUM (
  'FX',
  'PH',
  'SR',
  'VT',
  'PB',
  'HB'
);

CREATE TYPE "excel_execution_grades" AS ENUM (
  'A+',
  'A',
  'B+',
  'B',
  'C+',
  'C'
);

CREATE TABLE "societies" (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
  "name" text NOT NULL DEFAULT '',
  "city" text NOT NULL DEFAULT '',
  "region" text NOT NULL DEFAULT ''
);

CREATE TABLE "coaches" (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
  "supabase_id" uuid UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  "first_name" text NOT NULL DEFAULT '',
  "last_name" text NOT NULL DEFAULT '',
  "society_id" uuid REFERENCES societies(id) ON DELETE SET NULL,
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  "updated_at" timestamptz NOT NULL DEFAULT (now())
);

CREATE TABLE "athletes" (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
  "supabase_id" uuid UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  "current_coach_id" uuid REFERENCES coaches(id) ON DELETE SET NULL,
  "first_name" text NOT NULL DEFAULT '',
  "last_name" text NOT NULL DEFAULT '',
  "category" category_enum NOT NULL DEFAULT 'Junior',
  "society_id" uuid REFERENCES societies(id) ON DELETE SET NULL,
  "registration_number" int UNIQUE NOT NULL,
  "is_active" bool NOT NULL DEFAULT true,
  "birth_date" date,
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  "updated_at" timestamptz NOT NULL DEFAULT (now())
);

CREATE TABLE "presets_apparatus" (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
  "name" text NOT NULL,
  "apparatus" apparatus_enum NOT NULL,
  "quantity" int NOT NULL DEFAULT 1,
  "execution_grade" excel_execution_grades DEFAULT 'A',
  "base_volume" int,
  "created_by" uuid REFERENCES coaches(id) ON DELETE SET NULL,
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  "updated_at" timestamptz NOT NULL DEFAULT (now())
);

CREATE TABLE "presets_weekdays" (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
  "weekday_number" int NOT NULL,
  "name" text NOT NULL,
  "created_by" uuid REFERENCES coaches(id) ON DELETE SET NULL,
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  "updated_at" timestamptz NOT NULL DEFAULT (now())
);

CREATE TABLE "presets_microcycles" (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
  "name" text NOT NULL,
  "created_by" uuid REFERENCES coaches(id) ON DELETE SET NULL,
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  "updated_at" timestamptz NOT NULL DEFAULT (now())
);

CREATE TABLE "presets_macrocycles" (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
  "name" text NOT NULL,
  "length_in_weeks" int NOT NULL,
  "created_by" uuid REFERENCES coaches(id) ON DELETE SET NULL,
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  "updated_at" timestamptz NOT NULL DEFAULT (now())
);

CREATE TABLE "competitions" (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
  "name" text NOT NULL,
  "location" text NOT NULL,
  "date" date NOT NULL,
  "type" text,
  "created_by" uuid REFERENCES coaches(id) ON DELETE SET NULL,
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  "updated_at" timestamptz NOT NULL DEFAULT (now())
);

CREATE TABLE "presets_training_sessions" (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
  "name" text NOT NULL,
  "fx_preset_id" uuid REFERENCES presets_apparatus(id) ON DELETE SET NULL,
  "ph_preset_id" uuid REFERENCES presets_apparatus(id) ON DELETE SET NULL,
  "sr_preset_id" uuid REFERENCES presets_apparatus(id) ON DELETE SET NULL,
  "vt_preset_id" uuid REFERENCES presets_apparatus(id) ON DELETE SET NULL,
  "pb_preset_id" uuid REFERENCES presets_apparatus(id) ON DELETE SET NULL,
  "hb_preset_id" uuid REFERENCES presets_apparatus(id) ON DELETE SET NULL,
  "created_by" uuid REFERENCES coaches(id) ON DELETE SET NULL,
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  "updated_at" timestamptz NOT NULL DEFAULT (now())
);

CREATE TABLE "routines" (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
  "name" text NOT NULL DEFAULT '',
  "volume" int NOT NULL DEFAULT 0,
  "notes" text,
  "apparatus" apparatus_enum NOT NULL,
  "type" excel_routine_type NOT NULL,
  "created_by" uuid REFERENCES coaches(id) ON DELETE SET NULL,
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  "updated_at" timestamptz NOT NULL DEFAULT (now())
);

CREATE TABLE "athletes_routines" (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
  "athlete_id" uuid REFERENCES athletes(id) ON DELETE SET NULL,
  "routine_id" uuid REFERENCES routines(id) ON DELETE SET NULL,
  "created_by" uuid REFERENCES coaches(id) ON DELETE SET NULL,
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  "updated_at" timestamptz NOT NULL DEFAULT (now())
);

CREATE TABLE "presets_weekdays_sessions" (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
  "name" text NOT NULL,
  "weekday_id" uuid REFERENCES presets_weekdays(id) ON DELETE SET NULL,
  "session_id" uuid REFERENCES presets_training_sessions(id) ON DELETE SET NULL,
  "session_number" int NOT NULL DEFAULT 1,
  "created_by" uuid REFERENCES coaches(id) ON DELETE SET NULL,
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  "updated_at" timestamptz NOT NULL DEFAULT (now())
);

CREATE TABLE "presets_microcycles_weekdays" (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
  "name" text NOT NULL,
  "microcycle_id" uuid REFERENCES presets_microcycles(id) ON DELETE SET NULL,
  "weekday_id" uuid REFERENCES presets_weekdays(id) ON DELETE SET NULL,
  "day_number" int NOT NULL DEFAULT 1,
  "created_by" uuid REFERENCES coaches(id) ON DELETE SET NULL,
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  "updated_at" timestamptz NOT NULL DEFAULT (now())
);

CREATE TABLE "presets_macrocycles_microcycles" (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
  "name" text NOT NULL,
  "macrocycle_id" uuid REFERENCES presets_macrocycles(id) ON DELETE SET NULL,
  "microcycle_id" uuid REFERENCES presets_microcycles(id) ON DELETE SET NULL,
  "week_number" int NOT NULL DEFAULT 1,
  "created_by" uuid REFERENCES coaches(id) ON DELETE SET NULL,
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  "updated_at" timestamptz NOT NULL DEFAULT (now())
);

CREATE TABLE "planning_macrocycles" (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
  "athlete_id" uuid REFERENCES athletes(id) ON DELETE SET NULL,
  "created_by" uuid REFERENCES coaches(id) ON DELETE SET NULL,
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  "updated_at" timestamptz NOT NULL DEFAULT (now())
);

CREATE TABLE "planning_microcycles" (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
  "macrocycle_id" uuid REFERENCES planning_macrocycles(id) ON DELETE SET NULL,
  "athlete_id" uuid REFERENCES athletes(id) ON DELETE SET NULL,
  "created_by" uuid REFERENCES coaches(id) ON DELETE SET NULL,
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  "updated_at" timestamptz NOT NULL DEFAULT (now())
);

CREATE TABLE "planning_training_sessions" (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
  "session_number" int NOT NULL DEFAULT 1,
  "date" date NOT NULL,
  "microcycle_id" uuid REFERENCES planning_microcycles(id) ON DELETE SET NULL,
  "athlete_id" uuid REFERENCES athletes(id) ON DELETE SET NULL,
  "created_by" uuid REFERENCES coaches(id) ON DELETE SET NULL,
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  "updated_at" timestamptz NOT NULL DEFAULT (now())
);

CREATE TABLE "planning_apparatus" (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
  "training_session_id" uuid REFERENCES planning_training_sessions(id) ON DELETE SET NULL,
  "athlete_id" uuid REFERENCES athletes(id) ON DELETE SET NULL,
  "volume" int,
  "apparatus" apparatus_enum NOT NULL,
  "quantity" int NOT NULL DEFAULT 1,
  "execution_grade" excel_execution_grades DEFAULT 'A',
  "created_by" uuid REFERENCES coaches(id) ON DELETE SET NULL,
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  "updated_at" timestamptz NOT NULL DEFAULT (now())
);

CREATE TABLE "athletes_competitions" (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
  "athlete_id" uuid REFERENCES athletes(id) ON DELETE SET NULL,
  "competition_id" uuid REFERENCES competitions(id) ON DELETE SET NULL,
  "created_by" uuid REFERENCES coaches(id) ON DELETE SET NULL,
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  "updated_at" timestamptz NOT NULL DEFAULT (now())
);

CREATE TABLE "athletes_competitions_routines_apparatus" (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
  "athlete_competition_id" uuid REFERENCES athletes_competitions(id) ON DELETE SET NULL,
  "apparatus" apparatus_enum NOT NULL,
  "routine_competed_id" uuid REFERENCES athletes_routines(id) ON DELETE SET NULL,
  "created_by" uuid REFERENCES coaches(id) ON DELETE SET NULL,
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  "updated_at" timestamptz NOT NULL DEFAULT (now())
);

CREATE UNIQUE INDEX ON "presets_weekdays_sessions" ("weekday_id", "session_number");

CREATE UNIQUE INDEX ON "presets_microcycles_weekdays" ("microcycle_id", "day_number");

CREATE UNIQUE INDEX ON "presets_macrocycles_microcycles" ("macrocycle_id", "week_number");

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.raw_user_meta_data->>'role' = 'coach' THEN
    INSERT INTO public.coaches (supabase_id, first_name, last_name)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'last_name', '')
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

COMMENT ON COLUMN "coaches"."supabase_id" IS 'references auth.users';

COMMENT ON COLUMN "athletes"."supabase_id" IS 'references auth.users';