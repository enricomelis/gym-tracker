BEGIN;

-- Create test societies first
INSERT INTO public.societies (name, city, region) VALUES
  ('AGL', 'Livorno', 'Toscana');

-- Create Enrico Melis as a coach user
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  invited_at,
  confirmation_token,
  confirmation_sent_at,
  recovery_token,
  recovery_sent_at,
  email_change_token_new,
  email_change,
  email_change_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  phone,
  phone_confirmed_at,
  phone_change,
  phone_change_token,
  phone_change_sent_at,
  email_change_token_current,
  email_change_confirm_status,
  banned_until,
  reauthentication_token,
  reauthentication_sent_at
) VALUES (
  gen_random_uuid(), -- This will be the supabase_id for the coach profile
  '00000000-0000-0000-0000-000000000000'::uuid,
  'authenticated',
  'authenticated',
  'enrico.melis.casa@gmail.com',
  crypt('dev', gen_salt('bf')),
  now(),
  NULL::timestamp,
  '',
  NULL::timestamp,
  '',
  NULL::timestamp,
  '',
  '',
  NULL::timestamp,
  now()::timestamp,
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"role":"coach","first_name":"Enrico","last_name":"Melis"}'::jsonb,
  false,
  now(),
  now(),
  NULL,
  NULL::timestamp,
  '',
  '',
  NULL::timestamp,
  '',
  0,
  NULL::timestamp,
  '',
  NULL::timestamp
);

-- Update coach profiles with society assignments
UPDATE public.coaches 
SET society_id = (
  SELECT id FROM public.societies 
  ORDER BY RANDOM() 
  LIMIT 1
)
WHERE society_id IS NULL;

-- Create 3 unauthenticated athletes with blank data for manual insertion
INSERT INTO public.athletes (supabase_id, current_coach_id, first_name, last_name, category, society_id, registration_number, is_active, birth_date) VALUES
  (NULL, (SELECT id FROM public.coaches LIMIT 1), 'Simone', 'Houriya', 'Senior'::category_enum, (SELECT id FROM public.societies ORDER BY RANDOM() LIMIT 1), 1001, true, '1997-03-31'),
  (NULL, (SELECT id FROM public.coaches LIMIT 1), 'Roberto', 'Biagietti', 'Senior'::category_enum, (SELECT id FROM public.societies ORDER BY RANDOM() LIMIT 1), 1002, true, '2001-01-07'),
  (NULL, (SELECT id FROM public.coaches LIMIT 1), 'Valerio', 'Leone', 'Senior'::category_enum, (SELECT id FROM public.societies ORDER BY RANDOM() LIMIT 1), 1003, true, '2003-06-14');

COMMIT;