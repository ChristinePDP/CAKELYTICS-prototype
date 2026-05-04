import { useState } from 'react';

import brandLogo from '../assets/images/427bffe9-d983-4566-9ec9-de6c2b1bdaa2-removebg-preview.png';

// ── SVG Icons (inline para walang extra dependency) ───────────
const IconMail = () => (
  <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);
const IconLock = () => (
  <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const IconEye = ({ slashed }) => slashed ? (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
) : (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);
const IconSignIn = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
    <polyline points="10 17 15 12 10 7"/>
    <line x1="15" y1="12" x2="3" y2="12"/>
  </svg>
);
const IconSend = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);
const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IconBack = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}>
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);

// ── Step Dots ─────────────────────────────────────────────────
function StepDots({ current }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 22 }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          height: 6,
          width: i === current ? 18 : 6,
          borderRadius: i === current ? 3 : '50%',
          background: i < current ? '#D4A87A' : i === current ? '#5C3317' : '#E2E8F0',
          transition: 'all 0.2s',
        }} />
      ))}
    </div>
  );
}

// ── Password strength checker ─────────────────────────────────
function getStrength(pw) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const colors = ['#EF4444', '#F97316', '#EAB308', '#10B981'];
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  return { score, color: colors[score - 1] || '#E2E8F0', label: labels[score] || '' };
}

// ── Shared Input Field ────────────────────────────────────────
function InputField({ icon: Icon, type, value, onChange, placeholder, autoComplete, error, children }) {
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <span style={{
        position: 'absolute', left: 11,
        width: 15, height: 15,
        color: '#94A3B8',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        pointerEvents: 'none',
        transition: 'color 0.15s',
      }}>
        <Icon />
      </span>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        style={{
          width: '100%',
          padding: '10px 38px 10px 38px',
          background: '#fff',
          border: `1px solid ${error ? '#EF4444' : '#E2E8F0'}`,
          borderRadius: 9,
          fontFamily: 'inherit',
          fontSize: 14,
          fontWeight: 500,
          color: '#0F172A',
          outline: 'none',
          boxShadow: error ? '0 0 0 3px #FEF2F2' : 'none',
          transition: 'border-color 0.15s, box-shadow 0.15s',
        }}
        onFocus={e => {
          e.target.style.borderColor = error ? '#EF4444' : '#5C3317';
          e.target.style.boxShadow = error ? '0 0 0 3px #FEF2F2' : '0 0 0 3px #FDF6F0';
        }}
        onBlur={e => {
          e.target.style.borderColor = error ? '#EF4444' : '#E2E8F0';
          e.target.style.boxShadow = error ? '0 0 0 3px #FEF2F2' : 'none';
        }}
      />
      {children}
    </div>
  );
}

// ── Toggle PW Button ──────────────────────────────────────────
function TogglePwBtn({ shown, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      tabIndex={-1}
      style={{
        position: 'absolute', right: 10,
        background: 'none', border: 'none', cursor: 'pointer',
        color: '#94A3B8', display: 'flex', alignItems: 'center',
        padding: 2, width: 20, height: 20,
        transition: 'color 0.12s',
      }}
      onMouseEnter={e => e.currentTarget.style.color = '#334155'}
      onMouseLeave={e => e.currentTarget.style.color = '#94A3B8'}
    >
      <IconEye slashed={shown} />
    </button>
  );
}

// ── Field Wrapper ─────────────────────────────────────────────
function Field({ label, error, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{
        display: 'block', marginBottom: 6,
        fontSize: 12, fontWeight: 700,
        textTransform: 'uppercase', letterSpacing: '0.07em',
        color: '#64748B',
      }}>{label}</label>
      {children}
      {error && (
        <p style={{ fontSize: 12, color: '#EF4444', marginTop: 5, fontWeight: 500 }}>{error}</p>
      )}
    </div>
  );
}

// ── Primary Button ────────────────────────────────────────────
function PrimaryBtn({ onClick, children, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '100%', padding: '11px',
        background: disabled ? '#E2E8F0' : '#5C3317',
        color: disabled ? '#94A3B8' : '#fff',
        border: 'none', borderRadius: 9,
        fontFamily: 'inherit', fontSize: 14, fontWeight: 700,
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        transition: 'background 0.15s, transform 0.1s',
        boxShadow: disabled ? 'none' : '0 4px 14px rgba(92,51,23,0.28)',
      }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = '#3E2008'; }}
      onMouseLeave={e => { if (!disabled) e.currentTarget.style.background = '#5C3317'; }}
      onMouseDown={e => { if (!disabled) e.currentTarget.style.transform = 'scale(0.98)'; }}
      onMouseUp={e => { e.currentTarget.style.transform = 'none'; }}
    >
      {children}
    </button>
  );
}

// ── Back Row ──────────────────────────────────────────────────
function BackRow({ label, linkLabel, onLink }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 18, gap: 5 }}>
      <IconBack />
      <span style={{ fontSize: 13, color: '#94A3B8' }}>{label}</span>
      <button
        type="button"
        onClick={onLink}
        style={{ fontSize: 13, fontWeight: 600, color: '#5C3317', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
      >
        {linkLabel}
      </button>
    </div>
  );
}

// ── OTP Input ─────────────────────────────────────────────────
function OtpInput({ value, onChange, hasError }) {
  const digits = value.split('');
  const handleChange = (i, val) => {
    const clean = val.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[i] = clean;
    onChange(next.join(''));
    if (clean && i < 5) {
      document.getElementById(`otp-${i + 1}`)?.focus();
    }
  };
  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      document.getElementById(`otp-${i - 1}`)?.focus();
    }
  };
  const handlePaste = (e) => {
    e.preventDefault();
    const data = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    onChange(data.padEnd(6, '').slice(0, 6));
    document.getElementById(`otp-${Math.min(data.length, 5)}`)?.focus();
  };
  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 20 }}>
      {[0,1,2,3,4,5].map(i => (
        <input
          key={i}
          id={`otp-${i}`}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i] || ''}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)}
          onPaste={handlePaste}
          style={{
            width: 46, height: 52,
            textAlign: 'center',
            fontSize: 20, fontWeight: 700,
            color: '#0F172A',
            background: '#F1F5F9',
            border: `1.5px solid ${hasError ? '#EF4444' : '#E2E8F0'}`,
            borderRadius: 9,
            outline: 'none',
            fontFamily: 'inherit',
            transition: 'border-color 0.15s, box-shadow 0.15s',
          }}
          onFocus={e => {
            e.target.style.borderColor = '#5C3317';
            e.target.style.boxShadow = '0 0 0 3px #FDF6F0';
            e.target.style.background = '#fff';
          }}
          onBlur={e => {
            e.target.style.borderColor = hasError ? '#EF4444' : '#E2E8F0';
            e.target.style.boxShadow = 'none';
            e.target.style.background = '#F1F5F9';
          }}
        />
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
export default function LoginPage({ onLogin }) {
  

  // ── Panel state
  const [panel, setPanel] = useState('login'); // login | reset-email | otp | new-pw | success

  // ── Login
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loginErrors, setLoginErrors] = useState({});

  // ── Reset flow
  const [resetEmail, setResetEmail]   = useState('');
  const [resetEmailErr, setResetEmailErr] = useState('');
  const [otpValue, setOtpValue]       = useState('');
  const [otpErr, setOtpErr]           = useState('');
  const [newPw1, setNewPw1]           = useState('');
  const [newPw2, setNewPw2]           = useState('');
  const [showNewPw1, setShowNewPw1]   = useState(false);
  const [showNewPw2, setShowNewPw2]   = useState(false);
  const [newPwErr, setNewPwErr]       = useState('');

  const strength = getStrength(newPw1);

  // ── Handlers ─────────────────────────────────────────────────
  const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const doLogin = () => {
    const errs = {};
    if (!email || !isValidEmail(email)) errs.email = 'Please enter a valid email address.';
    if (!password) errs.password = 'Password is required.';
    setLoginErrors(errs);
    if (Object.keys(errs).length === 0) {
      // TODO (backend): const res = await authService.login({ email, password });
      // if (res.data.token) { localStorage.setItem('token', res.data.token); navigate('/'); }
      onLogin();
    }
  };

  const sendCode = () => {
    if (!resetEmail || !isValidEmail(resetEmail)) {
      setResetEmailErr('Please enter a valid email address.');
      return;
    }
    setResetEmailErr('');
    // TODO (backend): await authService.sendResetCode(resetEmail);
    setPanel('otp');
    setTimeout(() => document.getElementById('otp-0')?.focus(), 100);
  };

  const verifyOtp = () => {
    if (otpValue.length < 6 || otpValue.includes('')) {
      setOtpErr('Incorrect code. Please try again.');
      return;
    }
    setOtpErr('');
    // TODO (backend): await authService.verifyOtp({ email: resetEmail, code: otpValue });
    setPanel('new-pw');
  };

  const doReset = () => {
    if (!newPw1 || newPw1.length < 8) { setNewPwErr('Password must be at least 8 characters.'); return; }
    if (newPw1 !== newPw2) { setNewPwErr('Passwords do not match.'); return; }
    setNewPwErr('');
    // TODO (backend): await authService.resetPassword({ email: resetEmail, code: otpValue, password: newPw1 });
    setPanel('success');
  };

  // ── Enter key handler
  const handleKeyDown = (e) => {
    if (e.key !== 'Enter') return;
    if (panel === 'login')       doLogin();
    if (panel === 'reset-email') sendCode();
    if (panel === 'otp')         verifyOtp();
    if (panel === 'new-pw')      doReset();
  };

  // ── Styles
  const S = {
    root: {
      minHeight: '100vh',
      background: '#F8FAFC',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
      WebkitFontSmoothing: 'antialiased',
      position: 'relative',
      overflow: 'hidden',
    },
    gridBg: {
      position: 'fixed', inset: 0,
      backgroundImage: 'linear-gradient(#E2E8F0 1px, transparent 1px), linear-gradient(90deg, #E2E8F0 1px, transparent 1px)',
      backgroundSize: '40px 40px',
      opacity: 0.45,
      pointerEvents: 'none',
    },
    card: {
      display: 'flex',
      background: '#fff',
      border: '1px solid #E2E8F0',
      borderRadius: 22,
      boxShadow: '0 20px 50px rgba(0,0,0,0.10), 0 6px 16px rgba(0,0,0,0.06)',
      width: '100%',
      maxWidth: 1100,
      minHeight: 700,
      position: 'relative',
      zIndex: 1,
      overflow: 'hidden',
      margin: '24px 16px',
      animation: 'cardIn 0.4s cubic-bezier(0.22,1,0.36,1) both',
    },
    brandPanel: {
      width: 580,
      flexShrink: 0,
      background: '#3B1F0A',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 32px',
      position: 'relative',
      overflow: 'hidden',
    },
    formPanel: {
      flex: 1,
      padding: '48px 44px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      overflowY: 'auto',
    },
    panelTitle: { fontSize: 22, fontWeight: 700, color: '#0F172A', marginBottom: 6 },
    panelSub:   { fontSize: 14, color: '#64748B', marginBottom: 28, lineHeight: 1.6 },
  };

  return (
    <div style={S.root} onKeyDown={handleKeyDown}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to   { opacity: 1; transform: none; }
        }
        .input-icon { width: 15px; height: 15px; }
      `}</style>

      {/* Grid Background */}
      <div style={S.gridBg} />

      <div style={S.card}>

        {/* ── LEFT: BRAND PANEL ── */}
        <div style={S.brandPanel}>
          {/* Decorative circles */}
          <div style={{ position:'absolute', top:-70, right:-70, width:240, height:240, borderRadius:'50%', background:'rgba(255,255,255,0.07)', pointerEvents:'none' }} />
          <div style={{ position:'absolute', bottom:-90, left:-50, width:280, height:280, borderRadius:'50%', background:'rgba(255,255,255,0.05)', pointerEvents:'none' }} />

          <img
            src={brandLogo}
            alt="Aileen & Niculus Logo"
            style={{ width: 300, height: 'auto', marginBottom: 20, position: 'relative', zIndex: 1, filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.5))' }}
          />
          <div style={{ zIndex: 1, position: 'relative', textAlign: 'center' }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: '#fff', lineHeight: 1.55, letterSpacing: '-0.01em' }}>
              Aileen Cake Max<br/>Bake Shop
            </div>
          </div>
        </div>

        {/* ── RIGHT: FORM PANEL ── */}
        <div style={S.formPanel}>

          {/* ── PANEL: LOGIN ── */}
          {panel === 'login' && (
            <div>
              <h1 style={S.panelTitle}>Welcome back</h1>
              <p style={S.panelSub}>Sign in to your admin account to continue.</p>

              <Field label="Email Address" error={loginErrors.email}>
                <InputField
                  icon={IconMail}
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="@gmail.com"
                  autoComplete="email"
                  error={loginErrors.email}
                />
              </Field>

              <Field label="Password" error={loginErrors.password}>
                <InputField
                  icon={IconLock}
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  error={loginErrors.password}
                >
                  <TogglePwBtn shown={showPw} onToggle={() => setShowPw(v => !v)} />
                </InputField>
              </Field>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
                <button
                  type="button"
                  onClick={() => setPanel('reset-email')}
                  style={{ fontSize: 13, fontWeight: 600, color: '#5C3317', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  Forgot password?
                </button>
              </div>

              <PrimaryBtn onClick={doLogin}>
                <IconSignIn /> Sign in
              </PrimaryBtn>
            </div>
          )}

          {/* ── PANEL: RESET EMAIL ── */}
          {panel === 'reset-email' && (
            <div>
              <StepDots current={0} />
              <h1 style={S.panelTitle}>Reset your password</h1>
              <p style={S.panelSub}>Enter your admin email and we'll send a 6-digit verification code.</p>

              <Field label="Email Address" error={resetEmailErr}>
                <InputField
                  icon={IconMail}
                  type="email"
                  value={resetEmail}
                  onChange={e => setResetEmail(e.target.value)}
                  placeholder="admin@example.com"
                  error={resetEmailErr}
                />
              </Field>

              <PrimaryBtn onClick={sendCode}>
                <IconSend /> Send verification code
              </PrimaryBtn>

              <BackRow label="Back to" linkLabel="Sign in" onLink={() => setPanel('login')} />
            </div>
          )}

          {/* ── PANEL: OTP ── */}
          {panel === 'otp' && (
            <div>
              <StepDots current={1} />
              <h1 style={S.panelTitle}>Check your email</h1>
              <p style={S.panelSub}>
                We sent a 6-digit code to <strong>{resetEmail}</strong>. Enter it below.
              </p>

              <OtpInput value={otpValue} onChange={setOtpValue} hasError={!!otpErr} />
              {otpErr && (
                <p style={{ fontSize: 12, color: '#EF4444', fontWeight: 500, textAlign: 'center', marginBottom: 14 }}>{otpErr}</p>
              )}

              <PrimaryBtn onClick={verifyOtp}>
                <IconCheck /> Verify code
              </PrimaryBtn>

              <BackRow label="Didn't receive it?" linkLabel="Resend" onLink={() => setPanel('reset-email')} />
            </div>
          )}

          {/* ── PANEL: NEW PASSWORD ── */}
          {panel === 'new-pw' && (
            <div>
              <StepDots current={2} />
              <h1 style={S.panelTitle}>Set new password</h1>
              <p style={S.panelSub}>Choose a strong password for your admin account.</p>

              <Field label="New Password">
                <InputField
                  icon={IconLock}
                  type={showNewPw1 ? 'text' : 'password'}
                  value={newPw1}
                  onChange={e => setNewPw1(e.target.value)}
                  placeholder="Min. 8 characters"
                >
                  <TogglePwBtn shown={showNewPw1} onToggle={() => setShowNewPw1(v => !v)} />
                </InputField>
                {newPw1 && (
                  <>
                    <div style={{ display: 'flex', gap: 4, marginTop: 7 }}>
                      {[0,1,2,3].map(i => (
                        <div key={i} style={{
                          height: 3, flex: 1, borderRadius: 2,
                          background: i < strength.score ? strength.color : '#E2E8F0',
                          transition: 'background 0.2s',
                        }} />
                      ))}
                    </div>
                    <p style={{ fontSize: 11, color: strength.color, marginTop: 5, fontWeight: 500 }}>
                      {strength.label}
                    </p>
                  </>
                )}
              </Field>

              <Field label="Confirm Password" error={newPwErr}>
                <InputField
                  icon={IconLock}
                  type={showNewPw2 ? 'text' : 'password'}
                  value={newPw2}
                  onChange={e => setNewPw2(e.target.value)}
                  placeholder="Repeat your password"
                  error={newPwErr}
                >
                  <TogglePwBtn shown={showNewPw2} onToggle={() => setShowNewPw2(v => !v)} />
                </InputField>
              </Field>

              <PrimaryBtn onClick={doReset}>
                <IconCheck /> Update password
              </PrimaryBtn>
            </div>
          )}

          {/* ── PANEL: SUCCESS ── */}
          {panel === 'success' && (
            <div style={{ textAlign: 'center', padding: '16px 0 28px' }}>
              <div style={{
                width: 60, height: 60,
                background: '#ECFDF5',
                border: '1.5px solid #A7F3D0',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 18px',
              }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 26, height: 26 }}>
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <h1 style={{ ...S.panelTitle, marginBottom: 8 }}>Password updated!</h1>
              <p style={{ ...S.panelSub, marginBottom: 28 }}>
                Your password has been changed successfully. You can now sign in with your new credentials.
              </p>
              <PrimaryBtn onClick={() => { setPanel('login'); setOtpValue(''); setNewPw1(''); setNewPw2(''); setResetEmail(''); }}>
                <IconSignIn /> Back to sign in
              </PrimaryBtn>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}