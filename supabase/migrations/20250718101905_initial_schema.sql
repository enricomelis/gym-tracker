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
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  "updated_at" timestamptz NOT NULL DEFAULT (now())
);

CREATE TABLE "presets_apparatus" (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
  "apparatus" apparatus_enum NOT NULL,
  "quantity" int NOT NULL DEFAULT 1,
  "execution_grade" excel_execution_grades DEFAULT 'A',
  "created_by" uuid REFERENCES coaches(id) ON DELETE SET NULL,
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  "updated_at" timestamptz NOT NULL DEFAULT (now())
);

CREATE TABLE "presets_weekdays" (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
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

CREATE TABLE "athlete_routines" (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
  "athlete_id" uuid REFERENCES athletes(id) ON DELETE SET NULL,
  "name" text NOT NULL DEFAULT '',
  "excel_volume" int,
  "notes" text,
  "created_by" uuid REFERENCES coaches(id) ON DELETE SET NULL,
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  "updated_at" timestamptz NOT NULL DEFAULT (now())
);

CREATE TABLE "presets_weekdays_sessions" (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
  "weekday_id" uuid REFERENCES presets_weekdays(id) ON DELETE SET NULL,
  "session_id" uuid REFERENCES presets_training_sessions(id) ON DELETE SET NULL,
  "session_number" int NOT NULL DEFAULT 1
);

CREATE TABLE "presets_microcycles_weekdays" (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
  "microcycle_id" uuid REFERENCES presets_microcycles(id) ON DELETE SET NULL,
  "weekday_id" uuid REFERENCES presets_weekdays(id) ON DELETE SET NULL,
  "day_number" int NOT NULL DEFAULT 1
);

CREATE TABLE "presets_macrocycles_microcycles" (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
  "macrocycle_id" uuid REFERENCES presets_macrocycles(id) ON DELETE SET NULL,
  "microcycle_id" uuid REFERENCES presets_microcycles(id) ON DELETE SET NULL,
  "week_number" int NOT NULL DEFAULT 1
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
  "routine_competed_id" uuid REFERENCES athlete_routines(id) ON DELETE SET NULL,
  "created_by" uuid REFERENCES coaches(id) ON DELETE SET NULL,
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  "updated_at" timestamptz NOT NULL DEFAULT (now())
);

CREATE UNIQUE INDEX ON "presets_weekdays_sessions" ("weekday_id", "session_number");

CREATE UNIQUE INDEX ON "presets_microcycles_weekdays" ("microcycle_id", "day_number");

CREATE UNIQUE INDEX ON "presets_macrocycles_microcycles" ("macrocycle_id", "week_number");

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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
  ELSIF NEW.raw_user_meta_data->>'role' = 'athlete' THEN
    IF NEW.raw_user_meta_data->>'registration_number' IS NULL THEN
      RAISE EXCEPTION 'Registration number is required for athlete registration';
    END IF;
    
    IF NEW.raw_user_meta_data->>'coach_id' IS NULL THEN
      RAISE EXCEPTION 'Coach ID is required for athlete registration';
    END IF;
    
    INSERT INTO public.athletes (
      supabase_id, 
      first_name, 
      last_name, 
      current_coach_id,
      registration_number,
      category
    )
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
      (NEW.raw_user_meta_data->>'coach_id')::uuid,
      (NEW.raw_user_meta_data->>'registration_number')::int,
      COALESCE((NEW.raw_user_meta_data->>'category')::category_enum, 'Junior')
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER update_coaches_updated_at BEFORE UPDATE ON coaches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_athletes_updated_at BEFORE UPDATE ON athletes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_presets_apparatus_updated_at BEFORE UPDATE ON presets_apparatus FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_presets_weekdays_updated_at BEFORE UPDATE ON presets_weekdays FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_presets_microcycles_updated_at BEFORE UPDATE ON presets_microcycles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_presets_macrocycles_updated_at BEFORE UPDATE ON presets_macrocycles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_competitions_updated_at BEFORE UPDATE ON competitions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_presets_training_sessions_updated_at BEFORE UPDATE ON presets_training_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_athlete_routines_updated_at BEFORE UPDATE ON athlete_routines FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_planning_macrocycles_updated_at BEFORE UPDATE ON planning_macrocycles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_planning_microcycles_updated_at BEFORE UPDATE ON planning_microcycles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_planning_training_sessions_updated_at BEFORE UPDATE ON planning_training_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_planning_apparatus_updated_at BEFORE UPDATE ON planning_apparatus FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_athletes_competitions_updated_at BEFORE UPDATE ON athletes_competitions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_athletes_competitions_routines_apparatus_updated_at BEFORE UPDATE ON athletes_competitions_routines_apparatus FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON COLUMN "coaches"."supabase_id" IS 'references auth.users';

COMMENT ON COLUMN "athletes"."supabase_id" IS 'references auth.users';