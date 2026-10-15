import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit, Trash2, ArrowLeft, Save, X } from 'lucide-react';

export default function AdminPlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // สถานะสำหรับเปิด/ปิด Modal และโหมด (New / Edit)
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // ข้อมูลแผนประกันที่กำลังเพิ่ม/แก้ไข
  const [currentPlan, setCurrentPlan] = useState({
    id: null,
    slug: '',
    title: '',
    category: '',
    description: '',
    google_drive_file_id: '',
    is_active: true
  });

  // ข้อมูลตารางเบี้ยประกัน (public.premium_rates) ของแผนนั้นๆ
  const [rates, setRates] = useState([]);

  const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

  // โหลดรายการแผนประกันทั้งหมด
  const fetchPlans = () => {
    setLoading(true);
    axios.get(`${apiUrl}/api/plans`)
      .then(res => {
        setPlans(res.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching plans:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  // เปิด Modal สำหรับสร้างแผนใหม่ (New)
  const handleOpenNew = () => {
    setIsEditing(false);
    setCurrentPlan({
      slug: '',
      title: '',
      category: 'สุขภาพ',
      description: '',
      google_drive_file_id: '',
      is_active: true
    });
    setRates([]);
    setShowModal(true);
  };

  // เปิด Modal สำหรับแก้ไขแผน (Edit) พร้อมดึงเรทเบี้ยประกันมาแสดง
  const handleOpenEdit = (plan) => {
    setIsEditing(true);
    setCurrentPlan(plan);
    setShowModal(true);

    // ดึงข้อมูลเรทเบี้ยประกันของแผนนี้
    axios.get(`${apiUrl}/api/plans/${plan.id}`)
      .then(res => {
        setRates(res.data.rates || []);
      })
      .catch(err => {
        console.error('Error fetching plan rates:', err);
        setRates([]);
      });
  };

  // ลบแผนประกัน (Delete)
  const handleDeletePlan = (id) => {
    if (window.confirm('คุณต้องการลบแผนประกันนี้ใช่หรือไม่?')) {
      axios.delete(`${apiUrl}/api/plans/${id}`)
        .then(() => fetchPlans())
        .catch(err => alert('เกิดข้อผิดพลาดในการลบข้อมูล: ' + err.message));
    }
  };

  // เพิ่มแถวตารางเรทเบี้ยใหม่ชั่วคราวก่อนกดบันทึก
  const handleAddRateRow = () => {
    setRates([...rates, { min_age: '', max_age: '', male_rate: '', female_rate: '' }]);
  };

  // ลบแถวเรทเบี้ย
  const handleRemoveRateRow = (index) => {
    const updated = rates.filter((_, i) => i !== index);
    setRates(updated);
  };

  // อัปเดตค่าในแถวเรทเบี้ย
  const handleRateChange = (index, field, value) => {
    const updated = [...rates];
    updated[index][field] = value;
    setRates(updated);
  };

  // บันทึกข้อมูล (Save - รองรับทั้ง Create ใหม่ และ Update)
  const handleSavePlan = (e) => {
    e.preventDefault();
    const payload = {
      ...currentPlan,
      rates: rates
    };

    const request = isEditing
      ? axios.put(`${apiUrl}/api/plans/${currentPlan.id}`, payload)
      : axios.post(`${apiUrl}/api/plans`, payload);

    request
      .then(() => {
        alert('บันทึกข้อมูลสำเร็จ!');
        setShowModal(false);
        fetchPlans();
      })
      .catch(err => {
        alert('เกิดข้อผิดพลาดในการบันทึก: ' + (err.response?.data?.message || err.message));
      });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header แอดมิน */}
        <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <a href="/" className="inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-800 mb-2">
              <ArrowLeft className="w-4 h-4 mr-1" /> กลับสู่หน้าเว็บไซต์หลัก
            </a>
            <h1 className="text-2xl font-extrabold text-gray-900">ระบบจัดการแผนประกัน (Admin CMS)</h1>
          </div>
          <button 
            onClick={handleOpenNew}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-md transition flex items-center gap-2"
          >
            <Plus className="w-5 h-5" /> เพิ่มแผนใหม่ (New)
          </button>
        </div>

        {/* ตารางแสดงรายการ Plan */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="text-center py-20 text-gray-400">กำลังโหลดข้อมูล...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white text-xs uppercase tracking-wider">
                    <th className="py-4 px-4">Title</th>
                    <th className="py-4 px-4">Slug</th>
                    <th className="py-4 px-4">Category</th>
                    <th className="py-4 px-4 text-center">Google Drive ID</th>
                    <th className="py-4 px-4 text-center">สถานะ</th>
                    <th className="py-4 px-4 text-center">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {plans.map(plan => (
                    <tr key={plan.id} className="hover:bg-slate-50 transition">
                      <td className="py-4 px-4 font-bold text-gray-900">{plan.title}</td>
                      <td className="py-4 px-4 text-gray-600 font-mono text-xs">{plan.slug}</td>
                      <td className="py-4 px-4">
                        <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                          {plan.category}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center font-mono text-xs text-gray-500 truncate max-w-[150px]">
                        {plan.google_drive_file_id || '-'}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${plan.is_active !== false ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                          {plan.is_active !== false ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center space-x-2">
                        <button onClick={() => handleOpenEdit(plan)} className="bg-amber-50 hover:bg-amber-100 text-amber-700 p-2 rounded-lg transition" title="แก้ไข">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeletePlan(plan.id)} className="bg-red-50 hover:bg-red-100 text-red-700 p-2 rounded-lg transition" title="ลบ">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {plans.length === 0 && (
                    <tr><td colSpan="6" className="text-center py-10 text-gray-400">ยังไม่มีข้อมูลแผนประกันในระบบ</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal สำหรับ New / Edit Plan */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-4xl w-full p-8 relative shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
              <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 bg-gray-100 p-2 rounded-full transition">
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {isEditing ? 'แก้ไขข้อมูลแผนประกัน (Edit Plan)' : 'เพิ่มแผนประกันใหม่ (New Plan)'}
              </h2>

              <form onSubmit={handleSavePlan} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">ชื่อแผนประกัน (Title)</label>
                    <input type="text" required value={currentPlan.title} onChange={e => setCurrentPlan({...currentPlan, title: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600 outline-none" placeholder="เช่น ประกันสุขภาพแคร์คุ้ม" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Slug (ลิงก์ URL เช่น health-care-1)</label>
                    <input type="text" required value={currentPlan.slug} onChange={e => setCurrentPlan({...currentPlan, slug: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600 outline-none font-mono" placeholder="health-care-1" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">หมวดหมู่ (Category)</label>
                    <input type="text" required value={currentPlan.category} onChange={e => setCurrentPlan({...currentPlan, category: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600 outline-none" placeholder="สุขภาพ, มรดก, สะสมทรัพย์" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Google Drive File ID (สำหรับรูปภาพ)</label>
                    <input type="text" value={currentPlan.google_drive_file_id || ''} onChange={e => setCurrentPlan({...currentPlan, google_drive_file_id: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600 outline-none font-mono" placeholder="รหัสยาวๆ จากลิงก์แชร์ Google Drive" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">รายละเอียดแผน (Description)</label>
                  <textarea rows="3" value={currentPlan.description || ''} onChange={e => setCurrentPlan({...currentPlan, description: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600 outline-none" placeholder="รายละเอียดเงื่อนไขความคุ้มครอง..."></textarea>
                </div>

                <div className="flex items-center gap-2">
                  <input type="checkbox" id="is_active" checked={currentPlan.is_active !== false} onChange={e => setCurrentPlan({...currentPlan, is_active: e.target.checked})} className="w-4 h-4 text-blue-600 rounded border-gray-300" />
                  <label htmlFor="is_active" className="text-sm font-semibold text-gray-700">เปิดใช้งานแผนประกันนี้ (Active)</label>
                </div>

                {/* ส่วนจัดการข้อมูลเบี้ยประกัน (public.premium_rates) */}
                <div className="border-t border-gray-200 pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-900">ตารางอัตราเบี้ยประกัน (Premium Rates)</h3>
                    <button type="button" onClick={handleAddRateRow} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition flex items-center gap-1">
                      <Plus className="w-4 h-4" /> เพิ่มช่วงอายุ/เรทเบี้ย
                    </button>
                  </div>

                  <div className="border border-gray-200 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-100 text-xs text-gray-700 uppercase">
                        <tr>
                          <th className="p-2.5">อายุต่ำสุด</th>
                          <th className="p-2.5">อายุสูงสุด</th>
                          <th className="p-2.5">เบี้ยชาย (Male Rate)</th>
                          <th className="p-2.5">เบี้ยหญิง (Female Rate)</th>
                          <th className="p-2.5 text-center">จัดการ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-sm">
                        {rates.map((rate, index) => (
                          <tr key={index}>
                            <td className="p-2">
                              <input type="number" value={rate.min_age} onChange={e => handleRateChange(index, 'min_age', e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm" placeholder="20" />
                            </td>
                            <td className="p-2">
                              <input type="number" value={rate.max_age} onChange={e => handleRateChange(index, 'max_age', e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm" placeholder="25" />
                            </td>
                            <td className="p-2">
                              <input type="number" value={rate.male_rate} onChange={e => handleRateChange(index, 'male_rate', e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm" placeholder="1000" />
                            </td>
                            <td className="p-2">
                              <input type="number" value={rate.female_rate} onChange={e => handleRateChange(index, 'female_rate', e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm" placeholder="900" />
                            </td>
                            <td className="p-2 text-center">
                              <button type="button" onClick={() => handleRemoveRateRow(index)} className="text-red-500 hover:text-red-700 p-1">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                        {rates.length === 0 && (
                          <tr><td colSpan="5" className="text-center py-6 text-gray-400 text-xs">ยังไม่มีข้อมูลเรทเบี้ย กดปุ่ม "เพิ่มช่วงอายุ/เรทเบี้ย" ด้านบน</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <button type="button" onClick={() => setShowModal(false)} className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-5 py-2.5 rounded-xl transition">
                    ยกเลิก (Cancel)
                  </button>
                  <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-xl shadow-md transition flex items-center gap-2">
                    <Save className="w-4 h-4" /> บันทึกข้อมูล (Save)
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}