import React, { useState, useEffect } from 'react';

export default function AdminPlans() {
  const [plans, setPlans] = useState([]);
  const [formData, setFormData] = useState({ name: '', price: '', minAge: '', maxAge: '', image: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  // จำลองการดึงข้อมูลจาก DB (สามารถเปลี่ยนเป็น API ดึงข้อมูลจริงได้)
  useEffect(() => {
    // fetchPlansFromDatabase();
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    if (isEditing) {
      // Logic อัปเดตข้อมูล (Update)
      setPlans(plans.map(p => p.id === editId ? { ...p, ...formData } : p));
      setIsEditing(false);
      setEditId(null);
    } else {
      // Logic เพิ่มข้อมูลใหม่ (Insert)
      setPlans([...plans, { id: Date.now(), ...formData }]);
    }
    setFormData({ name: '', price: '', minAge: '', maxAge: '', image: '' });
  };

  const handleDelete = (id) => {
    if (window.confirm("คุณต้องการลบแผนประกันนี้ใช่หรือไม่?")) {
      setPlans(plans.filter(p => p.id !== id)); // Logic ลบข้อมูล (Delete)
    }
  };

  const handleEdit = (plan) => {
    setIsEditing(true);
    setEditId(plan.id);
    setFormData(plan);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>ระบบจัดการแผนประกัน (Admin CMS)</h2>
      
      {/* ฟอร์ม เพิ่ม/แก้ไข ข้อมูล */}
      <form onSubmit={handleSave} style={{ marginBottom: '20px', padding: '15px', background: '#f9f9f9', borderRadius: '8px' }}>
        <h3>{isEditing ? 'แก้ไขแผนประกัน' : 'เพิ่มแผนประกันใหม่'}</h3>
        <input type="text" placeholder="ชื่อแผนประกัน" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required style={{marginRight: '10px', padding: '8px'}} />
        <input type="number" placeholder="ราคา/เดือน" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required style={{marginRight: '10px', padding: '8px'}} />
        <input type="number" placeholder="อายุต่ำสุด" value={formData.minAge} onChange={e => setFormData({...formData, minAge: e.target.value})} required style={{marginRight: '10px', padding: '8px'}} />
        <input type="number" placeholder="อายุสูงสุด" value={formData.maxAge} onChange={e => setFormData({...formData, maxAge: e.target.value})} required style={{marginRight: '10px', padding: '8px'}} />
        <input type="text" placeholder="ลิงก์รูปภาพ (Google Drive Direct Link)" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} style={{marginRight: '10px', padding: '8px', width: '250px'}} />
        <button type="submit" style={{padding: '8px 15px', background: '#0070f3', color: '#fff', border: 'none', borderRadius: '4px'}}>{isEditing ? 'บันทึกการแก้ไข' : 'เพิ่มข้อมูล'}</button>
      </form>

      {/* ตารางแสดงข้อมูล (Select) */}
      <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#eee' }}>
            <th>ชื่อแผน</th>
            <th>ราคา/เดือน</th>
            <th>ช่วงอายุ</th>
            <th>จัดการ</th>
          </tr>
        </thead>
        <tbody>
          {plans.map(plan => (
            <tr key={plan.id}>
              <td>{plan.name}</td>
              <td>{plan.price} บาท</td>
              <td>{plan.minAge} - {plan.maxAge} ปี</td>
              <td>
                <button onClick={() => handleEdit(plan)} style={{marginRight: '5px'}}>แก้ไข</button>
                <button onClick={() => handleDelete(plan.id)} style={{color: 'red'}}>ลบ</button>
              </td>
            </tr>
          ))}
          {plans.length === 0 && <tr><td colSpan="4" style={{textAlign: 'center'}}>ยังไม่มีข้อมูลแผนประกัน</td></tr>}
        </tbody>
      </table>
    </div>
  );
}