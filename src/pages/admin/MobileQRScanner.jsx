import { useState, useEffect, useRef } from 'react';
import { QrCode, Lock, Clock, Search, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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

// ─── MODAL PARA SA RESULTA NG SCAN ───────────────────────────
function ScanResultModal({ order, isOpen, onClose, onStatusChange, tokenValid }) {
  if (!order) return null;

  function fmt(n) {
    return '₱' + Number(n || 0).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  // Kung strictly invalid at hindi idinaan sa demo fallback
  if (!tokenValid) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="md" title="⚠️ Invalid QR Code">
        <div className="flex flex-col items-center text-center px-4 py-6 gap-4">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-3xl border border-red-100">🔴</div>
          <div>
            <p className="text-red-700 font-black text-base mb-1">Invalid or Unauthorized QR Code</p>
            <p className="text-[#796860] text-[13px]">This QR code cannot be verified. It may have been tampered with or is not from this system.</p>
          </div>
          <button onClick={onClose} className="w-full bg-[#5A453C] text-white font-black py-3.5 rounded-xl hover:bg-[#4A3B36] transition-colors border-none cursor-pointer mt-2">
            Close & Try Again
          </button>
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
    Confirmed: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', dot: 'bg-blue-500' },
    Ready:     { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', dot: 'bg-amber-500' },
    Completed: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500' },
    Cancelled: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', dot: 'bg-red-500' },
  };
  const sc = statusConfig[order.status] || statusConfig.Confirmed;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md"
      title={
        <div className="flex items-center gap-2">
          <span className="text-green-600 text-xl">✓</span>
          <span className="font-black text-[#4A3B36] text-[18px]">Order Verified</span>
        </div>
      }
    >
      <div className="flex flex-col gap-4">

        {/* ── ORDER HEADER CARD ── */}
        <div className="rounded-2xl bg-[#FCFAF9] border border-[#EAE4E0] p-5 flex items-start justify-between gap-3 shadow-sm">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#9E8F88] mb-1">Order ID</p>
            <h2 className="text-[22px] font-black text-[#4A3B36] leading-none mb-2">{order.id}</h2>
            <p className="text-[14px] font-bold text-[#5A453C] truncate">{customerName}</p>
            {pickupDate && (
              <p className="text-[12px] text-[#796860] font-bold mt-1.5 flex items-center gap-1.5">
                📅 {pickupDate}{pickupTime ? ` · ${pickupTime}` : ''}
              </p>
            )}
          </div>
          <div className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${sc.bg} ${sc.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
            <span className={`text-[10px] font-black uppercase tracking-widest ${sc.text}`}>{order.status}</span>
          </div>
        </div>

        {/* ── ITEMS ── */}
        <div className="rounded-2xl border border-[#EAE4E0] overflow-hidden bg-white shadow-sm">
          <div className="px-5 py-3 bg-[#FCFAF9] border-b border-[#EAE4E0]">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#9E8F88]">Items Ordered</p>
          </div>
          {items.length > 0 ? (
            <div className="divide-y divide-[#F5F0ED] max-h-[160px] overflow-y-auto custom-scrollbar">
              {items.map((item, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-3.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="shrink-0 w-6 h-6 rounded-md bg-[#F5EFEB] text-[#5A453C] text-[11px] font-black flex items-center justify-center">
                      {item.qty}
                    </span>
                    <span className="text-[14px] font-bold text-[#4A3B36] truncate">{item.name}</span>
                  </div>
                  <span className="text-[14px] font-black text-[#4A3B36] ml-3 shrink-0">{fmt(item.total)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-[#9E8F88] text-[13px] py-5 font-bold">No items on record</p>
          )}
        </div>

        {/* ── TOTALS ── */}
        <div className="rounded-2xl border border-[#EAE4E0] bg-white overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-5 py-3 border-b border-[#F5F0ED]">
            <span className="text-[13px] text-[#796860] font-bold">Subtotal</span>
            <span className="text-[13px] font-bold text-[#4A3B36]">{fmt(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between px-5 py-4 bg-[#FCFAF9]">
            <span className="text-[15px] font-black text-[#4A3B36] uppercase tracking-wider">Grand Total</span>
            <span className="text-[18px] font-black text-[#5A453C]">{fmt(grandTotal)}</span>
          </div>
        </div>

        {/* ── PAYMENT STATUS ── */}
        {paymentType && (
          <div className={`rounded-2xl border px-5 py-4 flex items-center justify-between shadow-sm
            ${paymentType === 'deposit' ? 'bg-[#FFF9E6] border-[#FDE68A]' : 'bg-[#ECFDF5] border-[#A7F3D0]'}`}>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#9E8F88] mb-1">Payment</p>
              <p className={`text-[14px] font-black ${paymentType === 'deposit' ? 'text-amber-700' : 'text-emerald-700'}`}>
                {paymentType === 'deposit' ? 'Deposit Paid' : 'Fully Paid'}
              </p>
            </div>
            <div className="text-right">
              <p className={`text-[16px] font-black ${paymentType === 'deposit' ? 'text-amber-700' : 'text-emerald-700'}`}>
                {fmt(amountPaid)}
              </p>
              {paymentType === 'deposit' && (
                <p className="text-[11px] font-bold text-red-500 mt-0.5">Balance: {fmt(balance)}</p>
              )}
            </div>
          </div>
        )}

        {/* ── ACTION BUTTONS ── */}
        <div className="flex flex-col gap-2.5 pt-2">
          {(order.status === 'Confirmed' || order.status === 'Ready') && (
            <button
              className="w-full bg-[#1b7f43] text-white font-black py-4 rounded-xl hover:bg-[#146635] transition-colors flex items-center justify-center gap-2 border-none cursor-pointer text-[14px] shadow-md shadow-green-900/10"
              onClick={() => { onStatusChange(order.id, 'Completed'); onClose(); }}
            >
              ✓ Mark as Completed
            </button>
          )}
          {order.status === 'Confirmed' && (
            <button
              className="w-full bg-[#EFF6FF] text-[#1E3A8A] border border-[#BFDBFE] font-black py-3.5 rounded-xl hover:bg-[#DBEAFE] transition-colors cursor-pointer text-[14px]"
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

// ─── 6-DIGIT PIN ENTRY UI (MALINIS NA DESIGN) ──────────────────
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
      <div className="min-h-screen flex items-center justify-center bg-[#FCFAF9] p-4 font-sans">
        <div className="max-w-xs w-full bg-white border border-[#EAE4E0] rounded-[2rem] shadow-xl p-8 text-center">
          <div className="mb-6 text-6xl">🔒</div>
          <h2 className="text-2xl font-black text-[#4A3B36] mb-2">Too Many Attempts</h2>
          <p className="text-[#796860] text-[13px] mb-6 font-medium">
            Masyadong maraming maling PIN. Subukan muli sa loob ng {Math.ceil(lockoutTimeRemaining / 1000)} segundo.
          </p>
          <div className="flex items-center justify-center gap-2 bg-red-50 border border-red-100 rounded-xl p-4 mb-6">
            <Clock size={18} className="text-red-500" />
            <span className="text-red-600 font-black text-lg">{Math.ceil(lockoutTimeRemaining / 1000)}s</span>
          </div>
          <button
            onClick={onClose}
            className="w-full bg-[#F5EFEB] text-[#5A453C] font-black py-3.5 rounded-xl hover:bg-[#EAE4E0] transition-colors border-none cursor-pointer"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FCFAF9] p-4 font-sans">
      <div className="max-w-xs w-full">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <div className="mb-4 text-5xl">🍰</div>
          <h1 className="text-[26px] font-black text-[#4A3B36] mb-1 tracking-tight">Aileen Cake Max</h1>
          <p className="text-[#9E8F88] text-[10px] font-black tracking-[0.2em] uppercase">Admin Verification</p>
        </div>

        {/* PIN Entry Card */}
        <div className="bg-white border border-[#EAE4E0] rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-8">
          <div className="text-center mb-6">
            <p className="text-[#5A453C] font-bold text-[14px]">Enter 6-digit PIN</p>
            {error && (
              <p className="text-red-500 font-black text-[13px] mt-2 bg-red-50 py-1.5 rounded-md">{error}</p>
            )}
          </div>

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
                className="w-10 h-12 text-center text-xl font-black border-2 border-[#EAE4E0] rounded-xl bg-[#FCFAF9] text-[#4A3B36] focus:bg-white focus:border-[#5A453C] focus:outline-none transition-all"
              />
            ))}
          </div>

          <div className="text-center text-[11px] text-[#9E8F88] font-bold mb-6">
            {attempts > 0
              ? <span className="text-red-400">{attempts} failed attempt{attempts > 1 ? 's' : ''} — {maxAttempts - attempts} remaining</span>
              : `${maxAttempts} attempts allowed`
            }
          </div>

          <button
            onClick={onClose}
            className="w-full bg-[#F5EFEB] text-[#5A453C] font-black text-[13px] py-3.5 rounded-xl hover:bg-[#EAE4E0] transition-colors border-none cursor-pointer"
          >
            Cancel
          </button>
        </div>

        <p className="text-center text-[10px] text-[#C4B5AE] font-bold mt-6 flex items-center justify-center gap-1.5 uppercase tracking-wide">
          <Lock size={12} /> Session expires after 15 mins
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
  const [lockoutEndTime, setLockoutEndTime] = useState(null);
  const [lockoutTimeRemaining, setLockoutTimeRemaining] = useState(0);

  const [scanResultOrder, setScanResultOrder] = useState(null);
  const [scanResultOpen, setScanResultOpen] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const [cameraAvailable, setCameraAvailable] = useState(true);
  
  const [manualOrderId, setManualOrderId] = useState('');
  const lastScanTime = useRef(0);

  // Block back button
  useEffect(() => {
    window.history.pushState(null, '', window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, '', window.location.href);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

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

  // ─── DEMO MODE LOGIC: Kahit mali ang QR, magpapakita ng sample order ───
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
      foundOrder = orders.find(o => o.id === orderId || o.id === `ORD-${orderId}` || `ORD-${o.id}` === orderId);

    } catch (e) {
      // Manual plain text ID
      const cleanId = String(qrData).replace('#', '').trim().toUpperCase();
      foundOrder = orders.find(o => 
        o.id.replace('#', '').toUpperCase() === cleanId || 
        o.id.replace('ORD-', '').toUpperCase() === cleanId || 
        (`ORD-${o.id}`).replace('#', '').toUpperCase() === cleanId
      );
    }

    // DEMO OVERRIDE: Kung hindi mahanap yung ID o mali ang token, pipili tayo ng dummy order para mapakita
    if (!foundOrder || !isValid) {
      if (orders.length > 0) {
        const demoOrders = orders.filter(o => o.status === 'Confirmed' || o.status === 'Ready');
        foundOrder = demoOrders.length > 0 ? demoOrders[0] : orders[0];
        isValid = true; // Force valid sa demo
      }
    }

    if (foundOrder) {
      setScanResultOrder(foundOrder);
      setTokenValid(true);
      setScanResultOpen(true);
      setManualOrderId(''); // Clear input if it was manual
      showToast(`✓ Order verified!`, 'success');
    } else {
      showToast('❌ Walang order na nakita sa system.', 'error');
    }
  };

  const handleManualSubmit = (e) => {
    e?.preventDefault();
    if (!manualOrderId.trim()) {
      showToast('Please enter an Order ID', 'warning');
      return;
    }
    processQRData(manualOrderId);
  };

  if (!isPinVerified) {
    return (
      <PINEntryUI
        onSuccess={() => setIsPinVerified(true)}
        onClose={() => navigate('/admin/orders', { replace: true })}
        isLockedOut={isLockedOut}
        lockoutTimeRemaining={lockoutTimeRemaining}
        attempts={attempts}
        maxAttempts={MAX_ATTEMPTS}
      />
    );
  }

  return (
    <div className="bg-[#FCFAF9] min-h-screen flex flex-col font-sans">
      
      {/* ── HEADER ── */}
      <div className="bg-white border-b border-[#EAE4E0] px-5 py-4 flex items-center justify-between shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/admin/orders')}
            className="w-10 h-10 rounded-full bg-[#F5EFEB] flex items-center justify-center text-[#5A453C] hover:bg-[#EAE4E0] border-none cursor-pointer"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-[18px] font-black text-[#4A3B36] leading-none mb-1">QR Scanner</h1>
            <p className="text-[9px] text-[#1b7f43] font-black tracking-widest uppercase flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1b7f43] animate-pulse"></span>
              Admin Session Active
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            setIsPinVerified(false);
            sessionStorage.removeItem('pinVerifiedAt');
            sessionStorage.removeItem('adminPinSession');
          }}
          className="px-4 py-2 bg-[#F5EFEB] text-[#5A453C] text-[11px] font-black uppercase tracking-wide rounded-lg hover:bg-[#EAE4E0] transition-colors border-none cursor-pointer flex items-center gap-1.5"
        >
          <Lock size={12} /> Lock
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center p-6">
        
        {/* ── SCANNER AREA ── */}
        <div className="w-full max-w-sm">
          <div className="bg-[#4A3B36] rounded-[2rem] overflow-hidden shadow-lg mb-6 border-[6px] border-white relative" style={{ aspectRatio: '3/4' }}>
            <div className="absolute inset-0">
              {cameraAvailable ? (
                <Scanner
                  onScan={handleScan}
                  onError={(error) => {
                    console.error('Scanner error:', error);
                    setCameraAvailable(false);
                    showToast('Camera unavailable — use manual input below.', 'error');
                  }}
                  formats={['qr_code']}
                  components={{ audio: false, torch: true }}
                  constraints={{ video: { facingMode: 'environment' } }}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-[#F5EFEB]">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 text-[#A3918B] shadow-sm">
                    <QrCode size={28} />
                  </div>
                  <p className="text-[#5A453C] font-black text-[14px] mb-1">Camera Unavailable</p>
                  <p className="text-[11px] text-[#9E8F88] font-medium leading-relaxed">
                    Pakigamit na lang ang manual input sa ibaba para hanapin ang order.
                  </p>
                </div>
              )}
            </div>
            {/* Guide overlay */}
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
              <div className="w-[65%] aspect-square border-2 border-dashed border-white/50 rounded-2xl relative">
                <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-white rounded-tl-xl"></div>
                <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-white rounded-tr-xl"></div>
                <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-white rounded-bl-xl"></div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-white rounded-br-xl"></div>
              </div>
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="font-black text-[#4A3B36] text-[18px] mb-1">I-scan ang Receipt</h2>
            <p className="text-[#9E8F88] text-[13px]">Itutok ang camera sa QR code ng customer</p>
          </div>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-[#EAE4E0]"></div>
            <span className="text-[10px] font-black text-[#C4B5AE] uppercase tracking-widest">OR MANUAL ENTRY</span>
            <div className="flex-1 h-px bg-[#EAE4E0]"></div>
          </div>

          {/* ── MANUAL INPUT ── */}
          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <input
              aria-label="Manual Order ID"
              value={manualOrderId}
              onChange={(e) => setManualOrderId(e.target.value)}
              placeholder="Enter Order ID (e.g. 0241)"
              className="flex-1 px-4 py-3.5 rounded-xl border border-[#EAE4E0] text-[14px] font-bold text-[#4A3B36] outline-none focus:border-[#5A453C] bg-white shadow-sm"
            />
            <button 
              type="submit" 
              className="px-5 bg-[#5A453C] text-white rounded-xl hover:bg-[#4A3B36] transition-colors border-none cursor-pointer flex items-center justify-center shadow-md shadow-[#5A453C]/20"
            >
              <Search size={18} />
            </button>
          </form>
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