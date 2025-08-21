# Frontend - ระบบจัดการเวรพยาบาล

## คุณสมบัติ Frontend
- หน้า Login/Register แยกตาม Role
- **Nurse Dashboard**: ดูเวรตัวเอง, ขอลาจากเวร
- **Head Nurse Dashboard**: สร้างเวร, จัดเวรให้พยาบาล, อนุมัติ/ปฏิเสธคำขอลา
- Responsive Design (Mobile-friendly)
- Role-based Navigation

## เทคโนโลยี
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **State Management**: React Hooks (useState, useEffect)
- **Authentication**: JWT Token + localStorage

## วิธีการรัน Frontend

### 1. ติดตั้ง Dependencies
```bash
npm install
```

### 2. รัน Development Server
```bash
npm run dev
```
Frontend จะรันที่: `http://localhost:3000`

### 3. Build สำหรับ Production
```bash
npm run build
npm start
```

## หน้าจอทั้งหมด

### Authentication Pages
1. **`/signin`** - หน้าเข้าสู่ระบบ
2. **`/register`** - หน้าสมัครสมาชิก

### Nurse Pages
3. **`/nursedashboard`** - หน้าหลักพยาบาล
   - ดูตารางเวรที่ได้รับมอบหมาย
   - ขอลาจากเวรเฉพาะ
   - ดูสถานะการขอลา

### Head Nurse Pages
4. **`/headnursedashboard`** - หน้าหลักหัวหน้าพยาบาล (3 Tabs)
   - **Tab 1**: ดูตารางเวรทั้งหมด
   - **Tab 2**: สร้างเวรใหม่และจัดเวรให้พยาบาล
   - **Tab 3**: จัดการคำขอลา (อนุมัติ/ปฏิเสธ)

## การตั้งค่า API

### API Configuration
ไฟล์: `app/api/port/config.ts`
```typescript
export const config = {
    apiUrl: 'http://localhost:3001/api'
}
```

## ข้อมูลทดสอบ

### หัวหน้าพยาบาล
- **Email**: `test001`
- **Password**: `1234567890`
- **Redirect**: `/headnursedashboard`

### พยาบาล
- **Email**: `test002`
- **Password**: `1234567890`
- **Redirect**: `/nursedashboard`

- **Email**: `nurse.test@hospital.com`
- **Password**: `123456`
- **Redirect**: `/nursedashboard`


## UI Components

### Authentication Flow
- Auto-redirect ตาม Role หลัง Login
- Token storage ใน localStorage
- Auto-logout เมื่อ Token หมดอายุ

### Dashboard Features
- **Responsive Tables** - แสดงข้อมูลเวรและคำขอลา
- **Modal Confirmations** - ยืนยันการขอลา/อนุมัติ
- **Status Badges** - แสดงสถานะด้วยสี
- **Tab Navigation** - สำหรับหัวหน้าพยาบาล

### Form Validation
- Required field validation
- Password confirmation
- Email format validation
- Role selection

## State Management

### User Authentication
```typescript
interface User {
  id: number;
  name: string;
  role: "nurse" | "head_nurse";
  token: string;
}
```

### Data Fetching
- Axios interceptors สำหรับ Authorization header
- Error handling สำหรับ 401/403 responses
- Loading states สำหรับ UX

## Features by Role

### Nurse Features
- ดูเวรที่ได้รับมอบหมาย
- ขอลาจากเวรเฉพาะ
- ดูสถานะการขอลา
- Logout

### Head Nurse Features
- ดูเวรทั้งหมดในระบบ
- สร้างเวรใหม่
- จัดเวรให้พยาบาล
- ดูรายการขอลาทั้งหมด
- อนุมัติ/ปฏิเสธคำขอลา
- Logout

## Scripts
```bash
npm run dev        # รัน development server
npm run build      # Build สำหรับ production
npm run start      # รัน production server
npm run lint       # ตรวจสอบ code quality
```

## Responsive Design
- Mobile-first approach
- Tablet compatibility
- Desktop optimization
- Touch-friendly buttons
