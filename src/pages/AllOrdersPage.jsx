import { useState } from 'react';
import { Download, X, Phone, Facebook, Calendar, Clock, Image as ImageIcon, ReceiptText } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/ui';
import { Badge, Button, Modal, Table, Tr, Td, Pagination, SearchBar, FilterPills } from '../components/ui';
import { ORDER_STATUSES } from '../data/dummyData';

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
      <div>
        <p className="text-amber-800 font-black text-sm">Deposit {fmt(order.amountPaid)}</p>
        <p className="text-xs text-brand-700 font-bold">Balance {fmt(order.balance)}</p>
      </div>
    );
  }
  return <p className="text-green-800 font-black text-sm">Fully Paid<br /><span className="text-xs text-brand-700 font-bold">{fmt(order.grandTotal)}</span></p>;
}

// ─── ORDER DETAIL MODAL ───────────────────────────────────────
function OrderDetailModal({ order, isOpen, onClose, onStatusChange }) {
  if (!order) return null;

  const nextStatus = {
    Confirmed: 'Ready',
    Ready:     'Completed',
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      // Inilipat ang ID at Status Badge sa header bar[cite: 13, 16]
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
        
        {/* KALIWA: Customer Details (Cream color block)[cite: 17] */}
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
            {order.customer.facebook && (
              <div className="flex items-center gap-3 text-brand-900">
                <div className="bg-white p-1.5 rounded-lg border border-brand-200 shadow-sm"><Facebook size={14} className="text-brand-700" /></div>
                <span className="font-bold">{order.customer.facebook}</span>
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

        {/* GITNA: Order Summary (Grey/Slate color block)[cite: 17] */}
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

            {/* Totals area with High Contrast[cite: 17] */}
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

          {/* Payment area (Yellow/Amber block)[cite: 17] */}
          <div className="mt-4 bg-amber-50 border-2 border-amber-200 rounded-xl p-4 flex items-center justify-between">
            <span className="text-amber-900 font-black text-[10px] uppercase tracking-widest">Payment Status</span>
            <span className={`font-black px-3 py-1 rounded-lg text-xs border-2 ${order.paymentType === 'deposit' ? 'bg-amber-200 text-amber-950 border-amber-300' : 'bg-green-100 text-green-950 border-green-300'}`}>
              {order.paymentType === 'deposit' ? `Deposit ${fmt(order.amountPaid)}` : 'Fully Paid'}
            </span>
          </div>
        </div>

        {/* KANAN: Reference & Instructions[cite: 17] */}
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

      {/* Footer buttons hierarchy[cite: 15] */}
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

// ─── MAIN ORDERS PAGE ─────────────────────────────────────────
const PER_PAGE = 8;

export default function AllOrdersPage() {
  const { orders, updateOrderStatus } = useApp();
  const { show: showToast } = useToast();
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch]             = useState('');
  const [page, setPage]                 = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailOpen, setDetailOpen]     = useState(false);

  // Search at Filter logic
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
      {/* Search and Filters area */}
      <div className="flex items-center gap-4 flex-wrap">
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

      {/* Main Table with high contrast rows[cite: 17] */}
      <div className="bg-white rounded-xl border-2 border-brand-100 shadow-md overflow-hidden">
        <Table columns={columns}>
          {paged.map(order => (
            <Tr key={order.id} className="hover:bg-brand-50 transition-colors border-b border-brand-100">
              <Td className="text-[13px] font-black text-brand-950">#{order.id}</Td>
              <Td>
                <p className="font-black text-brand-950 text-[14.5px]">{order.customer?.name || 'Walk-in'}</p>
                {order.customer?.phone && <p className="text-xs text-brand-700 font-bold">{order.customer.phone}</p>}
              </Td>
              <Td><Badge variant={typeVariant(order.type)} className="font-black border-2 border-brand-100">{order.type}</Badge></Td>
              <Td className="font-black text-brand-950 text-[14.5px]">{fmt(order.grandTotal)}</Td>
              <Td>{paymentDisplay(order)}</Td>
              <Td className="text-xs text-brand-800 font-black">{order.pickupDate ? `${order.pickupDate} — ${order.pickupTime}` : '—'}</Td>
              <Td><Badge variant={statusVariant(order.status)} className="font-black border-2 border-brand-100 shadow-sm">{order.status}</Badge></Td>
              <Td align="center">
                <Button
                  size="sm"
                  variant="secondary"
                  className="font-black border-2 border-brand-300 text-brand-950 hover:bg-brand-100 shadow-sm"
                  onClick={() => { setSelectedOrder(order); setDetailOpen(true); }}
                >
                  View Details
                </Button>
              </Td>
            </Tr>
          ))}
          {!paged.length && (
            <Tr>
              <Td className="text-center text-brand-700 font-black py-16 text-sm" colSpan={8}>No orders found based on your search.</Td>
            </Tr>
          )}
        </Table>
        <Pagination
          page={page}
          count={filtered.length}
          perPage={PER_PAGE}
          total="Orders"
          onChange={setPage}
        />
      </div>

      {/* MODAL PARA SA ORDER DETAILS */}
      <OrderDetailModal
        order={selectedOrder}
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}