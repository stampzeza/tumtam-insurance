import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function RegisterSelection() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-extrabold text-gray-900">เลือกประเภทการสมัครใช้งานระบบ</h2>
        <p className="mt-2 text-sm text-gray-600">กรุณาเลือกประเภทที่ตรงกับสถานะของคุณเพื่อดำเนินการต่อ</p>
      </div>

      <div className="max-w-5xl mx-auto mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
        
        {/* Card 1: ตัวแทนเดิมที่มีรหัสอยู่แล้ว */}
        <div className="bg-white rounded-lg shadow-md p-6 flex flex-col justify-between border-t-4 border-blue-500">
          <div>
            <div className="text-blue-500 text-3xl font-bold mb-2">👥</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">ตัวแทนเดิม (มีรหัสแล้ว)</h3>
            <p className="text-sm text-gray-600 mb-4">
              สำหรับตัวแทนที่มีรหัสตัวแทนอยู่แล้ว แต่อยากเข้ามาใช้งานระบบจัดการและรับแจ้งเตือนออนไลน์
            </p>
            <ul className="text-xs text-gray-500 space-y-1 mb-6 text-left">
              * ใช้รหัสตัวแทนเดิมเข้าสู่ระบบ<br/>
              * ไม่ต้องแนบเอกสารเพิ่ม<br/>
              * รอ Admin ตรวจสอบและอนุมัติสิทธิ์
            </ul>
          </div>
          <button 
            onClick={() => navigate('/register?type=existing_agent')}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 font-medium text-sm">
            เลือกประเภทนี้
          </button>
        </div>

        {/* Card 2: สนใจสมัครเป็นตัวแทนใหม่ */}
        <div className="bg-white rounded-lg shadow-md p-6 flex flex-col justify-between border-t-4 border-green-500">
          <div>
            <div className="text-green-500 text-3xl font-bold mb-2">💼</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">สมัครเป็นตัวแทนใหม่</h3>
            <p className="text-sm text-gray-600 mb-4">
              สำหรับผู้ที่สนใจเริ่มต้นธุรกิจตัวแทนประกัน ต้องการใช้ระบบและรับค่าคอมมิชชัน/รายได้
            </p>
            <ul className="text-xs text-gray-500 space-y-1 mb-6 text-left">
              * กรอกข้อมูลส่วนตัวและช่องทางติดต่อ<br/>
              * **ต้องแนบรูปบัตรประชาชน**<br/>
              * **ต้องแนบรูปหน้าสมุดบัญชีธนาคาร**
            </ul>
          </div>
          <button 
            onClick={() => navigate('/register?type=new_agent')}
            className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 font-medium text-sm">
            เลือกประเภทนี้
          </button>
        </div>

        {/* Card 3: สนใจสมัครเป็น FOA / ผู้แนะนำ */}
        <div className="bg-white rounded-lg shadow-md p-6 flex flex-col justify-between border-t-4 border-purple-500">
          <div>
            <div className="text-purple-500 text-3xl font-bold mb-2">🌟</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">สมัครเป็น FOA (ผู้แนะนำ)</h3>
            <p className="text-sm text-gray-600 mb-4">
              สำหรับผู้ที่สนใจสมัครเป็นผู้แนะนำ (FOA) เพื่อสร้างเครือข่ายและรับผลประโยชน์ตอบแทน
            </p>
            <ul className="text-xs text-gray-500 space-y-1 mb-6 text-left">
              * กรอกข้อมูลส่วนตัวและช่องทางติดต่อ<br/>
              * **ต้องแนบรูปบัตรประชาชน**<br/>
              * **ต้องแนบรูปหน้าสมุดบัญชีธนาคาร**
            </ul>
          </div>
          <button 
            onClick={() => navigate('/register?type=foa')}
            className="w-full bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 font-medium text-sm">
            เลือกประเภทนี้
          </button>
        </div>

      </div>
    </div>
  );
}