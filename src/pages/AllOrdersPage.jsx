import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, X, Phone, Facebook, Calendar, Clock, Image as ImageIcon, ReceiptText, QrCode, Search, Smartphone } from 'lucide-react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/ui';
import { Badge, Button, Modal, Table, Tr, Td, Pagination, SearchBar, FilterPills, Input } from '../components/ui';
import { ORDER_STATUSES } from '../data/dummyData';

// Token verification helpers
const SECRET_KEY = '_secret_key';

function generateReceiptToken(orderId) {
  return btoa(orderId + SECRET_KEY);
}

function verifyReceiptToken(orderId, token) {
  const expectedToken = generateReceiptToken(orderId);
  return expectedToken === token;
}

// Format para sa pera
function fmt(n) {
  return '₱' + Number(n).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function statusVariant(s) {
  const map = { Confirmed: 'confirmed', Ready: 'ready', Completed: 'completed', Cancelled: 'cancelled' };
  return map[s] || 'default';
}

function typeVariant(t) {
  return t === 'Pre-Order' ? 'preorder' : 'buynow';
}

// Display para sa payment status sa main table
function paymentDisplay(order) {
  if (order.paymentType === 'deposit') {
    return (
      <div className="flex flex-col gap-0.5">
        <p className="text-amber-700 font-semibold text-[13.5px]">Deposit {fmt(order.amountPaid)}</p>
        <p className="text-xs text-slate-500 font-medium">Balance {fmt(order.balance)}</p>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-emerald-700 font-semibold text-[13.5px]">Fully Paid</p>
      <p className="text-xs text-slate-500 font-medium">{fmt(order.grandTotal)}</p>
    </div>
  );
} 

// ─── ORDER DETAIL MODAL ───────────────────────────────────────
function OrderDetailModal({ order, isOpen, onClose, onStatusChange }) {
  if (!order) return null;

  const nextStatus = { Confirmed: 'Ready', Ready: 'Completed' };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl"
      title={
        <div className="flex items-center gap-3">
          <span className="font-black text-brand-950 text-xl">Order #{order.id}</span>
          <Badge variant={statusVariant(order.status)} className="px-3 py-1 text-[11px] uppercase font-black tracking-widest border-2 border-brand-200">
            {order.status}
          </Badge>
        </div>
      }
    >
      <div className="grid grid-cols-12 gap-6">
        {/* KALIWA: Customer Details */}
        <div className="col-span-4 bg-[#fdf8f6] rounded-2xl p-6 border-2 border-brand-100 flex flex-col h-full">
          <p className="text-[11px] font-black uppercase tracking-widest text-brand-600 mb-5">Customer Details</p>
          <h3 className="text-2xl font-black text-brand-950 mb-6 leading-tight">{order.customer.name || 'Walk-in'}</h3>
          
          <div className="space-y-4 mb-8 text-[14px]">
            {order.customer.phone && (
              <div className="flex items-center gap-3 text-brand-900">
                <div className="bg-white p-1.5 rounded-lg border border-brand-200 shadow-sm"><Phone size={14} className="text-brand-700" /></div>
                <span className="font-bold">{order.customer.phone}</span>
              </div>
            )}
          </div>

          <div className="mt-auto pt-6 border-t-2 border-brand-100">
            <p className="text-[11px] font-black uppercase tracking-widest text-brand-600 mb-2">Pick-up Schedule</p>
            <p className="text-[15px] font-black text-brand-950 flex items-center gap-2">
              <Calendar size={16} className="text-brand-700" />
              {order.pickupDate} {order.pickupTime && <span className="text-brand-700 ml-1">— {order.pickupTime}</span>}
            </p>
          </div>
        </div>

        {/* GITNA: Order Summary */}
        <div className="col-span-4 flex flex-col h-full">
          <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl overflow-hidden flex flex-col flex-1">
            <div className="px-5 py-3 border-b-2 border-slate-200 bg-white flex items-center gap-2">
              <ReceiptText size={14} className="text-slate-600" />
              <p className="text-[11px] font-black uppercase tracking-widest text-slate-700">Order Summary</p>
            </div>
            
            <div className="p-4 overflow-y-auto flex-1">
              <table className="w-full text-sm">
                <tbody className="divide-y divide-slate-200">
                  {order.items?.map((item, i) => (
                    <tr key={i}>
                      <td className="py-3 text-brand-950 font-bold pr-2">{item.name} <span className="text-slate-500 font-black ml-1 text-xs">x{item.qty}</span></td>
                      <td className="py-3 text-right font-black text-brand-950">{fmt(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-white border-t-2 border-slate-200 p-5 space-y-3">
              <div className="flex justify-between text-[13px] text-brand-800 font-bold">
                <span>Subtotal</span>
                <span>{fmt(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-2xl font-black text-brand-950 pt-2 border-t-2 border-slate-100">
                <span>Grand Total</span>
                <span className="text-green-900">{fmt(order.grandTotal)}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 bg-amber-50 border-2 border-amber-200 rounded-xl p-4 flex items-center justify-between">
            <span className="text-amber-900 font-black text-[10px] uppercase tracking-widest">Payment Status</span>
            <span className={`font-black px-3 py-1 rounded-lg text-xs border-2 ${order.paymentType === 'deposit' ? 'bg-amber-200 text-amber-950 border-amber-300' : 'bg-green-100 text-green-950 border-green-300'}`}>
              {order.paymentType === 'deposit' ? `Deposit ${fmt(order.amountPaid)}` : 'Fully Paid'}
            </span>
          </div>
        </div>

        {/* KANAN: Reference & Instructions */}
        <div className="col-span-4 space-y-5 flex flex-col h-full">
          <div>
            <div className="flex items-center justify-between mb-3 px-1">
              <p className="text-[11px] font-black uppercase tracking-widest text-brand-700">Customer Reference</p>
              {order.customerReference && (
                <button className="flex items-center gap-1 text-[10px] font-black text-brand-900 bg-white px-2 py-1 rounded-md border-2 border-brand-200 shadow-sm hover:bg-brand-50 transition-colors">
                  <Download size={11} /> Save Image
                </button>
              )}
            </div>
            
            <div className="rounded-2xl overflow-hidden bg-brand-100 border-2 border-brand-200 aspect-video flex items-center justify-center relative shadow-inner">
              {order.customerReference ? (
                <img src={order.customerReference} alt="reference" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-1 text-brand-400 opacity-60">
                  <ImageIcon size={32} strokeWidth={2} />
                  <span className="text-[10px] font-black tracking-widest uppercase">No Reference Image</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col min-h-0">
            <p className="text-[11px] font-black uppercase tracking-widest text-brand-700 mb-2 px-1">Special Instructions</p>
            <div className="bg-[#fdf8f6] rounded-2xl p-5 text-[14px] text-brand-950 font-bold leading-relaxed border-2 border-brand-200 shadow-inner flex-1 overflow-y-auto italic">
              {order.specialInstructions || "No special instructions provided by the customer."}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 mt-10 pt-6 border-t-2 border-brand-200">
        <Button variant="secondary" onClick={onClose} className="px-8 border-2 border-brand-300 text-brand-950 font-black">Close</Button>
        {order.status === 'Confirmed' && (
          <Button variant="danger" onClick={() => { onStatusChange(order.id, 'Cancelled'); onClose(); }} className="px-8 bg-red-100 text-red-900 border-2 border-red-200 font-black hover:bg-red-200">
            Cancel Order
          </Button>
        )}
        {nextStatus[order.status] && (
          <Button
            variant="primary"
            className="px-10 bg-brand-950 text-white shadow-xl shadow-brand-200 font-black hover:bg-black transition-all"
            onClick={() => { onStatusChange(order.id, nextStatus[order.status]); onClose(); }}
          >
            Mark as {nextStatus[order.status]}
          </Button>
        )}
      </div>
    </Modal>
  );
}

// ─── SCAN RESULT MODAL ────────────────────────────────────────
function ScanResultModal({ order, isOpen, onClose, onStatusChange, onViewDetails, tokenValid }) {
  if (!order) return null;

  function fmt(n) {
    return '₱' + Number(n).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  // Show invalid token error
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
          <span className="font-black text-brand-950 text-lg">Scan Result</span>
          <Badge variant={order.status === 'Confirmed' ? 'confirmed' : order.status === 'Ready' ? 'ready' : order.status === 'Completed' ? 'completed' : 'cancelled'} className="px-3 py-1 text-[11px] uppercase font-black tracking-widest border-2 border-brand-200">
            {order.status}
          </Badge>
        </div>
      }
    >
      <div className="space-y-5">
        
        {/* Order Info */}
        <div className="bg-[#fdf8f6] rounded-xl p-4 border-2 border-brand-100">
          <p className="text-[10px] font-black uppercase tracking-widest text-brand-600 mb-2">Order Details</p>
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

        {/* View Full Details Link */}
        <Button
          variant="secondary"
          className="w-full border-2 border-brand-200 text-brand-900 font-bold py-2 rounded-lg hover:bg-brand-50"
          onClick={onViewDetails}
        >
          View Full Details
        </Button>
      </div>
    </Modal>
  );
}

// ─── MAIN ORDERS PAGE ─────────────────────────────────────────
const PER_PAGE = 8;

export default function AllOrdersPage() {
  const navigate = useNavigate();
  const { orders, updateOrderStatus } = useApp();
  const { show: showToast } = useToast();
  
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch]             = useState('');
  const [page, setPage]                 = useState(1);
  
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailOpen, setDetailOpen]       = useState(false);
  
  // State para sa ScanResultModal
  const [scanResultOpen, setScanResultOpen]   = useState(false);
  const [scanResultOrder, setScanResultOrder] = useState(null);
  const [tokenValid, setTokenValid] = useState(false);
  
  // State para sa QR Scanner Modal
  const [scannerOpen, setScannerOpen]     = useState(false);
  const [manualOrderId, setManualOrderId] = useState('');

  const filtered = orders.filter(o => {
    const statusOk = statusFilter === 'All' || o.status === statusFilter;
    const searchOk = !search || o.customer?.name?.toLowerCase().includes(search.toLowerCase()) || o.id.toLowerCase().includes(search.toLowerCase());
    return statusOk && searchOk;
  });

  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleStatusChange = (id, status) => {
    updateOrderStatus(id, status);
    showToast(`Order status updated to ${status}.`);
  };

  // ─── CENTRALIZED SEARCH LOGIC (Ginagamit ng QR at Manual Input) ───
  const processOrderSearch = (scannedId) => {
    try {
      // Try to parse as JSON (new QR format with token)
      const payload = JSON.parse(scannedId);
      const { orderId, token } = payload;

      // Verify token
      const isValid = verifyReceiptToken(orderId, token);

      // Find order
      const foundOrder = orders.find(o => o.id === orderId);

      if (foundOrder && isValid) {
        setScannerOpen(false);
        setManualOrderId('');
        setScanResultOrder(foundOrder);
        setTokenValid(true);
        setScanResultOpen(true);
        showToast('✓ QR verified successfully!', 'success');
      } else if (!isValid) {
        showToast('❌ Invalid QR code (token mismatch)', 'error');
        setTokenValid(false);
        setScanResultOrder(null);
        setScanResultOpen(true);
      } else {
        showToast('❌ Order not found', 'error');
      }
    } catch (e) {
      // Not JSON, try treating as plain order ID
      const cleanId = scannedId.replace('#', '').trim().toUpperCase();
      const foundOrder = orders.find(o => o.id.replace('#', '').toUpperCase() === cleanId);
      
      if (foundOrder) {
        setScannerOpen(false);
        setManualOrderId('');
        setScanResultOrder(foundOrder);
        setTokenValid(true); // Accept plain ID as valid (fallback)
        setScanResultOpen(true);
        showToast(`Order ${cleanId} found!`, 'success');
      } else {
        // DEMO MODE: If not found, show a demo order for testing
        const demoOrders = orders.filter(o => o.status === 'Confirmed' || o.status === 'Ready');
        if (demoOrders.length > 0) {
          const randomDemo = demoOrders[Math.floor(Math.random() * demoOrders.length)];
          setScannerOpen(false);
          setManualOrderId('');
          setScanResultOrder(randomDemo);
          setTokenValid(true);
          setScanResultOpen(true);
          showToast(`Demo mode: Showing ${randomDemo.id}`, 'success');
        } else {
          showToast(`Order ${cleanId} not found in the system.`, 'error');
        }
      }
    }
  };

  // QR SCAN HANDLER
  const handleScan = (detectedCodes) => {
    if (detectedCodes && detectedCodes.length > 0) {
      const rawData = detectedCodes[0].rawValue;
      // DEMO MODE: Accept any QR code and use it to lookup orders
      // In production, you'd check for 'CAKELYTICS-SECURE:' format
      processOrderSearch(rawData);
    }
  };

  // MANUAL INPUT HANDLER
  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualOrderId) return;
    processOrderSearch(manualOrderId);
  };

  const columns = [
    { label: 'Order ID' },
    { label: 'Customer' },
    { label: 'Type' },
    { label: 'Amount' },
    { label: 'Payment' },
    { label: 'Pick-up / Date' },
    { label: 'Status' },
    { label: 'Action', align: 'center' },
  ];

  return (
    <div className="space-y-5">
      
      {/* ─── Search and Filters area ─── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <SearchBar 
            value={search} 
            onChange={v => { setSearch(v); setPage(1); }} 
            placeholder="Search order ID or customer..." 
            className="w-72 border-2 border-brand-200" 
          />
          <FilterPills
            options={ORDER_STATUSES}
            value={statusFilter}
            onChange={v => { setStatusFilter(v); setPage(1); }}
          />
        </div>
        
        {/* QR Scanner Button */}
        <div className="flex items-center gap-3">
          <Button 
            variant="primary" 
            className="bg-brand-900 text-white font-bold shadow-md flex items-center gap-2"
            onClick={() => { setScannerOpen(true); setManualOrderId(''); }}
          >
            <QrCode size={18} /> Scan Receipt QR
          </Button>
          <Button 
            variant="secondary" 
            className="border-2 border-blue-300 bg-blue-50 text-blue-900 font-bold hover:bg-blue-100 flex items-center gap-2"
            onClick={() => navigate('/admin/mobile-scanner')}
          >
            <Smartphone size={18} /> Mobile Scanner
          </Button>
        </div>
      </div>

      {/* ─── Main Table ─── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <Table columns={columns}>
          {paged.map(order => (
            <Tr key={order.id} className="hover:bg-slate-50 transition-colors border-b border-slate-100">
              <Td className="text-[12px] font-medium text-slate-500">#{order.id}</Td>
              <Td>
                <div className="flex flex-col gap-0.5">
                  <p className="font-semibold text-slate-900 text-[14px]">{order.customer?.name || 'Walk-in'}</p>
                  {order.customer?.phone && <p className="text-[12px] text-slate-500">{order.customer.phone}</p>}
                </div>
              </Td>
              <Td><Badge variant={typeVariant(order.type)} className="font-medium px-2 py-0.5 text-xs">{order.type}</Badge></Td>
              <Td className="font-semibold text-slate-900 text-[14px]">{fmt(order.grandTotal)}</Td>
              <Td>{paymentDisplay(order)}</Td>
              <Td className="text-[13px] text-slate-700 font-medium">
                {order.pickupDate ? `${order.pickupDate} — ${order.pickupTime}` : '—'}
              </Td>
              <Td><Badge variant={statusVariant(order.status)} className="font-medium px-2 py-0.5 text-xs shadow-none">{order.status}</Badge></Td>
              <Td align="center">
                <Button
                  size="sm"
                  variant="secondary"
                  className="font-medium border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs px-3 py-1.5"
                  onClick={() => { setSelectedOrder(order); setDetailOpen(true); }}
                >
                  View Details
                </Button>
              </Td>
            </Tr>
          ))}
          {!paged.length && (
            <Tr>
              <Td className="text-center text-slate-500 font-medium py-16 text-sm" colSpan={8}>
                No orders found based on your search.
              </Td>
            </Tr>
          )}
        </Table>
        <Pagination page={page} count={filtered.length} perPage={PER_PAGE} total="Orders" onChange={setPage} />
      </div>

      <OrderDetailModal
        order={selectedOrder}
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
        onStatusChange={handleStatusChange}
      />

      <ScanResultModal
        order={scanResultOrder}
        isOpen={scanResultOpen}
        onClose={() => setScanResultOpen(false)}
        onStatusChange={handleStatusChange}
        onViewDetails={() => { setScanResultOpen(false); setSelectedOrder(scanResultOrder); setDetailOpen(true); }}
        tokenValid={tokenValid}
      />

      {/* ─── MODAL PARA SA QR SCANNER & MANUAL ENTRY ─── */}
      <Modal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        size="md"
        title="Find Customer Order"
        subtitle="I-scan ang QR Code ng customer o i-type ang Order ID kung malabo ang camera."
      >
        <div className="flex flex-col gap-6 p-2">
          
          {/* CAMERA SCANNER AREA (Tinanngal ang overlay frame para mabilis mag-scan) */}
          <div className="w-full bg-black rounded-xl overflow-hidden shadow-inner flex items-center justify-center relative min-h-[300px]">
            {scannerOpen && (
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
            )}
            <div className="absolute top-2 right-2 bg-black/50 text-white/80 px-2 py-1 rounded text-[10px] font-bold tracking-widest uppercase">
              Camera Active
            </div>
          </div>

          <div className="flex items-center gap-4">
            <hr className="flex-1 border-brand-200" />
            <span className="text-xs font-bold text-brand-400 uppercase tracking-widest">OR ENTER MANUALLY</span>
            <hr className="flex-1 border-brand-200" />
          </div>

          {/* MANUAL ENTRY FORM */}
          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <div className="flex-1">
              <Input 
                value={manualOrderId}
                onChange={(e) => setManualOrderId(e.target.value)}
                placeholder="e.g. ORD-0240"
                className="w-full"
              />
            </div>
            <Button type="submit" variant="primary" className="bg-brand-900 text-white shrink-0 px-6">
              <Search size={16} />
            </Button>
          </form>

          {/* DEMO BUTTON FOR TESTING */}
          <div className="flex items-center gap-4 pt-2">
            <hr className="flex-1 border-brand-200" />
            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">TEST DEMO</span>
            <hr className="flex-1 border-brand-200" />
          </div>
          <Button 
            variant="secondary"
            className="w-full border-2 border-blue-300 bg-blue-50 text-blue-900 font-bold hover:bg-blue-100 py-2 rounded-lg"
            onClick={() => {
              const demoOrders = orders.filter(o => o.status === 'Confirmed' || o.status === 'Ready');
              if (demoOrders.length > 0) {
                const randomDemo = demoOrders[Math.floor(Math.random() * demoOrders.length)];
                setScannerOpen(false);
                setManualOrderId('');
                setScanResultOrder(randomDemo);
                setScanResultOpen(true);
              }
            }}
          >
            Load Random Demo Order
          </Button>
          
        </div>
      </Modal>
      
    </div>
  );
}