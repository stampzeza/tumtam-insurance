import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function RegisterSelection() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto text-center mb-10">
        <h2 className="text-3xl font-extrabold text-gray-900">เลือกประเภทการสมัครใช้งานระบบ</h2>
        <p className="mt-2 text-sm text-gray-600">กรุณาเลือกประเภทที่ตรงกับสถานะของคุณเพื่อดำเนินการต่อ</p>
      </div>
      <div className="max-w-5xl mx-auto grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col justify-between border-t-4 border-blue-500">
          <div>
            <div className="text-blue-500 text-3xl font-bold mb-2">👥</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">ตัวแทนเดิม (มีรหัสแล้ว)</h3>
            <p className="text-sm text-gray-600 mb-4">สำหรับตัวแทนที่มีรหัสตัวแทนอยู่แล้ว แต่อยากเข้ามาใช้งานระบบจัดการและรับแจ้งเตือน</p>
          </div>
          <button onClick={() => navigate('/register?type=existing_agent')} className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-xl hover:bg-blue-700 font-medium text-sm mt-4">
            เลือกประเภทนี้
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col justify-between border-t-4 border-emerald-500">
          <div>
            <div className="text-emerald-500 text-3xl font-bold mb-2">💼</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">สมัครเป็นตัวแทนใหม่</h3>
            <p className="text-sm text-gray-600 mb-4">สำหรับผู้เริ่มต้นธุรกิจตัวแทนประกัน ต้องการใช้ระบบและรับค่าคอมมิชชัน (ต้องแนบบัตรประชาชนและสมุดบัญชี)</p>
          </div>
          <button onClick={() => navigate('/register?type=new_agent')} className="w-full bg-emerald-600 text-white py-2.5 px-4 rounded-xl hover:bg-emerald-700 font-medium text-sm mt-4">
            เลือกประเภทนี้
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col justify-between border-t-4 border-purple-500">
          <div>
            <div className="text-purple-500 text-3xl font-bold mb-2">🌟</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">สมัครเป็น FOA (ผู้แนะนำ)</h3>
            <p className="text-sm text-gray-600 mb-4">สำหรับผู้สนใจสมัครเป็นผู้แนะนำเพื่อสร้างเครือข่าย (ต้องแนบบัตรประชาชนและสมุดบัญชี)</p>
          </div>
          <button onClick={() => navigate('/register?type=foa')} className="w-full bg-purple-600 text-white py-2.5 px-4 rounded-xl hover:bg-purple-700 font-medium text-sm mt-4">
            เลือกประเภทนี้
          </button>
        </div>
      </div>
    </div>
  );
}