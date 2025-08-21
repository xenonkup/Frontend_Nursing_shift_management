"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { User } from "../signin/page";
import { config } from "../api/port/config";
import { useRouter } from "next/navigation";

interface Shift {
    id: number;
    date: string;
    startTime: string;
    endTime: string;
    department: string;
    status: "assigned" | "leave_requested" | "leave_approved" | "leave_rejected";
    description?: string;
}

export default function NurseDashboard() {
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);
    const [requestingLeave, setRequestingLeave] = useState<number | null>(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const [selectedShiftId, setSelectedShiftId] = useState<number | null>(null);
    const [refresh, setRefresh] = useState(0);
    const router = useRouter();

    // ดึง user จาก localStorage
    const [user, setUser] = useState<User | null>(null);
    useEffect(() => {
        if (typeof window !== "undefined") {
            const storedUser = localStorage.getItem("user");
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            } else {
                setError("กรุณาล็อกอินก่อนใช้งาน");
            }
        }
    }, []);

    const fetchShifts = useCallback(async () => {
        if (!user?.token) {
            setError("ไม่มีข้อมูลการล็อกอิน กรุณาล็อกอินใหม่");
            return;
        }
        try {
            const response = await axios.get(`${config.apiUrl}/shifts/my-shifts`, {
                headers: { Authorization: `Bearer ${user.token}` },
            });
            const data = response.data;
            if (data.schedule && Array.isArray(data.schedule)) {
                setShifts(data.schedule);
            } else {
                setShifts([]);
                console.warn("Unexpected API response structure:", data);
            }
            setError(null);
        } catch (err) {
            if (axios.isAxiosError(err) && err.response?.status === 401) {
                setError("กรุณาล็อกอินใหม่");
                localStorage.removeItem("user"); // ลบ user ที่หมดอายุ
                setUser(null);
            } else {
                console.error("Error fetching shifts:", err);
                setError("เกิดข้อผิดพลาดในการดึงข้อมูลเวร");
            }
        }
    }, [user?.token]);

    useEffect(() => {
        fetchShifts();
    }, [fetchShifts, refresh]);

    const requestLeave = async (shiftId: number) => {
        if (!user?.token) return;
        setRequestingLeave(shiftId);
        try {
            await axios.post(
                `${config.apiUrl}/shifts/${shiftId}/request-leave`,
                {},
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
            setNotification({ message: "ขอลาสำเร็จ", type: "success" });
            setShifts((prev) =>
                prev.map((shift) =>
                    shift.id === shiftId ? { ...shift, status: "leave_requested" } : shift
                )
            );
        } catch (err) {
            console.error("Error requesting leave:", err);
            setNotification({ message: "เกิดข้อผิดพลาดในการขอลา", type: "error" });
        } finally {
            setRequestingLeave(null);
            setShowConfirm(false);
        }
    };

    const handleRequestLeaveClick = (shiftId: number) => {
        setSelectedShiftId(shiftId);
        setShowConfirm(true);
    };

    const confirmLeave = () => {
        if (selectedShiftId !== null && user?.token) {
            requestLeave(selectedShiftId);
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case "assigned":
                return "ได้รับมอบหมาย";
            case "leave_requested":
                return "ขอลาแล้ว";
            case "leave_approved":
                return "อนุมัติลาแล้ว";
            case "leave_rejected":
                return "ปฏิเสธการลา";
            default:
                return status;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "assigned":
                return "bg-blue-100 text-blue-800";
            case "leave_requested":
                return "bg-yellow-100 text-yellow-800";
            case "leave_approved":
                return "bg-green-100 text-green-800";
            case "leave_rejected":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const notificationClasses =
        notification?.type === "success"
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800";

    const handleLogout = () => {
        localStorage.removeItem("user");
        setUser(null);
        router.push("/signin");
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header แสดงเฉพาะเมื่อมี user */}
            {user && (
                <header className="bg-white shadow-md border-b">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <div className="flex justify-between items-center">
                            <h1 className="text-2xl font-bold text-gray-900">ระบบจัดการเวรพยาบาล</h1>
                            <div className="flex items-center space-x-4">
                                <span className="text-gray-700">
                                    สวัสดี, {user.name} ({user.role === "nurse" ? "พยาบาล" : "หัวหน้าพยาบาล"})
                                </span>
                                <button
                                    onClick={handleLogout}
                                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                                >
                                    ออกจากระบบ
                                </button>
                            </div>
                        </div>
                    </div>
                </header>
            )}

            {/* Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {error && <div className="text-red-600 mb-4">{error}</div>}

                {notification && (
                    <div
                        className={`fixed top-4 right-4 p-4 rounded-md shadow-md ${notificationClasses} border border-gray-200`}
                        role="status"
                        aria-live="polite"
                    >
                        <span>{notification.message}</span>
                        <button
                            onClick={() => setNotification(null)}
                            className="ml-2 inline-flex items-center justify-center rounded px-2 py-1 bg-white/60 hover:bg-white/80 text-sm"
                            aria-label="ปิดการแจ้งเตือน"
                        >
                            X
                        </button>
                    </div>
                )}

                <div className="bg-white shadow-md rounded-lg border border-gray-200 p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">ตารางเวรของฉัน</h3>
                        <button
                            onClick={() => setRefresh((prev) => prev + 1)}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                        >
                            รีเฟรช
                        </button>
                    </div>

                    {shifts.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">ไม่มีเวรที่ได้รับมอบหมาย</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            วันที่
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            เวลา
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            แผนก
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            สถานะ
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            การดำเนินการ
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {shifts.map((shift) => (
                                        <tr key={shift.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {new Date(shift.date).toLocaleDateString("th-TH")}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {shift.startTime} - {shift.endTime}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {shift.department}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                                                        shift.status
                                                    )}`}
                                                >
                                                    {getStatusText(shift.status)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                {shift.status === "assigned" && (
                                                    <button
                                                        onClick={() => handleRequestLeaveClick(shift.id)}
                                                        disabled={requestingLeave === shift.id}
                                                        className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {requestingLeave === shift.id
                                                            ? "กำลังขอลา..."
                                                            : "ขอลา"}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {showConfirm && selectedShiftId && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white shadow-md rounded-lg border border-gray-200 p-6 w-full max-w-sm">
                            <p className="text-gray-900">คุณแน่ใจหรือไม่ว่าต้องการขอลา?</p>
                            <div className="mt-4 flex gap-3">
                                <button
                                    onClick={confirmLeave}
                                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                                >
                                    ยืนยัน
                                </button>
                                <button
                                    onClick={() => setShowConfirm(false)}
                                    className="bg-gray-300 px-4 py-2 rounded-md hover:bg-gray-400"
                                >
                                    ยกเลิก
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}