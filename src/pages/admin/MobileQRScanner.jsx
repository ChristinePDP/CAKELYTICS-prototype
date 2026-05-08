import { useState, useEffect, useRef } from 'react';
import { QrCode, Lock, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Scanner } from '@yudiel/react-qr-scanner';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../components/ui';
import { Button, Modal } from '../../components/ui';

const CORRECT_PIN = '123456';
const MAX_ATTEMPTS = 3;
const LOCKOUT_DURATION = 5 * 60 * 1000;
const SESSION_TIMEOUT = 15 * 60 * 1000;
const SECRET_KEY = '_secret_key';

// ─── TOKEN VERIFICATION ──────────────────────────────────────
function generateReceiptToken(orderId) {
  return btoa(orderId + SECRET_KEY);
}

function verifyReceiptToken(orderId, token) {
  return generateReceiptToken(orderId) === token;
}

// ─── SCAN RESULT MODAL ────────────────────────────────────────
function ScanResultModal({ order, isOpen, onClose, onStatusChange, tokenValid }) {
  if (!order) return null;

  function fmt(n) {
    return '₱' + Number(n).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  if (!tokenValid) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="md" title="⚠️ Invalid QR Code">
        <div className="p-6 text-center">
          <div className="mb-4 text-5xl">🔴</div>
          <p className="text-red-700 font-black text-lg mb-2">Invalid or Unauthorized QR Code</p>
          <p className="text-slate-600 text-sm mb-6">This QR code cannot be verified. It may have been tampered with or is invalid.</p>
          <Button
            variant="primary"
            onClick={onClose}
            className="w-full bg-red-600 text-white font-black py-3 rounded-lg hover:bg-red-700"
          >
            Close & Try Again
          </Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title={
        <div className="flex items-center gap-3">
          <span className="font-black text-brand-950 text-lg">✓ Order Verified</span>
        </div>
      }
    >
      <div className="space-y-5">
        {order._isMockFallback ? (
          <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 text-center">
            <p className="text-2xl mb-2">✓</p>
            <p className="text-amber-900 font-black text-[14px]">Order #{order.id} — QR Verified</p>
            <p className="text-amber-700 text-xs mt-1">Live data unavailable in demo mode</p>
          </div>
        ) : (
          <>
            <div className="bg-[#fdf8f6] rounded-xl p-4 border-2 border-brand-100">
              <h2 className="text-xl font-black text-brand-950 mb-2">#{order.id}</h2>
              <p className="text-[14px] font-bold text-brand-900 mb-3">{order.customer?.name || 'Walk-in'}</p>
              <div className="bg-white rounded-lg p-3 max-h-[120px] overflow-y-auto">
                <table className="w-full text-xs">
                  <tbody className="divide-y divide-slate-200">
                    {order.items?.map((item, i) => (
                      <tr key={i} className="py-2">
                        <td className="font-bold text-brand-950 py-1">{item.name}</td>
                        <td className="text-right font-black text-brand-950 py-1">x{item.qty}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 border-2 border-slate-200">
              <div className="flex justify-between mb-2 text-sm font-bold">
                <span className="text-slate-600">Subtotal</span>
                <span className="text-brand-950">{fmt(order.subtotal || order.grandTotal)}</span>
              </div>
              <div className="flex justify-between text-lg font-black border-t-2 border-slate-200 pt-2">
                <span className="text-brand-950">Total</span>
                <span className="text-green-700">{fmt(order.grandTotal)}</span>
              </div>
            </div>

            {order.status === 'Completed' && (
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 text-center">
                <p className="text-2xl mb-2">✓</p>
                <p className="text-green-900 font-black text-[14px]">This order is already completed.</p>
              </div>
            )}

            {order.status === 'Cancelled' && (
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 text-center">
                <p className="text-2xl mb-2">✕</p>
                <p className="text-red-900 font-black text-[14px]">This order has been cancelled.</p>
              </div>
            )}

            {(order.status === 'Confirmed' || order.status === 'Ready') && (
              <Button
                variant="primary"
                className="w-full bg-green-600 text-white font-black hover:bg-green-700 flex items-center justify-center gap-2 py-3 rounded-lg"
                onClick={() => { onStatusChange(order.id, 'Completed'); onClose(); }}
              >
                ✓ Mark as Completed
              </Button>
            )}
          </>
        )}
      </div>
    </Modal>
  );
}

// ─── 6-DIGIT PIN ENTRY UI ───────────────────────────────────────
function PINEntryUI({ onSuccess, onClose, isLockedOut, lockoutTimeRemaining, attempts, maxAttempts }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const inputRefs = useRef([]);

  useEffect(() => {
    if (pin.length === 6) {
      if (pin === CORRECT_PIN) {
        setError('');
        setPin('');
        sessionStorage.setItem('pinVerifiedAt', Date.now().toString());
        sessionStorage.setItem('adminPinSession', 'true');
        onSuccess();
      } else {
        setError('❌ Incorrect PIN');
        setPin('');
        inputRefs.current[0]?.focus();
      }
    }
  }, [pin, onSuccess]);

  const handleDigitInput = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const newPin = pin.substring(0, index) + value + pin.substring(index + 1);
    setPin(newPin);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  if (isLockedOut) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-900 to-brand-950 p-4">
        <div className="max-w-xs w-full bg-brand-800 border border-brand-700 rounded-3xl shadow-2xl p-8 text-center">
          <div className="mb-6 text-6xl">🔒</div>
          <h2 className="text-2xl font-black text-red-300 mb-2">Too Many Attempts</h2>
          <p className="text-brand-300 text-sm mb-6">
            Too many failed PIN attempts. Try again in {Math.ceil(lockoutTimeRemaining / 1000)} second{Math.ceil(lockoutTimeRemaining / 1000) !== 1 ? 's' : ''}.
          </p>
          <div className="flex items-center justify-center gap-2 bg-red-900/40 border-2 border-red-700 rounded-lg p-4 mb-6">
            <Clock size={20} className="text-red-300" />
            <span className="text-red-300 font-black text-lg">{Math.ceil(lockoutTimeRemaining / 1000)}s</span>
          </div>
          <Button
            onClick={onClose}
            className="w-full bg-brand-700 text-brand-100 font-black py-3 rounded-lg hover:bg-brand-600 transition-colors"
          >
            Back to Orders
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-900 to-brand-950 p-4">
      <div className="max-w-xs w-full">
        {/* Logo/Title */}
        <div className="text-center mb-10">
          <div className="mb-4 text-5xl">🍰</div>
          <h1 className="text-3xl font-black text-white mb-1">Aileen & Niculus</h1>
          <p className="text-brand-200 text-sm font-bold tracking-widest uppercase">Admin Verification</p>
        </div>

        {/* PIN Entry Card */}
        <div className="bg-brand-800 border border-brand-700 rounded-3xl shadow-2xl p-6">
          <div className="text-center mb-6">
            <p className="text-brand-100 font-bold text-sm">Enter 6-digit PIN</p>
            {error && (
              <p className="text-red-300 font-black text-sm mt-2">{error}</p>
            )}
          </div>

          {/* PIN Digit Boxes — fixed px width so they never overflow on mobile */}
          <div className="flex gap-2 justify-center mb-6">
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="password"
                inputMode="numeric"
                maxLength="1"
                value={pin[index] || ''}
                onChange={(e) => handleDigitInput(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                style={{ width: '42px', height: '50px', fontSize: '22px' }}
                className="text-center font-black border-2 border-brand-600 rounded-xl bg-brand-900 text-white focus:bg-brand-800 focus:border-amber-400 focus:outline-none transition-all"
              />
            ))}
          </div>

          {/* Attempt Counter — fixed logic */}
          <div className="text-center text-xs text-brand-300 font-bold mb-6">
            {attempts > 0
              ? `${attempts} failed attempt${attempts > 1 ? 's' : ''} — ${maxAttempts - attempts} remaining`
              : `${maxAttempts} attempts allowed`
            }
          </div>

          <Button
            onClick={onClose}
            className="w-full bg-brand-700 text-brand-100 font-black py-3 rounded-lg hover:bg-brand-600 transition-colors"
          >
            Cancel
          </Button>
        </div>

        <p className="text-center text-xs text-brand-400 mt-6 flex items-center justify-center gap-2">
          <Lock size={14} /> PIN session expires after 15 minutes of inactivity
        </p>
      </div>
    </div>
  );
}

// ─── MAIN MOBILE QR SCANNER PAGE ─────────────────────────────────
export default function MobileQRScanner() {
  const navigate = useNavigate();
  const { orders, updateOrderStatus } = useApp();
  const { show: showToast } = useToast();

  const [isPinVerified, setIsPinVerified] = useState(() => {
    const pinVerifiedAt = sessionStorage.getItem('pinVerifiedAt');
    if (pinVerifiedAt) {
      return Date.now() - parseInt(pinVerifiedAt) < SESSION_TIMEOUT;
    }
    return false;
  });

  const [attempts, setAttempts] = useState(0);
  const [isLockedOut, setIsLockedOut] = useState(false);

  // Block browser back button — scanner page is a dead end by design
  useEffect(() => {
    window.history.pushState(null, '', window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, '', window.location.href);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);
  const [lockoutEndTime, setLockoutEndTime] = useState(null);
  const [lockoutTimeRemaining, setLockoutTimeRemaining] = useState(0);

  const [scanResultOrder, setScanResultOrder] = useState(null);
  const [scanResultOpen, setScanResultOpen] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const lastScanTime = useRef(0);

  useEffect(() => {
    if (!isLockedOut) return;
    const interval = setInterval(() => {
      const remaining = lockoutEndTime - Date.now();
      if (remaining <= 0) {
        setIsLockedOut(false);
        setAttempts(0);
        setLockoutEndTime(null);
        clearInterval(interval);
      } else {
        setLockoutTimeRemaining(remaining);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [isLockedOut, lockoutEndTime]);

  useEffect(() => {
    const pinVerifiedAt = sessionStorage.getItem('pinVerifiedAt');
    if (!pinVerifiedAt) return;
    const interval = setInterval(() => {
      if (Date.now() - parseInt(pinVerifiedAt) > SESSION_TIMEOUT) {
        setIsPinVerified(false);
        sessionStorage.removeItem('pinVerifiedAt');
        sessionStorage.removeItem('adminPinSession');
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isPinVerified]);

  const handleStatusChange = (id, status) => {
    updateOrderStatus(id, status);
    showToast(`Order status updated to ${status}.`);
  };

  const handleScan = (detectedCodes) => {
    if (!detectedCodes?.length) return;
    const now = Date.now();
    if (now - lastScanTime.current < 2000) return;
    lastScanTime.current = now;
    processQRData(detectedCodes[0].rawValue);
  };

  const processQRData = (qrData) => {
    try {
      const payload = JSON.parse(qrData);
      const { orderId, token } = payload;

      const isValid = verifyReceiptToken(orderId, token);

      if (!isValid) {
        setTokenValid(false);
        setScanResultOrder({ id: orderId });
        setScanResultOpen(true);
        showToast('❌ Invalid QR code (token mismatch)', 'error');
        return;
      }

      const foundOrder = orders.find(o =>
        o.id === orderId ||
        o.id === `ORD-${orderId}` ||
        `ORD-${o.id}` === orderId ||
        o.id.replace('#', '') === orderId.replace('#', '')
      );

      setScanResultOrder(foundOrder || {
        id: orderId,
        customer: { name: 'Customer' },
        items: [],
        grandTotal: 0,
        status: 'Confirmed',
        _isMockFallback: true,
      });

      setTokenValid(true);
      setScanResultOpen(true);
      showToast('✓ QR verified!', 'success');
    } catch (e) {
      const cleanId = qrData.replace('#', '').trim().toUpperCase();
      const foundOrder = orders.find(o => o.id.replace('#', '').toUpperCase() === cleanId);
      if (foundOrder) {
        setScanResultOrder(foundOrder);
        setTokenValid(true);
        setScanResultOpen(true);
        showToast(`Order ${cleanId} found!`, 'success');
      } else {
        showToast('❌ Invalid QR code format or order not found', 'error');
      }
    }
  };

  if (!isPinVerified) {
    return (
      <PINEntryUI
        onSuccess={() => setIsPinVerified(true)}
        onClose={() => navigate('/admin/mobile-scanner', { replace: true })}
        isLockedOut={isLockedOut}
        lockoutTimeRemaining={lockoutTimeRemaining}
        attempts={attempts}
        maxAttempts={MAX_ATTEMPTS}
      />
    );
  }

  return (
    <div className="bg-brand-950 min-h-screen flex flex-col">
      <div className="bg-brand-900 text-white p-4 flex items-center justify-between shadow-lg">
        <div>
          <h1 className="text-xl font-black">Mobile QR Scanner</h1>
          <p className="text-xs text-brand-200 font-bold tracking-widest">PIN Verified u2022 Admin Only</p>
        </div>
        <button
          onClick={() => {
            setIsPinVerified(false);
            sessionStorage.removeItem('pinVerifiedAt');
            sessionStorage.removeItem('adminPinSession');
          }}
          className="p-2 hover:bg-brand-800 rounded-lg transition-colors"
          title="Lock session"
        >
          <Lock size={20} />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="bg-black rounded-2xl overflow-hidden shadow-2xl mb-6" style={{ aspectRatio: '1' }}>
            <div className="w-full h-full">
              <Scanner
                onScan={handleScan}
                onError={(error) => {
                  console.error('Scanner error:', error);
                  showToast(`Camera error: ${error?.message || 'Unable to access camera'}`, 'error');
                }}
                formats={['qr_code']}
                components={{ audio: false, torch: true }}
                constraints={{
                  video: {
                    facingMode: 'environment',
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                  }
                }}
              />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur text-white rounded-xl p-4 text-center">
            <QrCode className="mx-auto mb-2" size={32} />
            <p className="font-black text-sm">Point camera at receipt QR code</p>
            <p className="text-xs text-white/70 mt-1">Automatic detection and verification</p>
          </div>
        </div>
      </div>

      <ScanResultModal
        order={scanResultOrder}
        isOpen={scanResultOpen}
        onClose={() => { setScanResultOpen(false); lastScanTime.current = 0; }}
        onStatusChange={handleStatusChange}
        tokenValid={tokenValid}
      />
    </div>
  );
}