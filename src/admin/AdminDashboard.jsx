export default function AdminDashboard() {
  const [filterType, setFilterType] = useState('monthly'); // daily, weekly, monthly, yearly, custom
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>Dashboard ข้อมูลเชิงลึก</h2>
      
      {/* ส่วนเลือกช่วงเวลา (Date Filter) */}
      <div style={{ marginBottom: '20px', padding: '15px', background: '#f1f1f1', borderRadius: '8px' }}>
        <label>เลือกช่วงเวลาสถิติ: </label>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} style={{padding: '6px', marginRight: '10px'}}>
          <option value="daily">รายวัน</option>
          <option value="weekly">รายสัปดาห์</option>
          <option value="monthly">รายเดือน</option>
          <option value="quarterly">ราย 3 เดือน (Quarter)</option>
          <option value="yearly">รายปี</option>
          <option value="custom">กำหนดเอง (Custom)</option>
        </select>

        {filterType === 'custom' && (
          <span>
            จาก: <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{margin: '0 5px'}} />
            ถึง: <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{margin: '0 5px'}} />
          </span>
        )}
      </div>

      {/* ส่วนแสดงผลสรุปตัวเลข (Summary Cards) */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        <div style={{ flex: 1, padding: '20px', background: '#e3f2fd', borderRadius: '8px' }}>
          <h4>ยอดคลิกดูแผนประกันสูงสุด</h4>
          <h2>แผนแคร์คุ้ม 1 (1,240 ครั้ง)</h2>
        </div>
        <div style={{ flex: 1, padding: '20px', background: '#e8f5e9', borderRadius: '8px' }}>
          <h4>แผนที่มีคนสมัคร/สนใจสูงสุด</h4>
          <h2>แผนเซฟตี้พลัส (85 เคส)</h2>
        </div>
      </div>
    </div>
  );
}