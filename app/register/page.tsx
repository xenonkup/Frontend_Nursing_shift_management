'use client';

import { useState } from 'react';
import axios from 'axios';
import { config } from '../api/port/config';
import { useRouter } from 'next/navigation';


export default function Register() {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: '',
        name: '',
        role: 'nurse' as 'nurse' | 'head_nurse',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // ตรวจสอบรหัสผ่าน
        if (formData.password !== formData.confirmPassword) {
            setError('รหัสผ่านไม่ตรงกัน');
            setLoading(false);
            return;
        }

        // ตรวจสอบรหัสผ่านน้อยกว่า 6 
        if (formData.password.length < 6) {
            setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
            setLoading(false);
            return;
        }

        try {
            await axios.post(`${config.apiUrl}/auth/register`, {
                username: formData.username,
                password: formData.password,
                name: formData.name,
                role: formData.role,
            });

            alert('ลงทะเบียนสำเร็จ! กรุณาเข้าสู่ระบบ');
            handleRegisterSuccess();
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการลงทะเบียน');
            } else {
                setError('เกิดข้อผิดพลาดในการลงทะเบียน');
            }
        } finally {
            setLoading(false);
        }
    };

     const router = useRouter();

    const handleRegisterSuccess = () => {
        // กลับไปหน้า login หลังลงทะเบียนสำเร็จ
        router.push('/');
    };

    const handleBackToLogin = () => {
        // กลับไปหน้า login
        router.push('/');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        ลงทะเบียนผู้ใช้ใหม่
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        ระบบจัดการเวรพยาบาล
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                                ชื่อผู้ใช้
                            </label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                className="text-black mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="ชื่อผู้ใช้"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            />
                        </div>

                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                ชื่อ-นามสกุล
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                className="text-black  mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="ชื่อ-นามสกุล"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        <div>
                            <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                                ตำแหน่ง
                            </label>
                            <select
                                id="role"
                                name="role"
                                className="text-black mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value as 'nurse' | 'head_nurse' })}
                            >
                                <option value="nurse">พยาบาล</option>
                                <option value="head_nurse">หัวหน้าพยาบาล</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                รหัสผ่าน
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="text-black  mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="รหัสผ่าน (อย่างน้อย 6 ตัวอักษร)"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                ยืนยันรหัสผ่าน
                            </label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                required
                                className="text-black  mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="ยืนยันรหัสผ่าน"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="text-red-600 text-sm text-center">{error}</div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'กำลังลงทะเบียน...' : 'ลงทะเบียน'}
                        </button>
                    </div>

                    <div className="text-center">
                        <button
                            type="button"
                            onClick={handleBackToLogin}
                            className="text-indigo-600 hover:text-indigo-500 text-sm"
                        >
                            กลับไปหน้าเข้าสู่ระบบ
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}