import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Shield, Phone, MessageSquare, CheckCircle, User, Calendar, X, ArrowLeft, Table, Filter, ZoomIn, Share2, Copy, Check } from 'lucide-react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';

import Login from './Login';                           
import ProtectedRoute from './ProtectedRoute';       
import AdminPlans from './admin/AdminPlans';
import AdminDashboard from './admin/AdminDashboard';
import RegisterSelection from './RegisterSelection'; // หรือสร้างคอมโพเนนต์ด้านล่างนี้ได้เลย
import Register from './Register';


// คอมโพเนนต์หน้าหลักของเว็บไซต์ (แยกออกมาจาก App หลักเพื่อให้ Router ทำงานถูกต้อง)
function MainStore() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('ทั้งหมด');
  const categories = ['ทั้งหมด', 'มรดก', 'สะสมทรัพย์', 'สุขภาพ', 'ชดเชยรายวัน', 'โรคร้ายแรง', 'มะเร็ง', 'อุบัติเหตุ'];
  
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ full_name: '', phone_number: '', line_id: '', date_of_birth: '' });
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [showImageModal, setShowImageModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

  useEffect(() => {
    axios.get(`${apiUrl}/api/plans`)
      .then(response => {
        const fetchedPlans = response.data || [];
        setPlans(fetchedPlans);
        
        const params = new URLSearchParams(window.location.search);
        const planSlug = params.get('slug');
        if (planSlug) {
          const found = fetchedPlans.find(p => p.slug === planSlug);
          if (found) {
            setSelectedPlan(found);
            updatePageMeta(found);
          }
        }
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching plans:', error);
        setLoading(false);
      });
  }, []);

  const updatePageMeta = (plan) => {
    if (plan) {
      document.title = `${plan.title} | ตูมตาม ประกันออนไลน์`;
      setMetaTag('description', plan.description ? plan.description.substring(0, 150) + '...' : 'รายละเอียดแผนประกันภัย');
      setMetaTag('og:title', `${plan.title} | ตูมตาม ประกันออนไลน์`);
      setMetaTag('og:description', plan.description ? plan.description.substring(0, 150) + '...' : 'รายละเอียดแผนประกันภัย');
      if (plan.google_drive_file_id) {
        setMetaTag('og:image', `https://lh3.googleusercontent.com/d/${plan.google_drive_file_id}`);
      }
    } else {
      document.title = 'ตูมตาม ประกันออนไลน์ | ตัวแทนประกันชีวิต อลิอันซ์ อยุธยา';
      setMetaTag('description', 'เลือกแผนประกันภัยที่ใช่สำหรับคุณและคนที่คุณรัก ดูแลโดยตัวแทนมืออาชีพ');
      setMetaTag('og:title', 'ตูมตาม ประกันออนไลน์ | ตัวแทนประกันชีวิต อลิอันซ์ อยุธยา');
      setMetaTag('og:description', 'เลือกแผนประกันภัยที่ใช่สำหรับคุณและคนที่คุณรัก ดูแลโดยตัวแทนมืออาชีพ');
    }
  }; 

  const setMetaTag = (nameOrProperty, content) => {
    let element = document.querySelector(`meta[name="${nameOrProperty}"]`) || document.querySelector(`meta[property="${nameOrProperty}"]`);
    if (element) {
      element.setAttribute('content', content);
    }
  };

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    updatePageMeta(plan);
    
    if (plan) {
      const newUrl = `${window.location.pathname}?slug=${plan.slug}`;
      window.history.pushState({ path: newUrl }, '', newUrl);

      const viewedKey = `viewed_plan_${plan.id}`;
      if (!sessionStorage.getItem(viewedKey)) {
        sessionStorage.setItem(viewedKey, 'true');
        axios.post(`${apiUrl}/api/plans/${plan.id}/view`)
          .catch(err => console.error("Error updating view count", err));
      }
    } else {
      const newUrl = window.location.pathname;
      window.history.pushState({ path: newUrl }, '', newUrl);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCopyLink = (slug) => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?slug=${slug}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredPlans = selectedCategory === 'ทั้งหมด' 
    ? plans 
    : plans.filter(plan => {
        if (!plan.category) return false;
        const planCategories = plan.category.split(',').map(cat => cat.trim());
        return planCategories.includes(selectedCategory);
      });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    const payload = {
      plan_id: selectedPlan.id,
      full_name: formData.full_name,
      phone_number: formData.phone_number,
      line_id: formData.line_id || '-',
      date_of_birth: formData.date_of_birth
    };

    axios.post(`${apiUrl}/api/leads`, payload)
      .then(() => {
        setSubmitting(false);
        setSuccessMsg('ส่งข้อมูลสำเร็จ! เจ้าหน้าที่ได้รับข้อมูลเรียบร้อยแล้ว จะรีบติดต่อกลับโดยเร็วที่สุดครับ');
        setFormData({ full_name: '', phone_number: '', line_id: '', date_of_birth: '' });
      })
      .catch(error => {
        setSubmitting(false);
        alert('เกิดข้อผิดพลาดในการส่งข้อมูล กรุณาลองใหม่อีกครั้ง');
        console.error(error);
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col justify-between font-sans">
      <div className="max-w-6xl mx-auto px-4 py-10 w-full flex-grow">
        <header className="text-center mb-10">
          <div className="inline-flex items-center justify-center bg-blue-600 text-white p-3 rounded-full shadow-lg mb-4 cursor-pointer" onClick={() => handleSelectPlan(null)}>
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-extrabold text-blue-900 tracking-tight cursor-pointer" onClick={() => handleSelectPlan(null)}>ตูมตาม ประกันออนไลน์</h1>
          <p className="text-gray-600 mt-2 text-lg">เลือกแผนประกันภัยที่ใช่สำหรับคุณและคนที่คุณรัก ดูแลโดยมืออาชีพ</p>
        </header>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-500 font-medium">กำลังโหลดข้อมูลแผนประกัน...</span>
          </div>
        ) : !selectedPlan ? (
          <div>
            <div className="flex items-center justify-start md:justify-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
              <div className="flex items-center gap-1.5 text-gray-400 mr-2 text-sm font-semibold hidden md:flex">
                <Filter className="w-4 h-4" /> หมวดหมู่:
              </div>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 shadow-sm ${
                    selectedCategory === cat ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {filteredPlans.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-gray-200 shadow-sm">
                <Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">ไม่พบแผนประกันในหมวดหมู่นี้</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPlans.map(plan => (
                  <div key={plan.id} className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col justify-between">
                    {plan.google_drive_file_id ? (
                      <div className="w-full aspect-square bg-slate-900 overflow-hidden relative flex items-center justify-center cursor-pointer" onClick={() => handleSelectPlan(plan)}>
                        <img src={`https://lh3.googleusercontent.com/d/${plan.google_drive_file_id}`} alt={plan.title} className="w-full h-full object-contain hover:scale-105 transition duration-300" />
                      </div>
                    ) : (
                      <div className="w-full aspect-square bg-blue-600 flex items-center justify-center text-white cursor-pointer" onClick={() => handleSelectPlan(plan)}>
                        <Shield className="w-16 h-16 opacity-80" />
                      </div>
                    )}

                    <div className="p-6 flex-grow flex flex-col justify-between">
                      <div>
                        <span className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-block mb-3">
                          {plan.category}
                        </span>
                        <h2 className="text-xl font-bold text-gray-900 mb-2 cursor-pointer hover:text-blue-600 transition" onClick={() => handleSelectPlan(plan)}>{plan.title}</h2>
                        <p className="text-gray-600 text-sm leading-relaxed mb-6 line-clamp-3 whitespace-pre-line">
                          {plan.description ? plan.description.replace(/\\n/g, '\n') : ''}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <button onClick={() => handleSelectPlan(plan)} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl shadow-md transition duration-200">
                          สนใจแผนนี้ / ดูตารางเบี้ย
                        </button>
                        <button onClick={() => handleCopyLink(plan.slug)} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold py-2 rounded-xl transition flex items-center justify-center gap-1.5">
                          <Share2 className="w-4 h-4" /> คัดลอกลิงก์แชร์
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <button onClick={() => handleSelectPlan(null)} className="inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-800 transition">
                <ArrowLeft className="w-4 h-4 mr-2" /> กลับไปหน้าเลือกแผนประกัน
              </button>
              
              <button 
                onClick={() => handleCopyLink(selectedPlan.slug)}
                className="inline-flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-semibold px-4 py-2 rounded-xl transition"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                {copied ? 'คัดลอกลิงก์สำเร็จ!' : 'คัดลอกลิงก์แผนนี้'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              {selectedPlan.google_drive_file_id ? (
                <div onClick={() => setShowImageModal(true)} className="rounded-2xl overflow-hidden w-full aspect-square bg-slate-900 flex items-center justify-center shadow-inner relative group cursor-pointer border border-slate-800" title="คลิกเพื่อขยายรูป">
                  <img src={`https://lh3.googleusercontent.com/d/${selectedPlan.google_drive_file_id}`} alt={selectedPlan.title} className="w-full h-full object-contain group-hover:scale-105 transition duration-300" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center text-white space-x-2">
                    <ZoomIn className="w-6 h-6" />
                    <span className="text-sm font-semibold">คลิกเพื่อขยายรูป</span>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl w-full aspect-square bg-blue-600 flex items-center justify-center text-white">
                  <Shield className="w-20 h-20 opacity-80" />
                </div>
              )}

              <div className="md:col-span-2 flex flex-col justify-between">
                <div>
                  <span className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    {selectedPlan.category}
                  </span>
                  <h2 className="text-3xl font-extrabold text-gray-900 mt-3 mb-4">{selectedPlan.title}</h2>
                  <p className="text-gray-700 text-base leading-relaxed whitespace-pre-line mb-6">
                    {selectedPlan.description ? selectedPlan.description.replace(/\\n/g, '\n') : ''}
                  </p>
                </div>

                <button onClick={() => { setShowModal(true); setSuccessMsg(''); }} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-2xl shadow-lg shadow-blue-200 transition duration-200 flex items-center justify-center space-x-2 text-lg">
                  <span>กรอกข้อมูลสมัครแผนนี้</span>
                </button>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-8 mt-8">
              <div className="flex items-center space-x-2 mb-6">
                <div className="bg-blue-100 p-2 rounded-xl text-blue-600">
                  <Table className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">ตารางอัตราเบี้ยประกันภัย</h3>
              </div>

              <div className="max-h-[450px] overflow-y-auto overflow-x-auto rounded-2xl border border-gray-200 shadow-sm relative">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 z-20 shadow-sm">
                    <tr className="bg-slate-900 text-white text-xs uppercase tracking-wider text-center">
                      <th rowSpan="2" className="py-3 px-4 border-r border-slate-700 align-middle w-32 bg-slate-900">ช่วงอายุ</th>
                      <th colSpan="4" className="py-2.5 px-4 bg-blue-900 border-r border-slate-700 text-blue-100 font-bold">👨 เพศชาย (บาท)</th>
                      <th colSpan="4" className="py-2.5 px-4 bg-pink-900 text-pink-100 font-bold">👩 เพศหญิง (บาท)</th>
                    </tr>
                    <tr className="bg-slate-800 text-slate-300 text-xs uppercase tracking-wider text-right">
                      <th className="py-2.5 px-3 font-medium bg-slate-800">รายปี</th>
                      <th className="py-2.5 px-3 font-medium bg-slate-800">ราย 6 เดือน</th>
                      <th className="py-2.5 px-3 font-medium bg-slate-800">ราย 3 เดือน</th>
                      <th className="py-2.5 px-3 font-medium border-r border-slate-700 bg-slate-800">รายเดือน</th>
                      <th className="py-2.5 px-3 font-medium bg-slate-800">รายปี</th>
                      <th className="py-2.5 px-3 font-medium bg-slate-800">ราย 6 เดือน</th>
                      <th className="py-2.5 px-3 font-medium bg-slate-800">ราย 3 เดือน</th>
                      <th className="py-2.5 px-3 font-medium bg-slate-800">รายเดือน</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 text-sm text-gray-700 bg-white">
                    {selectedPlan.rates && selectedPlan.rates.length > 0 ? (
                      [...selectedPlan.rates]
                        .sort((a, b) => (a.min_age || 0) - (b.min_age || 0))
                        .map((rate, index) => {
                          const mBase = Number(rate.male_rate) || 0;
                          const fBase = Number(rate.female_rate) || 0;
                          const formatInt = (val) => val <= 0 ? '-' : Math.round(val).toLocaleString();

                          return (
                            <tr key={index} className="hover:bg-blue-50/40 transition">
                              <td className="py-3 px-4 font-bold text-center text-gray-900 border-r border-gray-100 bg-gray-50/50">{rate.age_range}</td>
                              <td className="py-3 px-3 text-right font-semibold text-blue-900 bg-blue-50/10">{formatInt(mBase)}</td>
                              <td className="py-3 px-3 text-right text-gray-600 bg-blue-50/10">{formatInt(mBase * 0.52)}</td>
                              <td className="py-3 px-3 text-right text-gray-600 bg-blue-50/10">{formatInt(mBase * 0.27)}</td>
                              <td className="py-3 px-3 text-right text-gray-600 border-r border-gray-200 bg-blue-50/10">{formatInt(mBase * 0.09)}</td>
                              <td className="py-3 px-3 text-right font-semibold text-pink-900 bg-pink-50/10">{formatInt(fBase)}</td>
                              <td className="py-3 px-3 text-right text-gray-600 bg-pink-50/10">{formatInt(fBase * 0.52)}</td>
                              <td className="py-3 px-3 text-right text-gray-600 bg-pink-50/10">{formatInt(fBase * 0.27)}</td>
                              <td className="py-3 px-3 text-right text-gray-600 bg-pink-50/10">{formatInt(fBase * 0.09)}</td>
                            </tr>
                          );
                        })
                    ) : (
                      <tr><td colSpan="9" className="py-8 text-center text-gray-400">ยังไม่มีข้อมูลอัตราเบี้ยในระบบ</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {showImageModal && selectedPlan && selectedPlan.google_drive_file_id && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50" onClick={() => setShowImageModal(false)}>
            <div className="relative max-w-4xl w-full max-h-[90vh] flex items-center justify-center p-2" onClick={e => e.stopPropagation()}>
              <button onClick={() => setShowImageModal(false)} className="absolute -top-12 right-0 text-white hover:text-gray-300 bg-white/10 hover:bg-white/20 p-2.5 rounded-full transition z-10">
                <X className="w-6 h-6" />
              </button>
              <img src={`https://lh3.googleusercontent.com/d/${selectedPlan.google_drive_file_id}`} alt={selectedPlan.title} className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl border border-white/10" />
            </div>
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl max-w-md w-full p-8 relative shadow-2xl border border-gray-100">
              <button onClick={() => setShowModal(false)} className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition">
                <X className="w-5 h-5" />
              </button>

              <div className="mb-6">
                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">แบบฟอร์มสมัครออนไลน์</span>
                <h3 className="text-xl font-bold text-gray-900 mt-1">{selectedPlan?.title}</h3>
              </div>

              {successMsg ? (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-6 rounded-2xl text-center space-y-4">
                  <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
                  <p className="font-medium text-sm leading-relaxed">{successMsg}</p>
                  <button onClick={() => { setShowModal(false); handleSelectPlan(null); }} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-sm font-semibold transition">
                    กลับสู่หน้าหลัก
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1 flex items-center gap-1"><User className="w-3.5 h-3.5 text-blue-600" /> ชื่อ - นามสกุล</label>
                    <input type="text" required value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600" placeholder="เช่น สมชาย ใจดี" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1 flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-blue-600" /> เบอร์โทรศัพท์</label>
                    <input type="tel" required value={formData.phone_number} onChange={e => setFormData({...formData, phone_number: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600" placeholder="เช่น **********" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1 flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5 text-blue-600" /> Line ID (ถ้ามี)</label>
                    <input type="text" value={formData.line_id} onChange={e => setFormData({...formData, line_id: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600" placeholder="เช่น somchai_line" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1 flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-blue-600" /> วันเดือนปีเกิด</label>
                    <input type="date" required value={formData.date_of_birth} onChange={e => setFormData({...formData, date_of_birth: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600" />
                  </div>
                  <button type="submit" disabled={submitting} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-xl shadow-lg transition duration-200 mt-4 disabled:opacity-50">
                    {submitting ? 'กำลังส่งข้อมูล...' : 'ยืนยันการสมัครแผนประกัน'}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>

      <footer className="bg-slate-900 text-slate-300 py-10 px-4 border-t border-slate-800 mt-12">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="flex items-center justify-center space-x-2 text-white font-bold text-xl">
            <Shield className="w-6 h-6 text-blue-500" />
            <span>คุณอนุชา จันทร์คำ</span>
          </div>
          <p className="text-sm text-slate-400 font-medium">ตัวแทนประกันชีวิต อลิอันซ์ อยุธยา</p>
          <div className="flex flex-wrap justify-center items-center gap-4 text-sm pt-2">
            <span className="bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300">เลขที่ใบอนุญาต: <strong className="text-white">6901030636</strong></span>
            <a href="tel:**********" className="bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300 transition flex items-center gap-1.5"><Phone className="w-4 h-4 text-emerald-400" /> โทร: ติดต่อตัวแทน</a>
            <a href="https://lin.ee/vaJWG63" target="_blank" rel="noopener noreferrer" className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg transition font-medium flex items-center gap-1.5"><MessageSquare className="w-4 h-4" /> Line OA: แอดไลน์คุยกับเรา</a>
          </div>
          <div className="border-t border-slate-800 pt-6 mt-6 text-xs text-slate-500">© {new Date().getFullYear()} Tumtam Insurance Online. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}

// ไฟล์ App หลัก ทำหน้าที่ควบคุมเส้นทาง (Router) ทั้งหมด
// ไฟล์ App หลัก ทำหน้าที่ควบคุมเส้นทาง (Router) ทั้งหมด
export default function App() {
  return (
      <Router>
        <Routes>
          <Route path="/" element={<MainStore />} />
          <Route path="/login" element={<Login />} />
          
          {/* เอา ProtectedRoute มาครอบหน้าแอดมิน เพื่อบังคับเช็คกุญแจ (Token) */}
          <Route 
            path="/admin/plans" 
            element={
              <ProtectedRoute>
                <AdminPlans />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
           {/* หน้าแรกให้เลือกประเภท */}
          <Route 
            path="/register-select"
            element={<RegisterSelection />} />

          {/* หน้าฟอร์มกรอกข้อมูล */}
          <Route 
            path="/register" 
            element={<Register />} />

        </Routes>
      </Router>
  );
}