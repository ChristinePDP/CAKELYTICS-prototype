import { useParams } from 'react-router-dom';

export default function ReceiptViewer() {
  // Kinukuha nito yung Order ID mula sa URL link na na-scan (e.g. ORD-8492)
  const { orderId } = useParams();

  // MOCK DATA: Kapag may database na kayo, dito niyo kukunin ang totoong items
  // gamit ang orderId na nasa itaas. Sa ngayon, dummy muna para makita mo ang design.
  const mockOrder = {
    id: orderId,
    date: new Date().toLocaleString('en-US', { 
      year: 'numeric', month: '2-digit', day: '2-digit', 
      hour: '2-digit', minute: '2-digit' 
    }),
    items: [
      { name: 'Package B (Party Size)', qty: 1, price: 550 },
      { name: 'Special Ensaymada', qty: 2, price: 35 }
    ],
    total: 620
  };

  const fmt = (n) => '₱' + n.toLocaleString('en-US', { minimumFractionDigits: 2 });

  return (
    <div style={{ backgroundColor: '#FCFAF8', minHeight: '100vh', padding: '40px 20px', display: 'flex', justifyContent: 'center' }}>
      <div style={{
        background: '#FFFFFF',
        borderRadius: '24px', 
        padding: '36px 28px',
        width: '100%',
        maxWidth: '400px',
        color: '#3D2B27',
        boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
        border: '1px solid #EBEBEB',
        textAlign: 'left'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'inline-block', padding: '8px 16px', background: '#E6F4EE', color: '#2E7A58', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', marginBottom: '16px' }}>
            VERIFIED ORDER
          </div>
          <h3 style={{ fontFamily: '"Playfair Display", serif', margin: '0 0 4px', fontSize: '24px', fontWeight: 800, color: '#3D2B27' }}>Aileen & Niculus</h3>
          <p style={{ margin: '0', fontSize: '12px', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#6B4F48', fontWeight: 600 }}>Bake Shop</p>
        </div>

        <div style={{ borderBottom: '1px solid #EEE', margin: '16px 0' }}></div>

        {/* Order Details */}
        <div style={{ fontSize: '14px', lineHeight: '1.8', color: '#555', fontWeight: 500 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Order No:</span>
            <span style={{ fontWeight: 700, color: '#3D2B27', fontFamily: 'monospace', fontSize: '15px' }}>{mockOrder.id}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Date:</span>
            <span>{mockOrder.date}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Payment Status:</span>
            <span style={{ color: '#D97706', fontWeight: 700 }}>UNPAID</span>
          </div>
        </div>

        <div style={{ borderBottom: '1px dashed #E8E0DE', margin: '20px 0' }}></div>

        {/* Items Table */}
        <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse', color: '#3D2B27' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #EEE' }}>
              <th style={{ textAlign: 'left', fontWeight: 600, paddingBottom: '10px', color: '#8A7B72' }}>QTY</th>
              <th style={{ textAlign: 'left', fontWeight: 600, paddingBottom: '10px', color: '#8A7B72' }}>ITEM</th>
              <th style={{ textAlign: 'right', fontWeight: 600, paddingBottom: '10px', color: '#8A7B72' }}>AMT</th>
            </tr>
          </thead>
          <tbody>
            {mockOrder.items.map((item, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #F9F9F9' }}>
                <td style={{ verticalAlign: 'top', paddingTop: '12px', paddingBottom: '12px', fontWeight: 700 }}>{item.qty}</td>
                <td style={{ verticalAlign: 'top', paddingTop: '12px', paddingBottom: '12px', paddingRight: '10px' }}>
                  <div style={{ fontWeight: 700 }}>{item.name}</div>
                  <div style={{ fontSize: '11px', color: '#8A7B72', marginTop: '4px' }}>@{fmt(item.price)}</div>
                </td>
                <td style={{ verticalAlign: 'top', paddingTop: '12px', paddingBottom: '12px', textAlign: 'right', fontWeight: 700, fontSize: '14px' }}>{fmt(item.price * item.qty)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ borderBottom: '1px solid #EEE', margin: '20px 0' }}></div>

        {/* Total */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '22px', fontWeight: 800, margin: '24px 0', color: '#3D2B27' }}>
          <span>TOTAL</span>
          <span>{fmt(mockOrder.total)}</span>
        </div>

        {/* Action Button para sa Admin */}
        <button style={{
          width: '100%', padding: '16px', backgroundColor: '#2E7A58', color: '#FFF',
          border: 'none', borderRadius: '12px', fontSize: 16, fontWeight: 700, cursor: 'pointer',
          marginTop: '20px', boxShadow: '0 4px 12px rgba(46, 122, 88, 0.2)'
        }} className="hover:opacity-90">
          Mark as Paid & Claimed
        </button>
      </div>
    </div>
  );
}