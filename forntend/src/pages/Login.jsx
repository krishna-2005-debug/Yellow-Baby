import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, RotateCcw, ShieldCheck } from 'lucide-react';
import { sendOtp, verifyOtp } from '../api/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const FEATURES = [
  { icon: '🛡️', text: 'Secure OTP Login' },
  { icon: '🚀', text: 'Fast Checkout' },
  { icon: '📦', text: 'Track Orders' },
  { icon: '❤️', text: 'Save Wishlist' },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState('phone');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const startResendTimer = () => {
    setResendTimer(30);
    const t = setInterval(() => setResendTimer(prev => { if (prev <= 1) { clearInterval(t); return 0; } return prev - 1; }), 1000);
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!/^[6-9]\d{9}$/.test(mobile)) { toast.error('Enter a valid 10-digit mobile number'); return; }
    setLoading(true);
    try {
      await sendOtp(mobile);
      setStep('otp');
      startResendTimer();
      toast.success('OTP sent!');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to send OTP');
    } finally { setLoading(false); }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) { toast.error('Enter the 6-digit OTP'); return; }
    setLoading(true);
    try {
      const { data } = await verifyOtp(mobile, otp);
      login({ access: data.tokens?.access || data.access, refresh: data.tokens?.refresh || data.refresh }, data.user || { mobile });
      toast.success('Welcome to Yellow Baby! 🎉');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Invalid OTP. Try again.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 40%, #FCE7F3 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '80px 16px 24px',
      fontFamily: 'Outfit, sans-serif',
    }}>
      {/* Decorative blobs */}
      <div style={{
        position: 'fixed', top: '-80px', right: '-80px',
        width: '350px', height: '350px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(251,191,36,0.15) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'fixed', bottom: '-80px', left: '-80px',
        width: '300px', height: '300px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(244,114,182,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ width: '100%', maxWidth: '440px', position: 'relative', zIndex: 1 }}>
        {/* Card */}
        <div style={{
          background: '#ffffff',
          borderRadius: '32px',
          border: '1.5px solid rgba(251,191,36,0.25)',
          boxShadow: '0 24px 64px rgba(251,191,36,0.15), 0 8px 24px rgba(0,0,0,0.06)',
          padding: '40px 36px',
          animation: 'fadeSlideIn 0.4s ease',
        }}>
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '20px',
              background: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: '0 8px 24px rgba(251,191,36,0.4)',
            }}>
              <img src="/logo.png" alt="Yellow Baby" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '20px' }} />
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#4E3728', margin: '0 0 6px' }}>
              {step === 'phone' ? 'Welcome to Yellow Baby' : 'Enter OTP'}
            </h1>
            <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>
              {step === 'phone'
                ? 'Login or create an account'
                : `Sent to +91 ${mobile}`}
            </p>
          </div>

          {/* Step Indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '28px' }}>
            {['phone', 'otp'].map((s, i) => (
              <React.Fragment key={s}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                }}>
                  <div style={{
                    width: '26px', height: '26px', borderRadius: '50%',
                    background: step === s || (s === 'phone' && step === 'otp')
                      ? 'linear-gradient(135deg, #FBBF24, #F59E0B)'
                      : '#F3F4F6',
                    color: step === s || (s === 'phone' && step === 'otp') ? '#fff' : '#9CA3AF',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '12px', fontWeight: '800',
                    transition: 'all 0.3s',
                  }}>{i + 1}</div>
                  <span style={{
                    fontSize: '12px', fontWeight: '600',
                    color: step === s ? '#D97706' : '#9CA3AF',
                  }}>{s === 'phone' ? 'Mobile' : 'Verify'}</span>
                </div>
                {i < 1 && (
                  <div style={{
                    flex: 1, height: '2px', borderRadius: '2px',
                    background: step === 'otp' ? 'linear-gradient(90deg, #FBBF24, #F59E0B)' : '#F3F4F6',
                    transition: 'background 0.4s',
                  }} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Phone Step */}
          {step === 'phone' && (
            <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>
                  Mobile Number
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
                  <div style={{
                    padding: '0 14px', height: '48px',
                    background: '#F9FAFB', border: '1.5px solid #E5E7EB',
                    borderRight: 'none', borderRadius: '14px 0 0 14px',
                    display: 'flex', alignItems: 'center',
                    fontSize: '14px', fontWeight: '600', color: '#6B7280',
                  }}>🇮🇳 +91</div>
                  <input
                    type="tel" value={mobile} maxLength={10}
                    onChange={e => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="98765 43210"
                    id="mobile-input"
                    style={{
                      flex: 1, height: '48px', padding: '0 16px',
                      border: '1.5px solid #E5E7EB', borderLeft: 'none',
                      borderRadius: '0 14px 14px 0', fontSize: '15px',
                      fontFamily: 'Outfit, sans-serif', fontWeight: '600',
                      color: '#4E3728', background: '#fff', outline: 'none',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={e => e.target.style.borderColor = '#FBBF24'}
                    onBlur={e => e.target.style.borderColor = '#E5E7EB'}
                    autoFocus
                  />
                </div>
              </div>

              <button type="submit" id="send-otp-btn" className="btn-primary"
                disabled={loading || mobile.length !== 10}
                style={{ width: '100%', padding: '14px', fontSize: '15px' }}
              >
                {loading ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '18px', height: '18px', border: '2.5px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                    Sending…
                  </span>
                ) : (
                  <>Send OTP <ArrowRight size={16} /></>
                )}
              </button>

              {/* Dev hint */}
              <div style={{
                background: '#ECFDF5', borderRadius: '12px', padding: '10px 14px',
                border: '1px solid #A7F3D0', display: 'flex', alignItems: 'center', gap: '8px',
              }}>
                <ShieldCheck size={15} color="#059669" />
                <span style={{ fontSize: '12px', color: '#065F46', fontWeight: '600' }}>
                  Dev Mode: Use OTP <strong>123456</strong>
                </span>
              </div>
            </form>
          )}

          {/* OTP Step */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>
                  6-Digit OTP
                </label>
                <input
                  type="tel" value={otp} maxLength={6}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="1 2 3 4 5 6"
                  id="otp-input"
                  style={{
                    width: '100%', height: '56px', padding: '0 20px',
                    border: '1.5px solid #E5E7EB', borderRadius: '14px',
                    fontSize: '20px', fontFamily: 'Outfit, sans-serif', fontWeight: '800',
                    letterSpacing: '0.3em', color: '#4E3728', background: '#fff', outline: 'none',
                    textAlign: 'center', transition: 'border-color 0.2s',
                  }}
                  onFocus={e => e.target.style.borderColor = '#FBBF24'}
                  onBlur={e => e.target.style.borderColor = '#E5E7EB'}
                  autoFocus
                />
              </div>

              <button type="submit" id="verify-otp-btn" className="btn-primary"
                disabled={loading || otp.length !== 6}
                style={{ width: '100%', padding: '14px', fontSize: '15px' }}
              >
                {loading ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '18px', height: '18px', border: '2.5px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                    Verifying…
                  </span>
                ) : (
                  <>Verify &amp; Login <ShieldCheck size={16} /></>
                )}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <button type="button" onClick={() => setStep('phone')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: '#6B7280', fontFamily: 'Outfit, sans-serif', fontWeight: '600' }}>
                  ← Change number
                </button>
                {resendTimer > 0 ? (
                  <span style={{ fontSize: '13px', color: '#9CA3AF', fontFamily: 'Outfit, sans-serif' }}>
                    Resend in {resendTimer}s
                  </span>
                ) : (
                  <button type="button"
                    onClick={() => { setLoading(true); sendOtp(mobile).then(() => { startResendTimer(); toast.success('OTP resent!'); }).finally(() => setLoading(false)); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: '#D97706', fontWeight: '700', fontFamily: 'Outfit, sans-serif', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <RotateCcw size={13} /> Resend OTP
                  </button>
                )}
              </div>
            </form>
          )}

          <p style={{ textAlign: 'center', fontSize: '12px', color: '#9CA3AF', marginTop: '20px' }}>
            By continuing, you agree to our{' '}
            <a href="#" style={{ color: '#D97706', fontWeight: '600', textDecoration: 'none' }}>Terms</a>{' & '}
            <a href="#" style={{ color: '#D97706', fontWeight: '600', textDecoration: 'none' }}>Privacy Policy</a>
          </p>
        </div>

        {/* Feature pills below card */}
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '20px' }}>
          {FEATURES.map(({ icon, text }) => (
            <div key={text} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '6px 14px', borderRadius: '100px',
              background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(8px)',
              border: '1px solid rgba(251,191,36,0.2)',
              fontSize: '12px', fontWeight: '600', color: '#374151',
              fontFamily: 'Outfit, sans-serif',
            }}>
              <span>{icon}</span> {text}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
