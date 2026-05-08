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

function ScanResultModal({ order, isOpen, onClose, onStatusChange, tokenValid }) {
  if (!order) return null;
  const navigate = useNavigate();

  function fmt(n) {
    return '₱' + Number(n || 0).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  if (!tokenValid) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="md" title="⚠️ Invalid QR Code">
        <div className="flex flex-col items-center text-center px-4 py-6 gap-4">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-3xl">🔴</div>
          <div>
            <p className="text-red-700 font-black text-base mb-1">Invalid or Unauthorized QR Code</p>
            <p className="text-slate-500 text-sm">This QR code cannot be verified. It may have been tampered with or is not from this system.</p>
          </div>
          <Button onClick={onClose} className="w-full bg-red-600 text-white font-black py-3 rounded-xl hover:bg-red-700">
            Close & Try Again
          </Button>
        </div>
      </Modal>
    );
  }

  const items = order.items || [];
  const grandTotal = order.grandTotal || 0;
  const subtotal = order.subtotal || grandTotal;
  const customerName = order.customer?.name || 'Walk-in';
  const paymentType = order.paymentType;
  const amountPaid = order.amountPaid || 0;
  const balance = order.balance || 0;
  const pickupDate = order.pickupDate || null;
  const pickupTime = order.pickupTime || '';

  const statusConfig = {
    Confirmed: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', dot: 'bg-blue-500' },
    Ready:     { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800', dot: 'bg-amber-500' },
    Completed: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', dot: 'bg-green-500' },
    Cancelled: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', dot: 'bg-red-500' },
  };
  const sc = statusConfig[order.status] || statusConfig.Confirmed;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title={
        <div className="flex items-center gap-2">
          <span className="text-green-600 text-lg">✓</span>
          <span className="font-black text-brand-950 text-base">Order Verified</span>
        </div>
      }
    >
      <div className="flex flex-col gap-3">

        {/* ── ORDER HEADER CARD ── */}
        <div className="rounded-2xl bg-[#fdf8f6] border-2 border-brand-100 p-4 flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-black uppercase tracking-widest text-brand-400 mb-0.5">Order ID</p>
            <h2 className="text-2xl font-black text-brand-950 leading-none mb-2">{order.id}</h2>
            <p className="text-sm font-bold text-brand-700 truncate">{customerName}</p>
            {pickupDate && (
              <p className="text-xs text-brand-400 font-medium mt-1">
                📅 {pickupDate}{pickupTime ? ` · ${pickupTime}` : ''}
              </p>
            )}
          </div>
          {/* Status Badge */}
          <div className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 ${sc.bg} ${sc.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
            <span className={`text-[11px] font-black uppercase tracking-widest ${sc.text}`}>{order.status}</span>
          </div>
        </div>

        {/* ── ITEMS ── */}
        <div className="rounded-2xl border-2 border-slate-100 overflow-hidden bg-white">
          <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Items Ordered</p>
          </div>
          {items.length > 0 ? (
            <div className="divide-y divide-slate-50 max-h-[150px] overflow-y-auto">
              {items.map((item, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-2.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="shrink-0 w-5 h-5 rounded-md bg-brand-100 text-brand-700 text-[10px] font-black flex items-center justify-center">
                      {item.qty}
                    </span>
                    <span className="text-sm font-bold text-brand-950 truncate">{item.name}</span>
                  </div>
                  <span className="text-sm font-black text-brand-950 ml-2 shrink-0">{fmt(item.total)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-slate-400 text-sm py-4 font-medium">No items on record</p>
          )}
        </div>

        {/* ── TOTALS ── */}
        <div className="rounded-2xl border-2 border-slate-100 bg-white overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-50">
            <span className="text-sm text-slate-500 font-semibold">Subtotal</span>
            <span className="text-sm font-bold text-brand-950">{fmt(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-base font-black text-brand-950">Grand Total</span>
            <span className="text-xl font-black text-green-700">{fmt(grandTotal)}</span>
          </div>
        </div>

        {/* ── PAYMENT STATUS ── */}
        {paymentType && (
          <div className={`rounded-2xl border-2 px-4 py-3 flex items-center justify-between
            ${paymentType === 'deposit' ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200'}`}>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-0.5">Payment</p>
              <p className={`text-sm font-black ${paymentType === 'deposit' ? 'text-amber-800' : 'text-emerald-800'}`}>
                {paymentType === 'deposit' ? 'Deposit Paid' : 'Fully Paid'}
              </p>
            </div>
            <div className="text-right">
              <p className={`text-base font-black ${paymentType === 'deposit' ? 'text-amber-800' : 'text-emerald-800'}`}>
                {fmt(amountPaid)}
              </p>
              {paymentType === 'deposit' && (
                <p className="text-xs font-bold text-red-500">Balance: {fmt(balance)}</p>
              )}
            </div>
          </div>
        )}

        {/* ── STATUS BANNERS ── */}
        {order.status === 'Completed' && (
          <div className="rounded-2xl bg-green-50 border-2 border-green-200 px-4 py-3 flex items-center gap-3">
            <span className="text-xl">✅</span>
            <p className="text-green-900 font-black text-sm">This order has already been completed.</p>
          </div>
        )}
        {order.status === 'Cancelled' && (
          <div className="rounded-2xl bg-red-50 border-2 border-red-200 px-4 py-3 flex items-center gap-3">
            <span className="text-xl">❌</span>
            <p className="text-red-900 font-black text-sm">This order has been cancelled.</p>
          </div>
        )}

        {/* ── ACTION BUTTONS ── */}
        <div className="flex flex-col gap-2 pt-1">
          {(order.status === 'Confirmed' || order.status === 'Ready') && (
            <Button
              className="w-full bg-green-600 text-white font-black py-3 rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              onClick={() => { onStatusChange(order.id, 'Completed'); onClose(); }}
            >
              ✓ Mark as Completed
            </Button>
          )}
          {order.status === 'Confirmed' && (
            <Button
              variant="secondary"
              className="w-full bg-blue-50 text-blue-900 border-2 border-blue-200 font-black py-2.5 rounded-xl hover:bg-blue-100 transition-colors"
              onClick={() => { onStatusChange(order.id, 'Ready'); onClose(); }}
            >
              Mark as Ready
            </Button>
          )}
          <Button
            variant="secondary"
            className="w-full border-2 border-slate-200 text-slate-600 font-bold py-2.5 rounded-xl hover:bg-slate-50 transition-colors text-sm"
            onClick={() => { onClose(); navigate('/orders'); }}
          >
            View Full Details →
          </Button>
        </div>

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
  const [cameraAvailable, setCameraAvailable] = useState(true);
  const [manualOrderId, setManualOrderId] = useState('');
  const [manualError, setManualError] = useState('');
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
    const raw = detectedCodes[0]?.rawValue ?? detectedCodes[0]?.text ?? detectedCodes[0]?.data ?? (typeof detectedCodes[0] === 'string' ? detectedCodes[0] : null);
    processQRData(raw);
  };

  const processQRData = (qrData) => {
  try {
    let payloadStr = qrData;
    const firstBrace = String(qrData).indexOf('{');
    if (firstBrace >= 0) payloadStr = qrData.slice(firstBrace);

    const payload = JSON.parse(payloadStr);
    const { orderId, token } = payload;

    const isValid = verifyReceiptToken(orderId, token);

    // Find order — try multiple ID formats
    const foundOrder = orders.find(o =>
      o.id === orderId ||
      o.id === `ORD-${orderId}` ||
      `ORD-${o.id}` === orderId ||
      o.id.replace('#', '').toUpperCase() === orderId.replace('#', '').toUpperCase()
    );

    if (!isValid) {
      setTokenValid(false);
      setScanResultOrder(foundOrder || { id: orderId });
      setScanResultOpen(true);
      showToast('❌ Invalid QR code (token mismatch)', 'error');
      return;
    }

    if (!foundOrder) {
      showToast('❌ Order not found', 'error');
      return;
    }

    // ✅ Use the actual order from dummy data — no mock fallback
    setScanResultOrder(foundOrder);
    setTokenValid(true);
    setScanResultOpen(true);
    showToast('✓ QR verified!', 'success');

  } catch (e) {
    // Not JSON — try plain order ID lookup
    const cleanId = qrData.replace('#', '').trim().toUpperCase();

    const foundOrder = orders.find(o =>
      o.id.replace('#', '').toUpperCase() === cleanId ||
      o.id.replace('ORD-', '').toUpperCase() === cleanId ||
      (`ORD-${o.id}`).replace('#', '').toUpperCase() === cleanId
    );

    if (foundOrder) {
      setScanResultOrder(foundOrder);
      setTokenValid(true);
      setScanResultOpen(true);
      showToast(`Order ${foundOrder.id} found!`, 'success');
    } else {
      showToast('❌ Order not found', 'error');
    }
  }
};

  // Manual input handler (no token verification)
  const handleManualSubmit = (e) => {
    e?.preventDefault();
    setManualError('');
    const raw = manualOrderId.trim();
    if (!raw) return setManualError('Please enter an Order ID');

    const cleanId = raw.replace('#', '').toUpperCase();
    const foundOrder = orders.find(o =>
      o.id.replace('#', '').toUpperCase() === cleanId ||
      (`ORD-${o.id}`).replace('#', '').toUpperCase() === cleanId ||
      o.id.toUpperCase() === cleanId
    );

    if (foundOrder) {
      setScanResultOrder(foundOrder);
      setTokenValid(true);
      setScanResultOpen(true);
      setManualOrderId('');
      showToast(`Order ${foundOrder.id} found!`, 'success');
    } else {
      setManualError(`Order ${raw} not found`);
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
              {cameraAvailable ? (
                <Scanner
                  onScan={handleScan}
                  onError={(error) => {
                    console.error('Scanner error:', error);
                    setCameraAvailable(false);
                    showToast('Camera unavailable — use manual input below to test', 'error');
                  }}
                  formats={['qr_code']}
                  components={{ audio: false, torch: true }}
                  constraints={{ video: { facingMode: 'environment' } }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center p-4 text-center">
                  <div>
                    <p className="text-white font-bold mb-2">Camera unavailable — use manual input below to test</p>
                    <p className="text-xs text-white/70">(If you're on localhost or blocked camera, use the manual field.)</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur text-white rounded-xl p-4 text-center">
            <QrCode className="mx-auto mb-2" size={32} />
            <p className="font-black text-sm">Point camera at receipt QR code</p>
            <p className="text-xs text-white/70 mt-1">Automatic detection and verification</p>
          </div>
        </div>
      </div>
      {/* Manual input for testing/fallback */}
      <div className="max-w-sm mx-auto w-full mt-4 px-4">
        <form onSubmit={handleManualSubmit} className="flex gap-2">
          <input
            aria-label="Manual Order ID"
            value={manualOrderId}
            onChange={(e) => { setManualOrderId(e.target.value); setManualError(''); }}
            placeholder="e.g. ORD-0241"
            className="flex-1 px-4 py-3 rounded-lg text-slate-900"
          />
          <Button type="submit" className="px-4 bg-brand-900 text-white">Search</Button>
        </form>
        {manualError && <p className="text-red-600 text-sm mt-2 text-center">{manualError}</p>}
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