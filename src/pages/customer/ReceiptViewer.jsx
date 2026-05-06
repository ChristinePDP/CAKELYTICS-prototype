import { useParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Badge } from '../../components/ui';

function statusVariant(s) {
  const map = { Confirmed: 'confirmed', Ready: 'ready', Completed: 'completed', Cancelled: 'cancelled' };
  return map[s] || 'default';
}

export default function ReceiptViewer() {
  const { orderId } = useParams();
  const { orders } = useApp();

  // Try to find real order, fallback to mock
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
    status: 'Completed',
    pickupDate: new Date().toLocaleDateString(),
    pickupTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  const fmt = (n) => '₱' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div style={{ backgroundColor: '#FCFAF8', minHeight: '100vh', padding: '40px 20px', display: 'flex', justifyContent: 'center' }}>
      <div style={{
        background: '#FFFFFF',
        borderRadius: '24px', 
        padding: '36px 28px',
        width: '100%',
        maxWidth: '500px',
        color: '#3D2B27',
        boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
        border: '1px solid #EBEBEB',
        textAlign: 'left'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontFamily: '"Playfair Display", serif', margin: '0 0 4px', fontSize: '24px', fontWeight: 800, color: '#3D2B27' }}>Aileen Cake Max</h3>
          <p style={{ margin: '0', fontSize: '12px', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#6B4F48', fontWeight: 600 }}>Bake Shop</p>
        </div>

        <div style={{ borderBottom: '1px solid #EEE', margin: '16px 0' }}></div>

        {/* Order Details */}
        <div style={{ fontSize: '14px', lineHeight: '1.8', color: '#555', fontWeight: 500, marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span>Order No:</span>
            <span style={{ fontWeight: 700, color: '#3D2B27', fontFamily: 'monospace', fontSize: '15px' }}>{order.id}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span>Customer:</span>
            <span style={{ fontWeight: 700, color: '#3D2B27' }}>{order.customer?.name || 'Walk-in'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span>Pick-up Date:</span>
            <span style={{ fontWeight: 700, color: '#3D2B27' }}>{order.pickupDate} {order.pickupTime}</span>
          </div>
        </div>

        <div style={{ borderBottom: '1px dashed #E8E0DE', margin: '20px 0' }}></div>

        {/* Items Table */}
        <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse', color: '#3D2B27', marginBottom: '16px' }}>
          <tbody>
            {order.items?.map((item, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #F5F5F5' }}>
                <td style={{ paddingTop: '10px', paddingBottom: '10px', textAlign: 'left', fontWeight: 700 }}>{item.name}</td>
                <td style={{ paddingTop: '10px', paddingBottom: '10px', textAlign: 'center', fontWeight: 700, width: '40px' }}>x{item.qty}</td>
                <td style={{ paddingTop: '10px', paddingBottom: '10px', textAlign: 'right', fontWeight: 700 }}>{fmt(item.total || item.qty * item.price)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ borderBottom: '1px solid #EEE', margin: '16px 0' }}></div>

        {/* Subtotal & Total */}
        {order.subtotal && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '12px', color: '#6B4F48' }}>
            <span>Subtotal</span>
            <span>{fmt(order.subtotal)}</span>
          </div>
        )}

        {/* Total */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: 800, margin: '16px 0', color: '#3D2B27' }}>
          <span>TOTAL</span>
          <span>{fmt(order.grandTotal || order.total)}</span>
        </div>

        <div style={{ borderBottom: '1px solid #EEE', margin: '20px 0' }}></div>

        {/* Status Badge */}
        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <span style={{
            display: 'inline-block',
            padding: '8px 16px',
            background: order.status === 'Completed' ? '#D1FAE5' : 
                       order.status === 'Ready' ? '#DBEAFE' : '#FEF3C7',
            color: order.status === 'Completed' ? '#065F46' :
                   order.status === 'Ready' ? '#0C4A6E' : '#92400E',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 'bold',
            letterSpacing: '1px',
            textTransform: 'uppercase'
          }}>
            {order.status || 'Confirmed'}
          </span>
        </div>

        {/* Payment Status */}
        <div style={{
          marginTop: '16px',
          padding: '12px',
          backgroundColor: '#FEF3C7',
          borderRadius: '12px',
          textAlign: 'center',
          border: '1px solid #FCD34D'
        }}>
          <p style={{ margin: '0', fontSize: '12px', fontWeight: 700, color: '#92400E', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {order.paymentType === 'deposit' ? `Deposit ${fmt(order.amountPaid)}` : 'Fully Paid'}
          </p>
        </div>
      </div>
    </div>
  );
}