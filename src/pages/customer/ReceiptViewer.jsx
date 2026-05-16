import { useParams } from 'react-router-dom';
import QRCode from 'react-qr-code';
import { useApp } from '../../context/AppContext';

function generateReceiptToken(orderId) {
  return btoa(orderId + '_secret_key');
}

export default function ReceiptViewer() {
  const { orderId } = useParams();
  const { orders } = useApp();

  const realOrder = orders.find(o => o.id === orderId || o.id === `ORD-${orderId}`);

  const order = realOrder || {
    id: orderId,
    customer: { name: 'John Doe' },
    items: [
      { name: 'Package B (Party Size)', qty: 1, price: 550, total: 550 },
      { name: 'Special Ensaymada', qty: 2, price: 35, total: 70 }
    ],
    subtotal: 620,
    grandTotal: 620,
    paymentType: 'full',
    status: 'Confirmed',
    pickupDate: new Date().toLocaleDateString(),
    pickupTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  const fmt = (n) => '₱' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const statusColor = {
    Completed: { bg: '#D1FAE5', color: '#065F46' },
    Ready:     { bg: '#DBEAFE', color: '#0C4A6E' },
    Confirmed: { bg: '#FEF3C7', color: '#92400E' },
    Cancelled: { bg: '#FEE2E2', color: '#991B1B' },
  }[order.status] || { bg: '#F3F4F6', color: '#374151' };

  return (
    <div style={{
      backgroundColor: '#FCFAF8',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      fontFamily: '"Playfair Display", serif',
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '16px',
        padding: '20px 20px 16px',
        width: '100%',
        maxWidth: '360px',
        color: '#3D2B27',
        border: '1px solid #E8E0DE',
        boxShadow: '0 4px 16px rgba(0,0,0,0.07)',
      }}>

        {/* Shop name */}
        <div style={{ textAlign: 'center', marginBottom: '12px' }}>
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#3D2B27', lineHeight: 1.2 }}>Aileen Cake Max</div>
          <div style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: '#9B7B74', fontFamily: 'sans-serif', marginTop: '2px' }}>Bake Shop</div>
        </div>

        <div style={{ borderTop: '1px dashed #E0D5D0', margin: '0 0 10px' }} />

        {/* Order info */}
        <div style={{ fontFamily: 'sans-serif', fontSize: '12px', color: '#6B4F48', marginBottom: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Order No</span>
            <span style={{ fontWeight: 700, color: '#3D2B27', fontFamily: 'monospace', fontSize: '13px' }}>{order.id}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Customer</span>
            <span style={{ fontWeight: 700, color: '#3D2B27' }}>{order.customer?.name || 'Walk-in'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Pickup</span>
            <span style={{ fontWeight: 700, color: '#3D2B27' }}>{order.pickupDate} {order.pickupTime}</span>
          </div>
        </div>

        <div style={{ borderTop: '1px dashed #E0D5D0', margin: '0 0 10px' }} />

        {/* Items */}
        <div style={{ fontFamily: 'sans-serif', fontSize: '12px', color: '#3D2B27', marginBottom: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {order.items?.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>{item.name} <span style={{ color: '#9B7B74' }}>x{item.qty}</span></span>
              <span style={{ fontWeight: 700 }}>{fmt(item.total || item.qty * item.price)}</span>
            </div>
          ))}
        </div>

        <div style={{ borderTop: '1px solid #EEE', margin: '0 0 8px' }} />

        {/* Total */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'sans-serif', fontSize: '15px', fontWeight: 800, color: '#3D2B27', marginBottom: '10px' }}>
          <span>TOTAL</span>
          <span>{fmt(order.grandTotal || order.total)}</span>
        </div>

        {/* Status + payment row */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '14px' }}>
          <span style={{
            flex: 1,
            textAlign: 'center',
            padding: '5px 0',
            background: statusColor.bg,
            color: statusColor.color,
            borderRadius: '8px',
            fontSize: '10px',
            fontWeight: 700,
            fontFamily: 'sans-serif',
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
          }}>{order.status || 'Confirmed'}</span>
          <span style={{
            flex: 1,
            textAlign: 'center',
            padding: '5px 0',
            background: '#FEF3C7',
            color: '#92400E',
            borderRadius: '8px',
            fontSize: '10px',
            fontWeight: 700,
            fontFamily: 'sans-serif',
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
          }}>{order.paymentType === 'deposit' ? `Deposit ${fmt(order.amountPaid)}` : 'Fully Paid'}</span>
        </div>

        {/* QR Code — hero section */}
        <div style={{
          background: '#3D2B27',
          borderRadius: '12px',
          padding: '16px',
          textAlign: 'center',
        }}>
          <div style={{
            fontSize: '10px',
            fontFamily: 'sans-serif',
            fontWeight: 700,
            color: '#C4A99F',
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            marginBottom: '12px',
          }}>Scan to Verify Order</div>
          <div style={{
            display: 'inline-block',
            background: '#fff',
            borderRadius: '8px',
            padding: '10px',
          }}>
            <QRCode
              value={JSON.stringify({
                orderId: order.id,
                token: generateReceiptToken(order.id)
              })}
              size={180}
              level="H"
              fgColor="#3D2B27"
              bgColor="#FFFFFF"
            />
          </div>
          <div style={{
            marginTop: '10px',
            fontSize: '11px',
            fontFamily: 'monospace',
            color: '#C4A99F',
            letterSpacing: '1px',
          }}>{order.id}</div>
        </div>

      </div>
    </div>
  );
}