"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { config } from "../api/port/config";

export type UserRole = "nurse" | "head_nurse" | "NURSE" | "HEAD_NURSE";

// กำหนดเค้าโครง
export interface User {
    id: number;
    name: string;
    role: UserRole;
    token: string;
}

interface LoginProps {
    onLogin?: (user: User) => void; // เปลี่ยนเป็น optional prop
}

export default function Signin({ onLogin }: LoginProps = {}) {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // 🔹 Redirect ถ้ามี user อยู่แล้ว
    useEffect(() => {
        if (user) {
            const role = user.role.toLowerCase();
            if (role === "head_nurse") {
                router.push("/headnursedashboard");
            } else if (role === "nurse") {
                router.push("/nursedashboard");
            } else {
                router.push("/");
            }
        }
    }, [user, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        const requestBody = { email: username, password };
        // Debug requestBody
        console.log("Sending login request with:", requestBody);
        try {
            const response = await axios.post(`${config.apiUrl}/auth/signin`, requestBody, {
                headers: { "Content-Type": "application/json" },
            });
            // Debug esponse.data
            console.log("API Response:", response.data);
            const { token, user: userData } = response.data;
            if (!userData || !token) {
                throw new Error("Invalid response from server: Missing token or user data");
            }
            const normalizedUser: User = {
                id: userData.id,
                name: userData.name,
                role: userData.role.toLowerCase() as UserRole,
                token,
            };
            setUser(normalizedUser);
            // เรียก onLogin เฉพาะเมื่อมีค่าและเป็นฟังก์ชัน
            if (onLogin && typeof onLogin === "function") {
                onLogin(normalizedUser);
            }
            localStorage.setItem("user", JSON.stringify(normalizedUser));
            // ตัวบทบาทสิทธิเข้าถึง หน้าที่จัดไว้
            const role = normalizedUser.role.toLowerCase();
            if (role === "head_nurse") {
                router.push("/headnursedashboard");
            } else if (role === "nurse") {
                router.push("/nursedashboard");
            } else {
                router.push("/");
            }
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                const errorDetails = {
                    status: err.response?.status,
                    data: err.response?.data,
                    message: err.response?.data?.message || "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์",
                };
                // Debug errorDetails
                console.error("API Error Details:", errorDetails);
                setError(errorDetails.message);
            } else {
                // Debug err
                console.error("Unexpected Error:", err);
                setError("เกิดข้อผิดพลาดที่ไม่คาดคิด");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        เข้าสู่ระบบ
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        ระบบจัดการเวรพยาบาล
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="username" className="sr-only">
                                ชื่อผู้ใช้
                            </label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="ชื่อผู้ใช้"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">
                                รหัสผ่าน
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="รหัสผ่าน"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>
                    {error && <div className="text-red-600 text-sm text-center">{error}</div>}
                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
                        </button>
                    </div>
                    <div className="text-sm text-gray-600 text-center space-y-2">
                        <div className="pt-4 border-t border-gray-200">
                            <p>
                                ยังไม่มีบัญชี?
                                <button
                                    type="button"
                                    onClick={() => router.push("/register")}
                                    className="ml-1 text-indigo-600 hover:text-indigo-500 font-medium"
                                >
                                    ลงทะเบียนที่นี่
                                </button>
                            </p>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}