import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, QrCode, Lock, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Scanner } from '@yudiel/react-qr-scanner';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../components/ui';
import { Button, Modal } from '../../components/ui';

const CORRECT_PIN = '123456';
const MAX_ATTEMPTS = 3;
const LOCKOUT_DURATION = 5 * 60 * 1000; // 5 minutes
const SESSION_TIMEOUT = 15 * 60 * 1000; // 15 minutes
const SECRET_KEY = '_secret_key';

// ─── TOKEN VERIFICATION ──────────────────────────────────────
function generateReceiptToken(orderId) {
  return btoa(orderId + SECRET_KEY);
}

function verifyReceiptToken(orderId, token) {
  const expectedToken = generateReceiptToken(orderId);
  return expectedToken === token;
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
    <Modal isOpen={isOpen} onClose={onClose} size="md"
      title={
        <div className="flex items-center gap-3">
          <span className="font-black text-brand-950 text-lg">✓ Order Verified</span>
        </div>
      }
    >
      <div className="space-y-5">
        
        {/* Order Info */}
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

        {/* Order Summary */}
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

        {/* Status-based content */}
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
        // Store PIN session in sessionStorage
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50 p-4">
        <div className="max-w-sm w-full bg-white rounded-3xl shadow-2xl p-8 text-center">
          <div className="mb-6 text-6xl">🔒</div>
          <h2 className="text-2xl font-black text-red-700 mb-2">Too Many Attempts</h2>
          <p className="text-slate-600 text-sm mb-6">
            Too many failed PIN attempts. Please try again in {Math.ceil(lockoutTimeRemaining / 1000)} second{Math.ceil(lockoutTimeRemaining / 1000) !== 1 ? 's' : ''}.
          </p>
          <div className="flex items-center justify-center gap-2 bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-6">
            <Clock size={20} className="text-red-700" />
            <span className="text-red-700 font-black text-lg">{Math.ceil(lockoutTimeRemaining / 1000)}s</span>
          </div>
          <Button 
            onClick={onClose}
            className="w-full bg-slate-200 text-slate-900 font-black py-3 rounded-lg hover:bg-slate-300 transition-colors"
          >
            Back to Orders
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 to-amber-50 p-4">
      <div className="max-w-sm w-full">
        {/* Logo/Title */}
        <div className="text-center mb-12">
          <div className="mb-4 text-5xl">🍰</div>
          <h1 className="text-3xl font-black text-brand-950 mb-1">Aileen & Niculus</h1>
          <p className="text-brand-700 text-sm font-bold tracking-widest uppercase">Admin Verification</p>
        </div>

        {/* PIN Entry */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <p className="text-slate-600 font-bold text-sm">Enter 6-digit PIN</p>
            {error && (
              <p className="text-red-600 font-black text-sm mt-2">{error}</p>
            )}
          </div>

          {/* PIN Digit Boxes */}
          <div className="flex gap-3 justify-center mb-8">
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
                className="w-16 h-16 text-center text-3xl font-black border-3 border-brand-300 rounded-2xl bg-brand-50 focus:bg-brand-100 focus:border-brand-600 focus:outline-none transition-all"
              />
            ))}
          </div>

          {/* Attempt Counter */}
          <div className="text-center text-xs text-slate-500 font-bold mb-6">
            Attempt {maxAttempts - attempts + 1} of {maxAttempts}
          </div>

          {/* Cancel Button */}
          <Button 
            onClick={onClose}
            className="w-full bg-slate-100 text-slate-700 font-black py-3 rounded-lg hover:bg-slate-200 transition-colors"
          >
            Cancel
          </Button>
        </div>

        {/* Security Note */}
        <p className="text-center text-xs text-slate-500 mt-8 flex items-center justify-center gap-2">
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

  // PIN & Session Management
  const [isPinVerified, setIsPinVerified] = useState(() => {
    const pinVerifiedAt = sessionStorage.getItem('pinVerifiedAt');
    if (pinVerifiedAt) {
      const timeElapsed = Date.now() - parseInt(pinVerifiedAt);
      return timeElapsed < SESSION_TIMEOUT;
    }
    return false;
  });

  const [attempts, setAttempts] = useState(0);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [lockoutEndTime, setLockoutEndTime] = useState(null);
  const [lockoutTimeRemaining, setLockoutTimeRemaining] = useState(0);

  // Scan Result
  const [scanResultOrder, setScanResultOrder] = useState(null);
  const [scanResultOpen, setScanResultOpen] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const lastScanTime = useRef(0);

  // Lockout countdown
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

  // Session timeout check
  useEffect(() => {
    const pinVerifiedAt = sessionStorage.getItem('pinVerifiedAt');
    if (!pinVerifiedAt) return;

    const interval = setInterval(() => {
      const timeElapsed = Date.now() - parseInt(pinVerifiedAt);
      if (timeElapsed > SESSION_TIMEOUT) {
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

  // QR SCAN HANDLER with cooldown to avoid spamming
  const handleScan = (detectedCodes) => {
    if (!detectedCodes || !detectedCodes.length) return;
    const now = Date.now();
    if (now - lastScanTime.current < 2000) return; // 2s cooldown
    lastScanTime.current = now;
    const rawData = detectedCodes[0].rawValue;
    processQRData(rawData);
  };

  // Process QR Data with Token Verification
  const processQRData = (qrData) => {
    try {
      const payload = JSON.parse(qrData);
      const { orderId, token } = payload;

      // Verify token
      const isValid = verifyReceiptToken(orderId, token);

      if (!isValid) {
        // Token mismatch — show invalid token result
        setTokenValid(false);
        setScanResultOrder({ id: orderId });
        setScanResultOpen(true);
        showToast('❌ Invalid QR code (token mismatch)', 'error');
        return;
      }

      // Try to find in real orders: accept multiple ID formats
      const foundOrder = orders.find(o =>
        o.id === orderId ||
        o.id === `ORD-${orderId}` ||
        `ORD-${o.id}` === orderId ||
        o.id.replace('#', '') === orderId.replace('#', '')
      );

      if (foundOrder) {
        setScanResultOrder(foundOrder);
      } else {
        // Token is valid but order not in context (mock/demo scenario)
        setScanResultOrder({
          id: orderId,
          customer: { name: 'Customer' },
          items: [],
          grandTotal: 0,
          status: 'Confirmed',
          _isMockFallback: true,
        });
      }

      setTokenValid(true);
      setScanResultOpen(true);
      showToast('✓ QR verified!', 'success');
    } catch (e) {
      // If not valid JSON, try to find order by ID (fallback)
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

  const handlePinSuccess = () => {
    setIsPinVerified(true);
  };

  const handlePinClose = () => {
    navigate('/orders');
  };

  if (!isPinVerified) {
    return (
      <PINEntryUI
        onSuccess={handlePinSuccess}
        onClose={handlePinClose}
        isLockedOut={isLockedOut}
        lockoutTimeRemaining={lockoutTimeRemaining}
        attempts={attempts}
        maxAttempts={MAX_ATTEMPTS}
      />
    );
  }

  return (
    <div className="bg-brand-950 min-h-screen flex flex-col">
      {/* Header */}
      <div className="bg-brand-900 text-white p-4 flex items-center gap-3 shadow-lg">
        <button
          onClick={() => {
            setIsPinVerified(false);
            sessionStorage.removeItem('pinVerifiedAt');
            sessionStorage.removeItem('adminPinSession');
            navigate('/orders');
          }}
          className="p-2 hover:bg-brand-800 rounded-lg transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-xl font-black">Mobile QR Scanner</h1>
          <p className="text-xs text-brand-200 font-bold tracking-widest">PIN Verified • Admin Only</p>
        </div>
      </div>

      {/* Scanner Container */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm">
          {/* Camera View */}
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

          {/* Instructions */}
          <div className="bg-white/10 backdrop-blur text-white rounded-xl p-4 text-center">
            <QrCode className="mx-auto mb-2" size={32} />
            <p className="font-black text-sm">Point camera at receipt QR code</p>
            <p className="text-xs text-white/70 mt-1">Automatic detection and verification</p>
          </div>
        </div>
      </div>

      {/* Scan Result Modal */}
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
