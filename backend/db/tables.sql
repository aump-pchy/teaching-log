-- public.academic_terms definition

-- Drop table

-- DROP TABLE public.academic_terms;

CREATE TABLE public.academic_terms (
	id int8 GENERATED ALWAYS AS IDENTITY( INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START 1 CACHE 1 NO CYCLE) NOT NULL,
	term text NOT NULL,
	academic_year text NOT NULL,
	created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
	CONSTRAINT academic_terms_pkey PRIMARY KEY (id)
);


-- public.departments definition

-- Drop table

-- DROP TABLE public.departments;

CREATE TABLE public.departments (
	id serial4 NOT NULL,
	code varchar NOT NULL,
	"name" text NOT NULL,
	created_at timestamptz DEFAULT now() NULL,
	"headerName" text NULL,
	CONSTRAINT departments_code_key UNIQUE (code),
	CONSTRAINT departments_pkey PRIMARY KEY (id)
);


-- public.system_settings definition

-- Drop table

-- DROP TABLE public.system_settings;

CREATE TABLE public.system_settings (
	id int8 DEFAULT 1 NOT NULL,
	term text NOT NULL,
	academic_year text NOT NULL,
	head_curriculum text NOT NULL,
	deputy_academic text NOT NULL,
	director text NOT NULL,
	updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
	CONSTRAINT system_settings_pkey PRIMARY KEY (id)
);


-- public.users definition

-- Drop table

-- DROP TABLE public.users;

CREATE TABLE public.users (
	id serial4 NOT NULL,
	email varchar NOT NULL,
	password_hash text NOT NULL,
	full_name text NOT NULL,
	department_id int4 NULL,
	"role" varchar DEFAULT 'teacher'::character varying NOT NULL,
	created_at timestamptz DEFAULT now() NULL,
	is_approved bool DEFAULT false NULL,
	auth_id uuid NULL,
	CONSTRAINT users_email_key UNIQUE (email),
	CONSTRAINT users_pkey PRIMARY KEY (id),
	CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['teacher'::character varying, 'admin'::character varying])::text[]))),
	CONSTRAINT users_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id)
);


-- public.teaching_logs definition

-- Drop table

-- DROP TABLE public.teaching_logs;

CREATE TABLE public.teaching_logs (
	id serial4 NOT NULL,
	user_id int4 NOT NULL,
	semester varchar DEFAULT '1/2569'::character varying NOT NULL,
	week int4 NOT NULL,
	date_from text NOT NULL,
	date_to text NOT NULL,
	subject_name text NOT NULL,
	subject_code varchar NOT NULL,
	topic text NOT NULL,
	attendance jsonb DEFAULT '[]'::jsonb NOT NULL,
	methods jsonb DEFAULT '{}'::jsonb NOT NULL,
	content_methods jsonb DEFAULT '{}'::jsonb NOT NULL,
	media jsonb DEFAULT '{}'::jsonb NOT NULL,
	apps jsonb DEFAULT '{}'::jsonb NOT NULL,
	evaluation jsonb DEFAULT '{}'::jsonb NOT NULL,
	outcome_cognitive text NULL,
	outcome_psychomotor text NULL,
	outcome_affective text NULL,
	outcome_application text NULL,
	problem text NULL,
	solution text NULL,
	created_at timestamptz DEFAULT now() NULL,
	updated_at timestamptz DEFAULT now() NULL,
	head_curriculum varchar NULL,
	deputy_academic varchar NULL,
	director varchar NULL,
	teaching_date text NULL,
	CONSTRAINT teaching_logs_pkey PRIMARY KEY (id),
	CONSTRAINT teaching_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);


-- public.teaching_log_images definition

-- Drop table

-- DROP TABLE public.teaching_log_images;

CREATE TABLE public.teaching_log_images (
	id serial4 NOT NULL,
	log_id int4 NOT NULL,
	storage_path text NOT NULL,
	caption text NULL,
	"section" varchar DEFAULT 'other'::character varying NULL,
	sort_order int4 DEFAULT 0 NULL,
	uploaded_at timestamptz DEFAULT now() NULL,
	CONSTRAINT teaching_log_images_pkey PRIMARY KEY (id),
	CONSTRAINT teaching_log_images_section_check CHECK (((section)::text = ANY ((ARRAY['format'::character varying, 'method'::character varying, 'media'::character varying, 'app_eval'::character varying, 'other'::character varying])::text[]))),
	CONSTRAINT teaching_log_images_log_id_fkey FOREIGN KEY (log_id) REFERENCES public.teaching_logs(id) ON DELETE CASCADE
);