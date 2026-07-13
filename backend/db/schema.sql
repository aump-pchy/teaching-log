-- Teaching Log Schema
-- วิทยาลัยเทคนิคเลย

CREATE TABLE IF NOT EXISTS public.departments (
  id SERIAL PRIMARY KEY,
  code character varying NOT NULL UNIQUE,
  name text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  "headerName" text
);

CREATE TABLE IF NOT EXISTS public.users (
  id SERIAL PRIMARY KEY,
  email character varying NOT NULL UNIQUE,
  password_hash text NOT NULL,
  full_name text NOT NULL,
  department_id integer REFERENCES public.departments(id),
  role character varying NOT NULL DEFAULT 'teacher'
    CHECK (role IN ('teacher', 'admin')),
  created_at timestamp with time zone DEFAULT now(),
  is_approved boolean DEFAULT false,
  auth_id uuid
);

CREATE TABLE IF NOT EXISTS public.teaching_logs (
  id SERIAL PRIMARY KEY,
  user_id integer NOT NULL REFERENCES public.users(id),
  semester character varying NOT NULL DEFAULT '1/2569',
  week integer NOT NULL,
  date_from text NOT NULL,
  date_to text NOT NULL,
  subject_name text NOT NULL,
  subject_code character varying NOT NULL,
  topic text NOT NULL,
  attendance jsonb NOT NULL DEFAULT '[]',
  methods jsonb NOT NULL DEFAULT '{}',
  content_methods jsonb NOT NULL DEFAULT '{}',
  media jsonb NOT NULL DEFAULT '{}',
  apps jsonb NOT NULL DEFAULT '{}',
  evaluation jsonb NOT NULL DEFAULT '{}',
  outcome_cognitive text,
  outcome_psychomotor text,
  outcome_affective text,
  outcome_application text,
  problem text,
  solution text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  head_curriculum character varying,
  deputy_academic character varying,
  director character varying
);

CREATE TABLE IF NOT EXISTS public.teaching_log_images (
  id SERIAL PRIMARY KEY,
  log_id integer NOT NULL REFERENCES public.teaching_logs(id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  caption text,
  section character varying DEFAULT 'other'
    CHECK (section IN ('format','method','media','app_eval','other')),
  sort_order integer DEFAULT 0,
  uploaded_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.system_settings (
  id bigint NOT NULL DEFAULT 1,
  term text NOT NULL,
  academic_year text NOT NULL,
  head_curriculum text NOT NULL,
  deputy_academic text NOT NULL,
  director text NOT NULL,
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT system_settings_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.academic_terms (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  term text NOT NULL,
  academic_year text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc', now())
);

-- seed system_settings
INSERT INTO public.system_settings (id, term, academic_year, head_curriculum, deputy_academic, director)
VALUES (1, '1', '2569', 'นายประจิตร์ เลขตะระโก', 'ว่าที่ร้อยตรีชัชวาลย์ ป้อมสุวรรณ', 'นายศุภกฤต แกมนิรัตน์')
ON CONFLICT (id) DO NOTHING;