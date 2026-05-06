import { useState } from 'react';
import { ArrowLeft, QrCode, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Scanner } from '@yudiel/react-qr-scanner';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../components/ui';
import { Button, Modal } from '../../components/ui';

// ─── SCAN RESULT MODAL ────────────────────────────────────────
function ScanResultModal({ order, isOpen, onClose, onStatusChange }) {
  if (!order) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md"
      title={
        <div className="flex items-center gap-3">
          <span className="font-black text-brand-950 text-lg">✓ Order Found</span>
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
          <div className="space-y-2">
            <Button
              variant="primary"
              className="w-full bg-green-600 text-white font-black hover:bg-green-700 flex items-center justify-center gap-2 py-3 rounded-lg"
              onClick={() => { onStatusChange(order.id, 'Completed'); onClose(); }}
            >
              ✓ Mark as Completed
            </Button>

            {order.status === 'Confirmed' && (
              <Button
                variant="secondary"
                className="w-full bg-blue-100 text-blue-900 font-black hover:bg-blue-200 py-2 rounded-lg border-2 border-blue-200"
                onClick={() => { onStatusChange(order.id, 'Ready'); onClose(); }}
              >
                Mark as Ready
              </Button>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}

// ─── PIN VERIFICATION MODAL ─────────────────────────────────────
function PINVerificationModal({ isOpen, onClose, onSuccess }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const CORRECT_PIN = '1234'; // Change this to your preferred PIN

  const handleVerify = () => {
    if (pin === CORRECT_PIN) {
      setError('');
      setPin('');
      onSuccess();
    } else {
      setError('Incorrect PIN');
      setPin('');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" title="Admin PIN Required">
      <div className="space-y-4 p-4">
        <div className="flex items-center justify-center gap-2 text-amber-700 bg-amber-50 p-3 rounded-lg border-2 border-amber-200">
          <Lock size={16} />
          <span className="font-bold text-sm">Enter PIN to access scanner</span>
        </div>

        <input
          type="password"
          maxLength="4"
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
          placeholder="Enter 4-digit PIN"
          className="w-full border-2 border-brand-200 rounded-lg px-4 py-3 text-center text-2xl font-black tracking-widest focus:outline-none focus:border-brand-950"
          onKeyPress={(e) => e.key === 'Enter' && handleVerify()}
        />

        {error && <p className="text-red-600 font-bold text-sm text-center">{error}</p>}

        <Button
          variant="primary"
          className="w-full bg-brand-950 text-white font-black"
          onClick={handleVerify}
          disabled={pin.length !== 4}
        >
          Verify
        </Button>
      </div>
    </Modal>
  );
}

// ─── MAIN MOBILE QR SCANNER PAGE ─────────────────────────────────
export default function MobileQRScanner() {
  const navigate = useNavigate();
  const { orders, updateOrderStatus } = useApp();
  const { show: showToast } = useToast();

  const [isPinVerified, setIsPinVerified] = useState(false);
  const [showPinModal, setShowPinModal] = useState(true);
  const [scanResultOrder, setScanResultOrder] = useState(null);
  const [scanResultOpen, setScanResultOpen] = useState(false);

  const handleStatusChange = (id, status) => {
    updateOrderStatus(id, status);
    showToast(`Order status updated to ${status}.`);
  };

  // QR SCAN HANDLER
  const handleScan = (detectedCodes) => {
    if (detectedCodes && detectedCodes.length > 0) {
      const rawData = detectedCodes[0].rawValue;
      processOrderSearch(rawData);
    }
  };

  // Process order search
  const processOrderSearch = (scannedId) => {
    const cleanId = scannedId.replace('#', '').trim().toUpperCase();
    const foundOrder = orders.find(o => o.id.replace('#', '').toUpperCase() === cleanId);
    
    if (foundOrder) {
      setScanResultOrder(foundOrder);
      setScanResultOpen(true);
      showToast(`Order ${cleanId} found!`, 'success');
    } else {
      const demoOrders = orders.filter(o => o.status === 'Confirmed' || o.status === 'Ready');
      if (demoOrders.length > 0) {
        const randomDemo = demoOrders[Math.floor(Math.random() * demoOrders.length)];
        setScanResultOrder(randomDemo);
        setScanResultOpen(true);
        showToast(`Demo: Showing ${randomDemo.id}`, 'success');
      }
    }
  };

  return (
    <div className="bg-brand-950 min-h-screen flex flex-col">
      {/* Header */}
      <div className="bg-brand-900 text-white p-4 flex items-center gap-3 shadow-lg">
        <button
          onClick={() => navigate('/orders')}
          className="p-2 hover:bg-brand-800 rounded-lg transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-xl font-black">Mobile QR Scanner</h1>
          <p className="text-xs text-brand-200 font-bold tracking-widest">Admin Only</p>
        </div>
      </div>

      {/* Scanner Container */}
      {isPinVerified && (
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
              <p className="text-xs text-white/70 mt-1">Automatic detection when order is found</p>
            </div>
          </div>
        </div>
      )}

      {/* PIN Verification Modal */}
      <PINVerificationModal
        isOpen={showPinModal && !isPinVerified}
        onClose={() => navigate('/orders')}
        onSuccess={() => {
          setShowPinModal(false);
          setIsPinVerified(true);
        }}
      />

      {/* Scan Result Modal */}
      <ScanResultModal
        order={scanResultOrder}
        isOpen={scanResultOpen}
        onClose={() => setScanResultOpen(false)}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
