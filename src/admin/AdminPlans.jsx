import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Plus, Edit, Trash2, ArrowLeft, Save, X, Shield, LogOut, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminPlans() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [currentPlan, setCurrentPlan] = useState({
    id: null,
    slug: '',
    title: '',
    category: '',
    description: '',
    google_drive_file_id: '',
    is_active: true
  });

  const [rates, setRates] = useState([]);
  const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

  // ค้นหาจากทุกคอลัมน์ที่แสดงในตาราง โดยไม่สนตัวพิมพ์เล็ก/ใหญ่
  const filteredPlans = useMemo(() => {
    const keyword = searchTerm.trim().toLocaleLowerCase();

    if (!keyword) return plans;

    return plans.filter(plan => {
      const searchableValues = [
        plan.title,
        plan.slug,
        plan.category,
        plan.google_drive_file_id,
        plan.is_active !== false ? 'เปิดใช้งาน active enabled true' : 'ปิดใช้งาน inactive disabled false',
      ];

      return searchableValues.some(value =>
        String(value ?? '').toLocaleLowerCase().includes(keyword)
      );
    });
  }, [plans, searchTerm]);

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

  const handleLogout = () => {
    const confirmed = window.confirm('ต้องการออกจากระบบผู้ดูแลระบบใช่หรือไม่?');
    if (!confirmed) return;

    localStorage.removeItem('admin_token');
    navigate('/login', { replace: true });
  };

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

  const handleOpenEdit = (plan) => {
    setIsEditing(true);
    setCurrentPlan(plan);
    setShowModal(true);

    // ดึงเรทเบี้ยจาก API รวม (หรือถ้าตัว plan มีเรทเบี้ยติดมาด้วยอยู่แล้ว ให้เอามาใช้เลย)
    // หรือถ้า Backend มีการเก็บเรทแยก ให้ยิงไปดึง หรือถ้าตอนนี้ยังไม่มี API แยก ใช้ข้อมูลจำลอง/ค่าว่างไปก่อนเพื่อไม่ให้ติด 404
    axios.get(`${apiUrl}/api/plans`)
      .then(res => {
        const allPlans = res.data || [];
        const found = allPlans.find(p => p.id === plan.id);
        const fetchedRates = found?.rates || plan.rates || [];
        
        setRates(fetchedRates.map(r => ({
          plan_id: plan.id,
          min_age: r.min_age ?? '',
          max_age: r.max_age ?? '',
          male_rate: r.male_rate ?? '',
          female_rate: r.female_rate ?? ''
        })));
      })
      .catch(err => {
        console.error('Error fetching rates:', err);
        setRates([]);
      });
  };

  const handleDeletePlan = (id) => {
    if (window.confirm('คุณต้องการลบแผนประกันนี้ใช่หรือไม่?')) {
      axios.delete(`${apiUrl}/api/plans/${id}`)
        .then(() => fetchPlans())
        .catch(err => alert('เกิดข้อผิดพลาดในการลบข้อมูล: ' + err.message));
    }
  };

  const handleAddRateRow = () => {
    setRates([...rates, { 
      plan_id: currentPlan.id || null, 
      min_age: '', 
      max_age: '', 
      male_rate: '', 
      female_rate: '' 
    }]);
  };

  const handleRemoveRateRow = (index) => {
    setRates(rates.filter((_, i) => i !== index));
  };

  const handleRateChange = (index, field, value) => {
    const updated = [...rates];
    updated[index][field] = value;
    setRates(updated);
  };

  
  const handleSavePlan = (e) => {
    e.preventDefault();

    // อ่าน Token ที่บันทึกไว้หลัง Login
    const token = localStorage.getItem('admin_token');

    if (!token) {
      alert('ไม่พบ Token กรุณาเข้าสู่ระบบใหม่');
      return;
    }

    // เตรียมข้อมูลเรทเบี้ย
    const payloadRates = rates.map(r => ({
      ...r,
      plan_id: currentPlan.id
    }));

    const payload = {
      ...currentPlan,
      rates: payloadRates
    };

    // ส่ง Token ไปกับ Request ทุกครั้ง
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    const request = isEditing
      ? axios.put(
          `${apiUrl}/api/plans/${currentPlan.id}`,
          payload,
          config
        )
      : axios.post(
          `${apiUrl}/api/plans`,
          payload,
          config
        );

    request
      .then(() => {
        alert('บันทึกข้อมูลสำเร็จ!');
        setShowModal(false);
        fetchPlans();
      })
      .catch(err => {
        console.error('Save plan error:', err.response?.data || err);

        const message =
          err.response?.data?.error ||
          err.response?.data?.message ||
          err.message;

        alert('เกิดข้อผิดพลาดในการบันทึก: ' + message);
      });
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header แอดมิน */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 gap-4">
          <div>
            <a href="/" className="inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-800 mb-2 transition">
              <ArrowLeft className="w-4 h-4 mr-1" /> กลับสู่หน้าเว็บไซต์หลัก
            </a>
            <h1 className="text-2xl font-extrabold text-gray-900">ระบบจัดการแผนประกัน (Admin CMS)</h1>
            <p className="text-sm text-gray-500">จัดการข้อมูลแผนประกันและตารางอัตราเบี้ยประกันภัย</p>
          </div>
          <button 
            onClick={handleOpenNew}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-md transition flex items-center gap-2 whitespace-nowrap"
          >
            <Plus className="w-5 h-5" /> เพิ่มแผนใหม่ (New)
          </button>
          <button
              onClick={handleLogout}
              className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-semibold px-4 py-2.5 rounded-xl transition flex items-center gap-2 whitespace-nowrap"
              title="ออกจากระบบ"
            >
              <LogOut className="w-5 h-5" /> Logout
            </button>
        </div>

        {/* ตารางแสดงรายการ Plan */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Search ครอบคลุมทุกคอลัมน์ในตาราง */}
          <div className="p-4 md:p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative w-full sm:max-w-md">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="ค้นหาชื่อแผน, Slug, หมวดหมู่, Google Drive ID หรือสถานะ..."
                aria-label="ค้นหาทุกคอลัมน์ของตารางแผนประกัน"
                className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 text-xs font-semibold"
                  aria-label="ล้างคำค้นหา"
                >
                  ล้าง
                </button>
              )}
            </div>
            <p className="text-sm text-gray-500 whitespace-nowrap">
              พบ <span className="font-bold text-gray-800">{filteredPlans.length}</span> จาก {plans.length} รายการ
            </p>
          </div>

          {loading ? (
            <div className="text-center py-20 text-gray-400 font-medium">กำลังโหลดข้อมูล...</div>
          ) : (
            <div className={`overflow-x-auto ${filteredPlans.length > 10 ? 'max-h-[900px] overflow-y-auto' : ''}`}>
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-900 text-white text-xs uppercase tracking-wider sticky top-0 z-10">
                    <th className="py-4 px-6">ชื่อแผน (Title)</th>
                    <th className="py-4 px-6">Slug</th>
                    <th className="py-4 px-6">หมวดหมู่</th>
                    <th className="py-4 px-6 text-center">Google Drive ID</th>
                    <th className="py-4 px-6 text-center">สถานะ</th>
                    <th className="py-4 px-6 text-center">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {filteredPlans.map(plan => (
                    <tr key={plan.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-4 px-6 font-bold text-gray-900 max-w-xs truncate">{plan.title}</td>
                      <td className="py-4 px-6 text-gray-600 font-mono text-xs">{plan.slug}</td>
                      <td className="py-4 px-6">
                        <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">
                          {plan.category}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center font-mono text-xs text-gray-500">
                        {plan.google_drive_file_id ? (
                          <span className="bg-gray-100 px-2.5 py-1 rounded-md">{plan.google_drive_file_id.substring(0, 12)}...</span>
                        ) : '-'}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${plan.is_active !== false ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                          {plan.is_active !== false ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center space-x-2">
                        <button onClick={() => handleOpenEdit(plan)} className="inline-flex items-center gap-1 bg-amber-50 hover:bg-amber-100 text-amber-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition" title="แก้ไข">
                          <Edit className="w-3.5 h-3.5" /> แก้ไข
                        </button>
                        <button onClick={() => handleDeletePlan(plan.id)} className="inline-flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition" title="ลบ">
                          <Trash2 className="w-3.5 h-3.5" /> ลบ
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredPlans.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center py-12 text-gray-400">
                        {plans.length === 0
                          ? 'ยังไม่มีข้อมูลแผนประกันในระบบ'
                          : 'ไม่พบข้อมูลที่ตรงกับคำค้นหา ลองใช้คำค้นหาอื่น'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal สำหรับ New / Edit Plan */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-4xl w-full p-6 md:p-8 relative shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
              <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 bg-gray-100 p-2 rounded-full transition">
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Shield className="w-6 h-6 text-blue-600" />
                {isEditing ? 'แก้ไขข้อมูลแผนประกัน (Edit Plan)' : 'เพิ่มแผนประกันใหม่ (New Plan)'}
              </h2>

              <form onSubmit={handleSavePlan} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">ชื่อแผนประกัน (Title)</label>
                    <input type="text" required value={currentPlan.title} onChange={e => setCurrentPlan({...currentPlan, title: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600 outline-none" placeholder="เช่น ประกันสุขภาพแคร์คุ้ม" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Slug (ลิงก์ URL เช่น health-care-1)</label>
                    <input type="text" required value={currentPlan.slug} onChange={e => setCurrentPlan({...currentPlan, slug: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600 outline-none font-mono" placeholder="health-care-1" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">หมวดหมู่ (Category)</label>
                    <input type="text" required value={currentPlan.category} onChange={e => setCurrentPlan({...currentPlan, category: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600 outline-none" placeholder="สุขภาพ, มรดก, สะสมทรัพย์" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Google Drive File ID (รูปภาพ)</label>
                    <input type="text" value={currentPlan.google_drive_file_id || ''} onChange={e => setCurrentPlan({...currentPlan, google_drive_file_id: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600 outline-none font-mono" placeholder="รหัสยาวๆ จากลิงก์แชร์ Google Drive" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">รายละเอียดแผน (Description)</label>
                  <textarea rows="3" value={currentPlan.description || ''} onChange={e => setCurrentPlan({...currentPlan, description: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600 outline-none" placeholder="รายละเอียดเงื่อนไขความคุ้มครอง..."></textarea>
                </div>

                <div className="flex items-center gap-2.5 bg-slate-50 p-4 rounded-xl border border-gray-100">
                  <input type="checkbox" id="is_active" checked={currentPlan.is_active !== false} onChange={e => setCurrentPlan({...currentPlan, is_active: e.target.checked})} className="w-4 h-4 text-blue-600 rounded border-gray-300" />
                  <label htmlFor="is_active" className="text-sm font-semibold text-gray-700 select-none cursor-pointer">เปิดใช้งานแผนประกันนี้บนหน้าเว็บไซต์ (Active)</label>
                </div>

                {/* ส่วนจัดการข้อมูลเบี้ยประกัน (public.premium_rates) */}
                <div className="border-t border-gray-200 pt-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
                    <div>
                      <h3 className="text-base font-bold text-gray-900">ตารางอัตราเบี้ยประกัน (Premium Rates)</h3>
                      <p className="text-xs text-gray-500">กำหนดช่วงอายุและเรทเบี้ยสำหรับเพศชายและหญิง (ระบบผูก plan_id ให้ automic)</p>
                    </div>
                    <button type="button" onClick={handleAddRateRow} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shadow-sm">
                      <Plus className="w-4 h-4" /> เพิ่มช่วงอายุ/เรทเบี้ย
                    </button>
                  </div>

                  <div className="border border-gray-200 rounded-2xl overflow-hidden max-h-64 overflow-y-auto bg-slate-50/50">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-100 text-xs text-gray-700 uppercase sticky top-0 z-10">
                        <tr>
                          <th className="p-3">อายุต่ำสุด</th>
                          <th className="p-3">อายุสูงสุด</th>
                          <th className="p-3">เบี้ยชาย (Male Rate)</th>
                          <th className="p-3">เบี้ยหญิง (Female Rate)</th>
                          <th className="p-3 text-center">จัดการ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 text-sm bg-white">
                        {rates.map((rate, index) => (
                          <tr key={index}>
                            <td className="p-2.5">
                              <input type="number" value={rate.min_age} onChange={e => handleRateChange(index, 'min_age', e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 outline-none" placeholder="20" />
                            </td>
                            <td className="p-2.5">
                              <input type="number" value={rate.max_age} onChange={e => handleRateChange(index, 'max_age', e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 outline-none" placeholder="25" />
                            </td>
                            <td className="p-2.5">
                              <input type="number" value={rate.male_rate} onChange={e => handleRateChange(index, 'male_rate', e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 outline-none" placeholder="1000" />
                            </td>
                            <td className="p-2.5">
                              <input type="number" value={rate.female_rate} onChange={e => handleRateChange(index, 'female_rate', e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 outline-none" placeholder="900" />
                            </td>
                            <td className="p-2.5 text-center">
                              <button type="button" onClick={() => handleRemoveRateRow(index)} className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition" title="ลบแถวนี้">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                        {rates.length === 0 && (
                          <tr><td colSpan="5" className="text-center py-8 text-gray-400 text-xs">ยังไม่มีข้อมูลเรทเบี้ย กดปุ่ม "เพิ่มช่วงอายุ/เรทเบี้ย" ด้านบนเพื่อเพิ่มข้อมูล</td></tr>
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