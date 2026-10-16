import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    usercode: '',
    username: '',
    email: '',
    password: '',
    full_name: '',
    phone_number: '',
    line_id: '',
    telegram_bottoken: '',
    telegram_chatid: ''
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // ดึงค่า type จาก URL มาเช็ค
const queryParams = new URLSearchParams(location.search);
const applicantType = queryParams.get('type') || 'new_agent';

// เงื่อนไขการแสดงผลฟิลด์อัปโหลดรูป
const needDocuments = applicantType === 'new_agent' || applicantType === 'foa';

  // ฟังก์ชันอัปเดตค่าเมื่อผู้ใช้พิมพ์
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // ฟังก์ชันกดส่งข้อมูลสมัครสมาชิก
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      // ปรับ URL ตาม Backend ของคุณ (ถ้ารันบน Render ให้ใช้ URL เต็ม)
      const response = await fetch('https://tumtam-insurance-backend.onrender.com/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'เกิดข้อผิดพลาดในการสมัครสมาชิก');
      }

      setSuccessMsg('สมัครสมาชิกสำเร็จ! กรุณารอการอนุมัติจากผู้ดูแลระบบ');
      setTimeout(() => {
        navigate('/login'); // สมัครเสร็จพาไปหน้า Login
      }, 3000);

    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          สมัครสมาชิกตัวแทนประกัน
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          กรอกข้อมูลเพื่อลงทะเบียนใช้งานระบบพาร์ทเนอร์
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          
          {errorMsg && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4 text-red-700 text-sm">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="mb-4 bg-green-50 border-l-4 border-green-400 p-4 text-green-700 text-sm">
              {successMsg}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">รหัสตัวแทน (ถ้ามี)</label>
                <input type="text" name="usercode" onChange={handleChange} value={formData.usercode} 
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">ชื่อผู้ใช้ (Username) *</label>
                <input type="text" name="username" required onChange={handleChange} value={formData.username} 
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">รหัสผ่าน (Password) *</label>
                <input type="password" name="password" required onChange={handleChange} value={formData.password} 
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">ชื่อ - นามสกุล *</label>
                <input type="text" name="full_name" required onChange={handleChange} value={formData.full_name} 
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">เบอร์โทรศัพท์ *</label>
                <input type="text" name="phone_number" required onChange={handleChange} value={formData.phone_number} 
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">อีเมล</label>
                <input type="email" name="email" onChange={handleChange} value={formData.email} 
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Line ID</label>
                <input type="text" name="line_id" onChange={handleChange} value={formData.line_id} 
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Telegram Bot Token (สำหรับแจ้งเตือน)</label>
                <input type="text" name="telegram_bottoken" onChange={handleChange} value={formData.telegram_bottoken} 
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500" />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Telegram Chat ID</label>
                <input type="text" name="telegram_chatid" onChange={handleChange} value={formData.telegram_chatid} 
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500" />
              </div>
            </div>

            {needDocuments && (
            <div className="sm:col-span-2 grid grid-cols-1 gap-4 bg-gray-50 p-4 rounded-md border">
                <h4 className="font-medium text-gray-700">เอกสารประกอบการสมัคร (สำหรับรับรายได้)</h4>
                <div>
                <label className="block text-sm text-gray-600">รูปถ่ายบัตรประชาชน *</label>
                <input type="file" accept="image/*" onChange={handleIdCardChange} className="mt-1 block w-full text-sm text-gray-500" />
                </div>
                <div>
                <label className="block text-sm text-gray-600">รูปถ่ายหน้าสมุดบัญชีธนาคาร *</label>
                <input type="file" accept="image/*" onChange={handleBankBookChange} className="mt-1 block w-full text-sm text-gray-500" />
                </div>
            </div>
            )}

            <div>
              <button type="submit" disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                {loading ? 'กำลังบันทึกข้อมูล...' : 'ลงทะเบียนสมัครตัวแทน'}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}