import { useNavigate } from "react-router-dom";
export default function CCP() {
  const navigate = useNavigate();
  return (
    <div style={{ background: '#d9d9d9', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center', fontSize: '48px', margin: '32px 0' }}>CCP</h1>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '60px', marginTop: '40px' }}>
        <div style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => navigate('/ccp-checks')}>
          <div style={{ fontSize: '120px', color: '#e74c3c' }}>🔥</div>
          <div style={{ fontSize: '32px', marginTop: '12px' }}>Testo ovens</div>
        </div>
        <div style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => navigate('/rational-fridges')}>
          <div style={{ fontSize: '120px', color: '#5bc0eb' }}>❄️</div>
          <div style={{ fontSize: '32px', marginTop: '12px' }}>Rational Fridges</div>
        </div>
        <div style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => navigate('/rational-oven')}>
          <div style={{ fontSize: '120px', color: '#e67e22' }}>🍞</div>
          <div style={{ fontSize: '32px', marginTop: '12px' }}>Rational oven</div>
        </div>
        <div style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => navigate('/testo-fridge')}>
          <div style={{ fontSize: '120px', color: '#5bc0eb' }}>🧊</div>
          <div style={{ fontSize: '32px', marginTop: '12px' }}>Testo fridge</div>
        </div>
        <div style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => navigate('/hot-food-check')}>
          <div style={{ fontSize: '120px', color: '#3498db' }}>📄</div>
          <div style={{ fontSize: '32px', marginTop: '12px' }}>Manual Entry</div>
        </div>
        <div style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => navigate('/ccp-logs')}>
          <div style={{ fontSize: '120px', color: '#27ae60' }}>📋</div>
          <div style={{ fontSize: '32px', marginTop: '12px' }}>CCP Logs</div>
        </div>
      </div>
    </div>
  );
}