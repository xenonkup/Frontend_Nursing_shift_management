# ระบบจัดการเวรพยาบาล (Nursing Shift Management System)

Web UI สำหรับจัดการเวรพยาบาลและการขอลา พัฒนาด้วย React/Next.js และใช้ axios สำหรับการเรียก API

## คุณสมบัติ

### 👩‍⚕️ พยาบาล (Nurse)
- เข้าสู่ระบบ
- ดูตารางเวรตัวเอง
- ขอลาจากเวรที่ได้รับมอบหมาย

### 👩‍⚕️ หัวหน้าพยาบาล (Head Nurse)
- เข้าสู่ระบบ
- สร้างเวรใหม่
- จัดเวรให้พยาบาล
- ดูรายการขอลา
- อนุมัติ/ปฏิเสธการขอลา

## การติดตั้งและรัน

### Frontend (Next.js) - Port 3000
1. ติดตั้ง dependencies:
```bash
npm install
```

2. รันเซิร์ฟเวอร์ frontend:
```bash
npm run dev
```

3. เปิดเบราว์เซอร์ไปที่ `http://localhost:3000`

### การเชื่อมต่อกับ Backend API (Port 3001)
- Frontend จะเชื่อมต่อกับ Backend API ที่ `http://localhost:3001/api`
- สามารถเปลี่ยน URL ได้ในไฟล์ `.env.local`
- ตรวจสอบให้แน่ใจว่า Backend API รันอยู่ที่ port 3001

### การกำหนดค่า Port
- Frontend: Port 3000 (default)
- Backend API: Port 3001
- สามารถเปลี่ยนได้ในไฟล์ `app/api/port/config.ts` หรือ `.env.local`

## ข้อมูลสำหรับทดสอบ

### บัญชีผู้ใช้
- **พยาบาล**: `nurse1` / `password123`
- **พยาบาล**: `nurse2` / `password123`  
- **หัวหน้าพยาบาล**: `head1` / `password123`

## โครงสร้างโปรเจค

```
app/
├── components/
│   ├── Login.tsx              # หน้าเข้าสู่ระบบ
│   ├── NurseDashboard.tsx     # แดชบอร์ดพยาบาล
│   └── HeadNurseDashboard.tsx # แดชบอร์ดหัวหน้าพยาบาล
├── api/
│   ├── auth/login/            # API เข้าสู่ระบบ
│   ├── shifts/                # API จัดการเวร
│   ├── nurses/                # API ข้อมูลพยาบาล
│   └── leave-requests/        # API จัดการการขอลา
├── page.tsx                   # หน้าหลัก
└── layout.tsx                 # Layout หลัก
```

## API Endpoints (Backend - Port 3001)

### Authentication
- `POST /api/auth/login` - เข้าสู่ระบบ
- `POST /api/auth/register` - สมัครสมาชิก (กำหนด role)

### Shifts
- `GET /api/shifts/my-shifts` - ดูเวรของตัวเอง (พยาบาล)
- `GET /api/shifts/all` - ดูเวรทั้งหมด (หัวหน้าพยาบาล)
- `POST /api/shifts` - สร้างเวรใหม่ (หัวหน้าพยาบาล)
- `POST /api/shift-assignments` - จัดเวรให้พยาบาล (หัวหน้าพยาบาล)

### Nurses
- `GET /api/nurses` - ดูรายชื่อพยาบาล (หัวหน้าพยาบาล)

### Leave Requests
- `POST /api/leave-requests` - ขอลา (พยาบาล)
- `GET /api/leave-requests` - ดูรายการขอลา (หัวหน้าพยาบาล)
- `PATCH /api/leave-requests/:id/approve` - อนุมัติการขอลา
- `PATCH /api/leave-requests/:id/reject` - ปฏิเสธการขอลา

## เทคโนโลยีที่ใช้

- **Frontend**: React 19, Next.js 15, TypeScript
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Mock Data**: ใช้ข้อมูลจำลองใน API routes

## หมายเหตุ

- ระบบนี้ใช้ข้อมูลจำลอง (mock data) สำหรับการทดสอบ
- ในการใช้งานจริงควรเชื่อมต่อกับฐานข้อมูลและระบบ authentication ที่เหมาะสม
- Token authentication ใช้แบบง่าย ๆ สำหรับการทดสอบ ในการใช้งานจริงควรใช้ JWT