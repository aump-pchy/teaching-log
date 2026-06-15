# Teaching Log — ระบบบันทึกการจัดการเรียนการสอน

ระบบสำหรับครูกรอกแบบบันทึกการจัดการเรียนการสอนรายวิชาในสถานประกอบการ ภาคเรียนที่ 1/2569  
วิทยาลัยเทคนิคเลย

---

## Stack

| Layer | Tech |
|---|---|
| Frontend | Vue 3 + Vite + Tailwind CSS + Pinia |
| Backend | Node.js + Express |
| Database | Supabase (PostgreSQL) |
| Storage | Supabase Storage (รูปภาพหลักฐาน) |
| Auth | JWT (manual — bcrypt + jsonwebtoken) |

---

## โครงสร้างโปรเจกต์

```
teaching-log/
├── frontend/          ← Vue 3
│   └── src/
│       ├── views/     ← หน้าต่างๆ
│       ├── components/
│       ├── router/    ← Vue Router
│       └── stores/    ← Pinia (auth store)
├── backend/           ← Node.js + Express
│   ├── routes/        ← API routes
│   ├── middleware/    ← auth.js (JWT)
│   └── db/            ← supabase.js client
└── README.md
```

---

## การแบ่งงาน (Feature Branch)

| Branch | ความรับผิดชอบ |
|---|---|
| `feature/auth-users` | LoginView, UserManageView, `/api/auth/*`, `/api/users/*`, `/api/departments` |
| `feature/log-form` | LogFormView (กรอก + upload รูป), `POST /api/logs`, `POST /api/logs/:id/images` |
| `feature/log-list` | LogListView (ตาราง + filter แผนก), `GET /api/logs` |
| `feature/log-detail` | LogDetailView (preview + PDF), `GET /api/logs/:id`, image endpoints |

---

## เริ่มต้น

### 1. Clone repo

```bash
git clone https://github.com/aump-pchy/teaching-log.git
cd teaching-log
```

### 2. Setup Backend

```bash
cd backend
cp .env.example .env
# แก้ไข .env ใส่ SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, JWT_SECRET
npm install
npm run dev
```

### 3. Setup Frontend

```bash
cd frontend
cp .env.example .env
# แก้ไข VITE_API_URL ให้ตรงกับ backend
npm install
npm run dev
```

---

## Database Schema

```
departments         (id, code, name)
    ↑
  users             (id, email, password_hash, full_name, department_id, role)
    ↓
teaching_logs       (id, user_id, week, subject_*, attendance JSONB, methods JSONB, ...)
    ↓
teaching_log_images (id, log_id, storage_path, caption, section, sort_order)
```

> รายละเอียด SQL ดูได้ที่ [Supabase Setup](#supabase-setup)

---

## Supabase Setup

รัน SQL ใน Supabase SQL Editor ตามลำดับ:

1. `departments` table
2. `users` table
3. `teaching_logs` table
4. `teaching_log_images` table
5. `update_updated_at` trigger
6. สร้าง Storage Bucket ชื่อ `teaching-log-images` (Public: false)

---

## Git Workflow

```bash
# checkout branch ของตัวเอง
git checkout feature/auth-users   # หรือ log-form / log-list / log-detail

# ทำงาน แล้ว commit
git add .
git commit -m "feat: เพิ่ม login form"

# push ขึ้น remote
git push origin feature/auth-users

# เมื่อพร้อม → เปิด Pull Request เข้า main
```

### กติกา commit message

```
feat:   เพิ่ม feature ใหม่
fix:    แก้ bug
style:  แก้ UI/CSS
refactor: ปรับโค้ดโดยไม่เปลี่ยน logic
docs:   แก้เอกสาร
```

---

## Permission

| | admin | teacher |
|---|---|---|
| ดู log ทุกคน | ✅ | ❌ |
| ดู log ตัวเอง | ✅ | ✅ |
| สร้าง/แก้ไข log | ✅ | ✅ (เฉพาะตัวเอง) |
| จัดการ users | ✅ | ❌ |
| filter by แผนก | ✅ | ❌ |
