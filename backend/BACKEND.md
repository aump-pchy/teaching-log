# Teaching Log — Backend Documentation

Node.js + Express + Supabase  
วิทยาลัยเทคนิคเลย ภาคเรียนที่ 1/2569

---

## โครงสร้างโฟลเดอร์

```
backend/
├── index.js                  ← entry point, mount routes ทั้งหมด
├── package.json
├── .env                      ← ไม่ commit! (ดู .env.example)
├── .env.example
├── db/
│   └── supabase.js           ← Supabase client (ใช้ร่วมกันทุกไฟล์)
├── middleware/
│   └── auth.js               ← JWT verify + adminOnly
├── controllers/
│   ├── authController.js     ← login, logout
│   ├── userController.js     ← CRUD users
│   ├── departmentController.js ← CRUD departments
│   └── logController.js      ← CRUD logs + upload images
└── routes/
    ├── auth.js
    ├── users.js
    ├── departments.js
    └── logs.js
```

---

## Environment Variables

```env
PORT=3000
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=your-jwt-secret
```

> หา `SUPABASE_URL` และ `SUPABASE_SERVICE_ROLE_KEY` ได้ที่  
> Supabase Dashboard → Project Settings → API

---

## Authentication

ระบบใช้ **JWT (JSON Web Token)** แบบ stateless

### Flow การ Login

```
Client                        Server
  │                              │
  │── POST /api/auth/login ──►  │
  │   { email, password }        │
  │                              │── query user จาก DB
  │                              │── bcrypt.compare(password, hash)
  │                              │── jwt.sign({ id, email, role })
  │◄── { token, user } ─────── │
  │                              │
  │── GET /api/logs ──────────► │  Authorization: Bearer <token>
  │                              │── authMiddleware verify token
  │◄── [ logs ] ─────────────── │
```

### การใช้ Middleware

```js
const { authMiddleware, adminOnly } = require('../middleware/auth')

// ต้อง login เท่านั้น
router.get('/', authMiddleware, controller.getAll)

// ต้องเป็น admin เท่านั้น
router.post('/', authMiddleware, adminOnly, controller.create)
```

### ข้อมูลใน Token (req.user)

```js
{
  id: 1,
  email: "aump@loeitc.ac.th",
  role: "teacher"   // หรือ "admin"
}
```

---

## API Endpoints

### Auth

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/api/auth/login` | Public | เข้าสู่ระบบ รับ JWT token |
| POST | `/api/auth/logout` | Auth | ออกจากระบบ |

**Request — Login:**
```json
{
  "email": "aump@loeitc.ac.th",
  "password": "password123"
}
```

**Response — Login:**
```json
{
  "token": "eyJhbGci...",
  "user": {
    "id": 2,
    "email": "aump@loeitc.ac.th",
    "full_name": "นายอัมพร พชรกุล",
    "role": "teacher",
    "department_id": 1
  }
}
```

---

### Departments

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/api/departments` | Auth | ดูแผนกทั้งหมด |
| POST | `/api/departments` | Admin | สร้างแผนกใหม่ |
| PUT | `/api/departments/:id` | Admin | แก้ไขแผนก |
| DELETE | `/api/departments/:id` | Admin | ลบแผนก |

**Response — GET /api/departments:**
```json
[
  { "id": 1, "code": "IT", "name": "เทคโนโลยีสารสนเทศ" },
  { "id": 2, "code": "AI", "name": "เทคโนโลยี AI" }
]
```

---

### Users

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/api/users` | Admin | ดู user ทั้งหมด |
| GET | `/api/users/:id` | Admin | ดู user คนเดียว |
| POST | `/api/users` | Admin | สร้าง user ใหม่ |
| PUT | `/api/users/:id` | Admin | แก้ไข user |
| DELETE | `/api/users/:id` | Admin | ลบ user |

**Request — POST /api/users:**
```json
{
  "email": "teacher@loeitc.ac.th",
  "password": "password123",
  "full_name": "นายทดสอบ ระบบ",
  "department_id": 1,
  "role": "teacher"
}
```

> ⚠️ Response จะ **ไม่มี** `password_hash` เด็ดขาด

---

### Teaching Logs

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/api/logs` | Auth | ดู log (teacher=ตัวเอง, admin=ทุกคน) |
| GET | `/api/logs?dept=IT` | Admin | filter by แผนก |
| GET | `/api/logs/:id` | Auth | ดู log เดี่ยว พร้อม images |
| POST | `/api/logs` | Auth | สร้าง log ใหม่ |
| PUT | `/api/logs/:id` | Auth | แก้ไข log (เจ้าของเท่านั้น) |
| DELETE | `/api/logs/:id` | Auth | ลบ log (เจ้าของ/admin) |

**Request — POST /api/logs:**
```json
{
  "week": 1,
  "date_from": "2 มิถุนายน",
  "date_to": "6 มิถุนายน",
  "subject_name": "การพัฒนาเว็บแอปพลิเคชัน",
  "subject_code": "21901-2003",
  "topic": "HTML5 เบื้องต้น",
  "attendance": [
    {
      "day": "จันทร์ 2 มิ.ย.",
      "period": "1-2",
      "time": "08:00-09:50",
      "total": 30,
      "attended": 28,
      "pct": 93.3,
      "issue": "-"
    }
  ],
  "methods": { "onsite": true },
  "content_methods": { "lecture": true, "demo": true },
  "media": { "ppt": true, "worksheet": true },
  "apps": { "googleClassroom": true },
  "evaluation": { "pretest": true, "posttest": true },
  "outcome_cognitive": "นักศึกษาเข้าใจโครงสร้าง HTML5",
  "outcome_psychomotor": "สร้างหน้าเว็บเบื้องต้นได้",
  "outcome_affective": "ตั้งใจเรียนและซักถาม",
  "outcome_application": "สร้างหน้าแนะนำตัวเองได้",
  "problem": "-",
  "solution": "-"
}
```

---

### Images

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/api/logs/:id/images` | Auth | upload รูปหลักฐาน |
| GET | `/api/logs/:id/images` | Auth | ดูรูปทั้งหมดของ log |
| DELETE | `/api/logs/:id/images/:imgId` | Auth | ลบรูป |

**Request — POST /api/logs/:id/images:**
```
Content-Type: multipart/form-data

file: [image file]
caption: "ภาพการสอนในห้องเรียน"
section: "method"   ← method | content | media | app | evaluation | other
```

**Response — GET /api/logs/:id/images:**
```json
[
  {
    "id": 1,
    "log_id": 5,
    "storage_path": "logs/5/1717123456_photo.jpg",
    "signed_url": "https://xxx.supabase.co/storage/v1/...",
    "caption": "ภาพการสอน",
    "section": "method",
    "sort_order": 0
  }
]
```

> ⚠️ **บังคับ upload อย่างน้อย 1 รูป** ก่อนที่ log จะถือว่าสมบูรณ์

---

## Permission Matrix

| Action | Teacher | Admin |
|--------|---------|-------|
| Login/Logout | ✅ | ✅ |
| ดู log ตัวเอง | ✅ | ✅ |
| ดู log ทุกคน | ❌ | ✅ |
| Filter by แผนก | ❌ | ✅ |
| สร้าง/แก้ไข log ตัวเอง | ✅ | ✅ |
| ลบ log ตัวเอง | ✅ | ✅ |
| ลบ log คนอื่น | ❌ | ✅ |
| จัดการ users | ❌ | ✅ |
| จัดการ departments | ❌ | ✅ |

---

## Error Response Format

ทุก error ใช้รูปแบบเดียวกัน:

```json
{
  "error": "ข้อความอธิบายข้อผิดพลาด"
}
```

| Status Code | ความหมาย |
|-------------|---------|
| 200 | สำเร็จ |
| 201 | สร้างข้อมูลสำเร็จ |
| 400 | ข้อมูลไม่ถูกต้อง |
| 401 | ยังไม่ได้ login หรือ token หมดอายุ |
| 403 | ไม่มีสิทธิ์เข้าถึง |
| 404 | ไม่พบข้อมูล |
| 500 | Server error |

---

## การแบ่งงาน Controllers

| คน | Controller | Functions |
|----|-----------|-----------|
| คนที่ 1 | authController | `login`, `logout` |
| คนที่ 1 | userController | `getAllUsers`, `getUserById`, `createUser`, `updateUser`, `deleteUser` |
| คนที่ 1 | departmentController | `getAllDepartments`, `createDepartment`, `updateDepartment`, `deleteDepartment` |
| คนที่ 2 | logController | `createLog`, `uploadImage` |
| คนที่ 3 | logController | `getAllLogs` |
| คนที่ 4 | logController | `getLogById`, `getImages`, `deleteImage`, `deleteLog`, `updateLog` |

---

## Test Accounts (seed data)

| Email | Password | Role | แผนก |
|-------|----------|------|------|
| admin@loeitc.ac.th | password123 | admin | — |
| aump@loeitc.ac.th | password123 | teacher | IT |
| nattapong@loeitc.ac.th | password123 | teacher | AI |
| prasit@loeitc.ac.th | password123 | teacher | EE |
| somsak@loeitc.ac.th | password123 | teacher | ME |
