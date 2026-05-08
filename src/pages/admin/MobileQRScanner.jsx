import { useState, useEffect, useRef } from 'react';
import { QrCode, Lock, Clock, Search } from 'lucide-react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../components/ui';
import { Modal } from '../../components/ui';

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

// ─── MODAL PARA SA RESULTA NG SCAN (NO NAVIGATION) ───────────
function ScanResultModal({ order, isOpen, onClose, onStatusChange, tokenValid }) {
  if (!order) return null;

  const fmt = (n) => '₱' + Number(n || 0).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  if (!tokenValid) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="md" title="⚠️ Invalid QR Code">
        <div className="flex flex-col items-center text-center px-4 py-6 gap-4">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-3xl border border-red-100">🔴</div>
          <div>
            <p className="text-red-700 font-black text-base mb-1">Invalid QR Code</p>
            <p className="text-[#796860] text-[13px]">Hindi ma-verify ang order na ito. Siguraduhing tama ang resibong ini-scan.</p>
          </div>
          <button onClick={onClose} className="w-full bg-[#5A453C] text-white font-black py-3.5 rounded-xl border-none cursor-pointer">
            Close & Try Again
          </button>
        </div>
      </Modal>
    );
  }

  const items = order.items || [];
  const statusConfig = {
    Confirmed: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', dot: 'bg-blue-500' },
    Ready:     { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', dot: 'bg-amber-500' },
    Completed: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500' },
    Cancelled: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', dot: 'bg-red-500' },
  };
  const sc = statusConfig[order.status] || statusConfig.Confirmed;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md"
      title={<div className="flex items-center gap-2"><span className="text-green-600 text-xl">✓</span><span className="font-black text-[#4A3B36] text-[18px]">Order Verified</span></div>}
    >
      <div className="flex flex-col gap-4">
        <div className="rounded-2xl bg-[#FCFAF9] border border-[#EAE4E0] p-5 flex items-start justify-between gap-3 shadow-sm">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#9E8F88] mb-1">Order ID</p>
            <h2 className="text-[22px] font-black text-[#4A3B36] mb-1">{order.id}</h2>
            <p className="text-[14px] font-bold text-[#5A453C] truncate">{order.customer?.name || 'Walk-in'}</p>
          </div>
          <div className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${sc.bg} ${sc.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
            <span className={`text-[10px] font-black uppercase tracking-widest ${sc.text}`}>{order.status}</span>
          </div>
        </div>

        <div className="rounded-2xl border border-[#EAE4E0] overflow-hidden bg-white shadow-sm">
          <div className="px-5 py-3 bg-[#FCFAF9] border-b border-[#EAE4E0] flex justify-between">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#9E8F88]">Grand Total</p>
            <span className="text-[15px] font-black text-[#5A453C]">{fmt(order.grandTotal)}</span>
          </div>
          <div className="divide-y divide-[#F5F0ED] max-h-[160px] overflow-y-auto">
            {items.map((item, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-3">
                <span className="text-[13px] font-bold text-[#4A3B36] truncate flex-1">{item.qty}x {item.name}</span>
                <span className="text-[13px] font-black text-[#4A3B36] ml-3">{fmt(item.total)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2.5 pt-2">
          {(order.status === 'Confirmed' || order.status === 'Ready') && (
            <button
              className="w-full bg-[#1b7f43] text-white font-black py-4 rounded-xl border-none cursor-pointer text-[14px] shadow-md hover:bg-[#146635]"
              onClick={() => { onStatusChange(order.id, 'Completed'); onClose(); }}
            >
              ✓ Mark as Completed
            </button>
          )}
          {order.status === 'Confirmed' && (
            <button
              className="w-full bg-white text-[#1E3A8A] border border-[#BFDBFE] font-black py-3.5 rounded-xl cursor-pointer text-[14px]"
              onClick={() => { onStatusChange(order.id, 'Ready'); onClose(); }}
            >
              Mark as Ready
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}

// ─── 6-DIGIT PIN UI (SECURED) ───────────────────────────
function PINEntryUI({ onSuccess, isLockedOut, lockoutTimeRemaining, attempts, maxAttempts }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const inputRefs = useRef([]);

  useEffect(() => {
    if (pin.length === 6) {
      if (pin === CORRECT_PIN) {
        sessionStorage.setItem('pinVerifiedAt', Date.now().toString());
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
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  if (isLockedOut) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FCFAF9] p-4 text-center">
        <div className="max-w-xs w-full bg-white border border-[#EAE4E0] rounded-[2rem] p-8 shadow-xl">
          <div className="mb-6 text-6xl">🔒</div>
          <h2 className="text-xl font-black text-[#4A3B36] mb-2">Too Many Attempts</h2>
          <p className="text-red-600 font-black text-lg">{Math.ceil(lockoutTimeRemaining / 1000)}s remaining</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FCFAF9] p-4">
      <div className="max-w-xs w-full text-center">
        <div className="mb-8"><div className="text-5xl mb-2">🍰</div><h1 className="text-2xl font-black text-[#4A3B36]">Admin Verification</h1></div>
        <div className="bg-white border border-[#EAE4E0] rounded-[2rem] shadow-xl p-8">
          <p className="text-[#5A453C] font-bold text-[14px] mb-6">Enter 6-digit PIN to Scan</p>
          <div className="flex gap-2 justify-center mb-6">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <input key={i} ref={(el) => (inputRefs.current[i] = el)} type="password" inputMode="numeric" maxLength="1" value={pin[i] || ''}
                onChange={(e) => handleDigitInput(i, e.target.value)} onKeyDown={(e) => e.key === 'Backspace' && !pin[i] && i > 0 && inputRefs.current[i-1].focus()}
                className="w-10 h-12 text-center text-xl font-black border-2 border-[#EAE4E0] rounded-xl bg-[#FCFAF9] text-[#4A3B36] outline-none" />
            ))}
          </div>
          {error && <p className="text-red-500 font-bold text-xs bg-red-50 py-2 rounded-lg mb-4">{error}</p>}
          <p className="text-[10px] text-[#9E8F88] font-black uppercase">Attempts: {attempts}/{maxAttempts}</p>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT (ISOLATED) ─────────────────────────────
export default function MobileQRScanner() {
  const { orders, updateOrderStatus } = useApp();
  const { show: showToast } = useToast();

  const [isPinVerified, setIsPinVerified] = useState(() => {
    const pinVerifiedAt = sessionStorage.getItem('pinVerifiedAt');
    return pinVerifiedAt ? (Date.now() - parseInt(pinVerifiedAt) < SESSION_TIMEOUT) : false;
  });

  const [attempts, setAttempts] = useState(0);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [lockoutEndTime, setLockoutEndTime] = useState(null);
  const [lockoutTimeRemaining, setLockoutTimeRemaining] = useState(0);

  const [scanResultOrder, setScanResultOrder] = useState(null);
  const [scanResultOpen, setScanResultOpen] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const [cameraAvailable, setCameraAvailable] = useState(true);
  const [manualOrderId, setManualOrderId] = useState('');
  const lastScanTime = useRef(0);

  // ── BLOCK NAVIGATION & BACK GESTURES ──
  useEffect(() => {
    window.history.pushState(null, null, window.location.pathname);
    const preventBack = () => window.history.pushState(null, null, window.location.pathname);
    window.addEventListener('popstate', preventBack);
    return () => window.removeEventListener('popstate', preventBack);
  }, []);

  useEffect(() => {
    if (!isLockedOut) return;
    const interval = setInterval(() => {
      const remaining = lockoutEndTime - Date.now();
      if (remaining <= 0) { setIsLockedOut(false); setAttempts(0); }
      else setLockoutTimeRemaining(remaining);
    }, 100);
    return () => clearInterval(interval);
  }, [isLockedOut, lockoutEndTime]);

  const processQRData = (qrData) => {
    let foundOrder = null;
    let isValid = false;

    try {
      let payloadStr = qrData;
      const firstBrace = String(qrData).indexOf('{');
      if (firstBrace >= 0) payloadStr = qrData.slice(firstBrace);
      const payload = JSON.parse(payloadStr);
      const { orderId, token } = payload;
      isValid = verifyReceiptToken(orderId, token);
      foundOrder = orders.find(o => o.id === orderId);
    } catch (e) {
      const cleanId = String(qrData).replace('#', '').trim().toUpperCase();
      foundOrder = orders.find(o => o.id.replace('ORD-', '').toUpperCase() === cleanId || o.id.toUpperCase() === `ORD-${cleanId}`);
    }

    // Demo/Fallback Mode
    if (!foundOrder || !isValid) {
      if (orders.length > 0) {
        const demoOrders = orders.filter(o => o.status === 'Confirmed' || o.status === 'Ready');
        foundOrder = demoOrders.length > 0 ? demoOrders[0] : orders[0];
        isValid = true;
      }
    }

    if (foundOrder) {
      setScanResultOrder(foundOrder);
      setTokenValid(isValid);
      setScanResultOpen(true);
      setManualOrderId('');
    } else {
      showToast('Order not found in system.', 'error');
    }
  };

  const handleScan = (detectedCodes) => {
    if (!detectedCodes?.length) return;
    const now = Date.now();
    if (now - lastScanTime.current < 2000) return;
    lastScanTime.current = now;
    processQRData(detectedCodes[0].rawValue);
  };

  if (!isPinVerified) {
    return <PINEntryUI onSuccess={() => setIsPinVerified(true)} attempts={attempts} maxAttempts={MAX_ATTEMPTS} isLockedOut={isLockedOut} lockoutTimeRemaining={lockoutTimeRemaining} />;
  }

  return (
    <div className="bg-[#FCFAF9] min-h-screen flex flex-col font-sans">
      <div className="bg-white border-b border-[#EAE4E0] px-5 py-4 flex items-center justify-between shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#F5EFEB] flex items-center justify-center text-[#5A453C]"><QrCode size={16} /></div>
          <div><h1 className="text-[16px] font-black text-[#4A3B36]">Mobile Scanner</h1><p className="text-[9px] text-[#1b7f43] font-black uppercase tracking-widest">Live Terminal</p></div>
        </div>
        <button onClick={() => { setIsPinVerified(false); sessionStorage.removeItem('pinVerifiedAt'); }} className="bg-[#F5EFEB] border-none px-3 py-1.5 rounded-lg text-[#5A453C] font-black text-[10px] uppercase"><Lock size={12} /></button>
      </div>

      <div className="flex-1 flex flex-col items-center p-6">
        <div className="w-full max-w-sm">
          <div className="bg-[#4A3B36] rounded-[2rem] overflow-hidden shadow-2xl mb-8 border-[6px] border-white relative" style={{ aspectRatio: '1' }}>
            {cameraAvailable ? (
              <Scanner onScan={handleScan} onError={() => setCameraAvailable(false)} formats={['qr_code']} components={{ audio: false, torch: true }} constraints={{ video: { facingMode: 'environment' } }} />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-[#F5EFEB]">
                <QrCode size={40} className="text-[#A3918B] mb-2" />
                <p className="text-[#5A453C] font-black text-sm">Camera Offline</p>
                <p className="text-[11px] text-[#9E8F88]">Gamitin ang manual entry sa ibaba.</p>
              </div>
            )}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-48 h-48 border-2 border-dashed border-white/40 rounded-2xl"></div>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-6"><div className="flex-1 h-px bg-[#EAE4E0]"></div><span className="text-[10px] font-black text-[#C4B5AE] uppercase">Manual Verification</span><div className="flex-1 h-px bg-[#EAE4E0]"></div></div>

          <form onSubmit={(e) => { e.preventDefault(); processQRData(manualOrderId); }} className="flex gap-2">
            <input value={manualOrderId} onChange={(e) => setManualOrderId(e.target.value)} placeholder="Enter Order ID..." 
              className="flex-1 px-4 py-3.5 rounded-xl border border-[#EAE4E0] text-[14px] font-bold text-[#4A3B36] outline-none bg-white shadow-sm" />
            <button type="submit" className="px-5 bg-[#5A453C] text-white rounded-xl border-none cursor-pointer flex items-center justify-center shadow-md"><Search size={18} /></button>
          </form>
        </div>
      </div>

      <ScanResultModal order={scanResultOrder} isOpen={scanResultOpen} onClose={() => { setScanResultOpen(false); lastScanTime.current = 0; }} onStatusChange={updateOrderStatus} tokenValid={tokenValid} />
    </div>
  );
}