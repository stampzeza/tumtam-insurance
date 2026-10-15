import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  // ลองหยิบกุญแจในเครื่องออกมาดู
  const token = localStorage.getItem('admin_token');

  // ถ้าไม่มีกุญแจ (ยังไม่ได้ Login) ดีดกลับไปหน้า /login ทันที
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // ถ้ามีกุญแจ ปล่อยให้เข้าไปดูหน้าจัดการข้อมูลได้ปกติ
  return children;
}