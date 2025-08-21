// API Configuration with Environment Variable support
export const config = {
    // Use environment variable if available, fallback to localhost for development
    apiUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api',
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
}

// กำหนด URL ของ Backend API ที่รองรับทั้ง development และ production