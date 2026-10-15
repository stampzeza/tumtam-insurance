import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    // ใส่ URL ของ Backend Go คุณแบบตรงๆ ไปก่อนเลย (เช่นพอร์ต 8080 หรือ URL บน Render)
    const backendUrl = 'http://localhost:8080'; // <-- ถ้าอยู่บนคลาวด์ ให้เปลี่ยนเป็น URL ของ Render คุณ

    try {
      const response = await fetch(`${backendUrl}/api/login`, {
        method: 'POST', // บังคับ POST ชัดเจน
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const text = await response.text();
      const data = text ? JSON.parse(text) : {};

      if (!response.ok) {
        throw new Error(data.error || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
      }

      localStorage.setItem('admin_token', data.token);
      navigate('/admin/plans');

    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f5f5f5' }}>
      <form onSubmit={handleLogin} style={{ background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', width: '350px' }}>
        <h2 style={{ marginBottom: '20px', textAlign: 'center', color: '#333' }}>Admin Login</h2>
        
        {error && <div style={{ color: 'red', marginBottom: '15px', fontSize: '14px', textAlign: 'center' }}>{error}</div>}

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Username</label>
          <input 
            type="text" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '4px' }}
            required 
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Password</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '4px' }}
            required 
          />
        </div>

        <button type="submit" style={{ width: '100%', padding: '10px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', fontSize: '16px', cursor: 'pointer' }}>
          เข้าสู่ระบบ
        </button>
      </form>
    </div>
  );
}