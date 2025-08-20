/** @type {import('next').NextConfig} */
const nextConfig = {
  // กำหนดให้ Next.js รันที่ port 3000 (default)
  // และเชื่อมต่อกับ Backend API ที่ port 3001
  
  async rewrites() {
    return [
      // ถ้ามีการเรียก /api/* จะ redirect ไปยัง backend ที่ port 3001
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/api/:path*',
      },
    ];
  },
  
  // เปิดใช้งาน CORS สำหรับการเชื่อมต่อ cross-origin
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;