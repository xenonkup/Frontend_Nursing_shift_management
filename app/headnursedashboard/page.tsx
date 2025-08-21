"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { User } from "../signin/page";
import { config } from "../api/port/config";
import { useRouter } from "next/navigation";

// ค่าเริ่มต้น Nurese
interface Nurse {
    id: number;
    name: string;
}

// ค่าเริ่มต้น กะ
interface Shift {
    id: number;
    nurseId: number;
    nurseName: string;
    date: string;
    startTime: string;
    endTime: string;
    department: string;
    status: "assigned" | "leave_requested" | "leave_approved" | "leave_rejected";
}

// ค่าเริ่มต้น อนุมัติ
interface LeaveRequest {
    id: number;
    shiftId: number;
    nurseId: number;
    nurseName: string;
    date: string;
    startTime: string;
    endTime: string;
    department: string;
    status: "pending" | "approved" | "rejected";
    requestedAt: string;
}

export default function HeadNurseDashboard() {
    const [activeTab, setActiveTab] = useState<"shifts" | "create" | "requests">("shifts");
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [nurses, setNurses] = useState<Nurse[]>([]);
    const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
    const [newShift, setNewShift] = useState({
        nurseId: "",
        date: "",
        startTime: "",
        endTime: "",
        department: "",
    });
    const router = useRouter();

    // สถานะในการจัดการผู้ใช้จาก localStorage
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const storedUser = localStorage.getItem("user");
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            } else {
                setTimeout(() => router.push("/signin"), 0);
            }
        }
    }, [router]);

    // ดึง Data
    const fetchData = useCallback(async () => {
        if (!user?.token) {
            console.warn("No user token available, skipping data fetch");
            return;
        }
        try {
            const [shiftsRes, nursesRes, requestsRes] = await Promise.all([
                axios.get(`${config.apiUrl}/shifts/all`, {
                    headers: { Authorization: `Bearer ${user.token}` },
                }),
                axios.get(`${config.apiUrl}/nurses`, {
                    headers: { Authorization: `Bearer ${user.token}` },
                }),
                axios.get(`${config.apiUrl}/leave-requests`, {
                    headers: { Authorization: `Bearer ${user.token}` },
                }),
            ]);

            setShifts(Array.isArray(shiftsRes.data) ? shiftsRes.data : []);
            setNurses(Array.isArray(nursesRes.data) ? nursesRes.data : []);
            setLeaveRequests(Array.isArray(requestsRes.data) ? requestsRes.data : []);
            console.log("Leave Requests Data:", requestsRes.data);
        } catch (error) {
            console.error("Error fetching data:", error);
            setLeaveRequests([]);
        }
    }, [user?.token]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const createShift = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.token) {
            alert("กรุณาล็อกอินก่อนสร้างเวร");
            return;
        }
        try {
            await axios.post(`${config.apiUrl}/shifts`, newShift, {
                headers: { Authorization: `Bearer ${user.token}` },
            });

            setNewShift({
                nurseId: "",
                date: "",
                startTime: "",
                endTime: "",
                department: "",
            });

            fetchData();
            alert("สร้างเวรสำเร็จ");
        } catch (error) {
            console.error("Error creating shift:", error);
            alert("เกิดข้อผิดพลาดในการสร้างเวร");
        }
    };

    const handleLeaveRequest = async (requestId: number, action: "approve" | "reject") => {
        if (!user?.token) {
            alert("กรุณาล็อกอินก่อนดำเนินการ");
            return;
        }
        try {
            if (action === "approve") {
                await axios.patch(
                    `${config.apiUrl}/leave-requests/${requestId}/approve`,
                    {},
                    {
                        headers: { Authorization: `Bearer ${user.token}` },
                    }
                );
            } else {
                await axios.patch(
                    `${config.apiUrl}/leave-requests/${requestId}/reject`,
                    {},
                    {
                        headers: { Authorization: `Bearer ${user.token}` },
                    }
                );
            }

            fetchData();
            alert(`${action === "approve" ? "อนุมัติ" : "ปฏิเสธ"}การขอลาสำเร็จ`);
        } catch (error) {
            console.error("Error handling leave request:", error);
            alert("เกิดข้อผิดพลาดในการดำเนินการ");
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
            case "pending":
                return "รอการอนุมัติ";
            case "approved":
                return "อนุมัติแล้ว";
            case "rejected":
                return "ปฏิเสธแล้ว";
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
            case "pending":
                return "bg-yellow-100 text-yellow-800";
            case "approved":
                return "bg-green-100 text-green-800";
            case "rejected":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("user");
        setUser(null);
        router.push("/signin");
    };

    if (!user) {
        return <div className="text-red-600">กรุณาล็อกอินก่อนใช้งาน</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50">
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

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                        <button
                            onClick={() => setActiveTab("shifts")}
                            className={`py-2 px-4 border-b-2 font-medium text-sm rounded-t-md ${
                                activeTab === "shifts"
                                    ? "border-indigo-500 text-indigo-600 bg-indigo-50"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                            }`}
                        >
                            ดูตารางเวร
                        </button>
                        <button
                            onClick={() => setActiveTab("create")}
                            className={`py-2 px-4 border-b-2 font-medium text-sm rounded-t-md ${
                                activeTab === "create"
                                    ? "border-indigo-500 text-indigo-600 bg-indigo-50"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                            }`}
                        >
                            สร้างเวร
                        </button>
                        <button
                            onClick={() => setActiveTab("requests")}
                            className={`py-2 px-4 border-b-2 font-medium text-sm rounded-t-md ${
                                activeTab === "requests"
                                    ? "border-indigo-500 text-indigo-600 bg-indigo-50"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                            }`}
                        >
                            รายการขอลา
                            {Array.isArray(leaveRequests) &&
                                leaveRequests.filter((req) => req.status === "pending").length > 0 && (
                                    <span className="ml-2 bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                        {leaveRequests.filter((req) => req.status === "pending").length}
                                    </span>
                                )}
                        </button>
                    </nav>
                </div>

                <div className="mt-6">
                    {activeTab === "shifts" && (
                        <div className="bg-white shadow-md rounded-lg border border-gray-200 p-6">
                            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">ตารางเวรทั้งหมด</h3>
                            {shifts.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">ไม่มีเวรที่สร้างไว้</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    พยาบาล
                                                </th>
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
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {shifts.map((shift) => (
                                                <tr key={shift.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {shift.nurseName}
                                                    </td>
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
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "create" && (
                        <div className="bg-white shadow-md rounded-lg border border-gray-200 p-6">
                            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">สร้างเวรใหม่</h3>
                            <form onSubmit={createShift} className="space-y-6">
                                <div>
                                    <label htmlFor="nurseId" className="block text-sm font-medium text-gray-700">
                                        เลือกพยาบาล
                                    </label>
                                    <select
                                        id="nurseId"
                                        value={newShift.nurseId}
                                        onChange={(e) => setNewShift({ ...newShift, nurseId: e.target.value })}
                                        required
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        <option value="">เลือกพยาบาล</option>
                                        {nurses.map((nurse) => (
                                            <option key={nurse.id} value={nurse.id}>
                                                {nurse.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                                        วันที่
                                    </label>
                                    <input
                                        type="date"
                                        id="date"
                                        value={newShift.date}
                                        onChange={(e) => setNewShift({ ...newShift, date: e.target.value })}
                                        required
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
                                            เวลาเริ่ม
                                        </label>
                                        <input
                                            type="time"
                                            id="startTime"
                                            value={newShift.startTime}
                                            onChange={(e) => setNewShift({ ...newShift, startTime: e.target.value })}
                                            required
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
                                            เวลาสิ้นสุด
                                        </label>
                                        <input
                                            type="time"
                                            id="endTime"
                                            value={newShift.endTime}
                                            onChange={(e) => setNewShift({ ...newShift, endTime: e.target.value })}
                                            required
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                                        แผนก
                                    </label>
                                    <input
                                        type="text"
                                        id="department"
                                        value={newShift.department}
                                        onChange={(e) => setNewShift({ ...newShift, department: e.target.value })}
                                        required
                                        placeholder="เช่น แผนกอายุรกรรม, แผนกศัลยกรรม"
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                                <div>
                                    <button
                                        type="submit"
                                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        สร้างเวร
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === "requests" && (
                        <div className="bg-white shadow-md rounded-lg border border-gray-200 p-6">
                            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">รายการขอลา</h3>
                            {leaveRequests.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">ไม่มีรายการขอลา</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    พยาบาล
                                                </th>
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
                                            {leaveRequests.map((request) => (
                                                <tr key={request.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {request.nurseName}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {new Date(request.date).toLocaleDateString("th-TH")}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {request.startTime} - {request.endTime}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {request.department}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span
                                                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                                                                request.status
                                                            )}`}
                                                        >
                                                            {getStatusText(request.status)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        {request.status === "pending" && (
                                                            <div className="flex space-x-2">
                                                                <button
                                                                    onClick={() => handleLeaveRequest(request.id, "approve")}
                                                                    className="text-green-600 hover:text-green-900"
                                                                >
                                                                    อนุมัติ
                                                                </button>
                                                                <button
                                                                    onClick={() => handleLeaveRequest(request.id, "reject")}
                                                                    className="text-red-600 hover:text-red-900"
                                                                >
                                                                    ปฏิเสธ
                                                                </button>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}