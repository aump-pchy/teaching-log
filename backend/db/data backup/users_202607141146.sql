INSERT INTO public.users (email,password_hash,full_name,department_id,"role",created_at,is_approved,auth_id) VALUES
	 ('admin@loeitech.ac.th','$2b$10$oFCXQHe6NnXBm0vecZoKNu3RcUO/q6ka2BkOpRjXxFZ5SToX3gJ1O','ผู้ดูแลระบบ',1,'admin','2026-06-16 15:34:40.383842+07',true,'ff1f75c2-94a8-4926-9d48-41f66ae0a54f'::uuid),
	 ('pichaya.promla@gmail.com','$2b$10$Zc99b2J.zSd6S30gEMK48eOx9mfKNtlSg0cjRnD4W7gQM.d25i3nC','นายพิชญะ พรมลา',1,'teacher','2026-07-06 22:13:06.9291+07',true,'fcea01c0-4fe5-425e-84cb-28d5f31fd3fd'::uuid);
