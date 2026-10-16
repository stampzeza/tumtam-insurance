import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function RegisterForm() {
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(window.location.search);
  const applicantType = queryParams.get('type') || 'new_agent';
  const needDocuments = applicantType === 'new_agent' || applicantType === 'foa';

  const [formData, setFormData] = useState({
    usercode: '', username: '', email: '', password: '',
    full_name: '', phone_number: '', line_id: '',
    telegram_bottoken: '', telegram_chatid: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      alert('บันทึกข้อมูลเรียบร้อย (ระบบจำลอง)');
      setSubmitting(false);
      navigate('/login');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4 font-sans">
      <div className="max-w-xl mx-auto bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
        <h2 className="text-2xl font-extrabold text-gray-900 mb-1">
          {applicantType === 'existing_agent' ? 'ลงทะเบียนตัวแทนเดิม' : applicantType === 'foa' ? 'สมัครสมาชิก FOA (ผู้แนะนำ)' : 'สมัครสมาชิกตัวแทนใหม่'}
        </h2>
        <p className="text-sm text-gray-500 mb-6">กรอกข้อมูลส่วนตัวเพื่อเริ่มต้นใช้งานระบบ</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {applicantType === 'existing_agent' && (
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">รหัสตัวแทนเดิม *</label>
              <input type="text" required onChange={e => setFormData({...formData, usercode: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm" placeholder="เช่น AG12345" />
            </div>
          )}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">ชื่อผู้ใช้ (Username) *</label>
            <input type="text" required onChange={e => setFormData({...formData, username: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">รหัสผ่าน (Password) *</label>
            <input type="password" required onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">ชื่อ - นามสกุล *</label>
            <input type="text" required onChange={e => setFormData({...formData, full_name: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">เบอร์โทรศัพท์ *</label>
            <input type="tel" required onChange={e => setFormData({...formData, phone_number: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Line ID</label>
            <input type="text" onChange={e => setFormData({...formData, line_id: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm" />
          </div>

          {needDocuments && (
            <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 space-y-3 mt-4">
              <h4 className="font-bold text-sm text-blue-900">เอกสารประกอบการรับรายได้</h4>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">รูปถ่ายบัตรประชาชน *</label>
                <input type="file" accept="image/*" required className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">รูปถ่ายหน้าสมุดบัญชีธนาคาร *</label>
                <input type="file" accept="image/*" required className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700" />
              </div>
            </div>
          )}

          <button type="submit" disabled={submitting} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-xl shadow-lg transition duration-200 mt-6">
            {submitting ? 'กำลังส่งข้อมูล...' : 'ยืนยันการสมัครสมาชิก'}
          </button>
        </form>
      </div>
    </div>
  );
}