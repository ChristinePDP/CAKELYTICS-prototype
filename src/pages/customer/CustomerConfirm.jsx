// ============================================================
// CUSTOMER CONFIRMATION PAGE (DYNAMIC QR CODE)
// ============================================================
import { useNavigate } from 'react-router-dom';
import { useRef, useState, useEffect } from 'react'; 
import { QRCodeSVG } from 'qrcode.react'; 
import html2canvas from 'html2canvas'; 
import { CustomerHeader, CustomerFooter } from './CustomerLayout';

export default function CustomerConfirm({ orderData, orderId }) {
  const navigate = useNavigate();
  const ticketRef = useRef(null); 
  const [isDownloading, setIsDownloading] = useState(false);
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const now = new Date();
    setCurrentDate(now.toLocaleString('en-US', { 
      year: 'numeric', month: '2-digit', day: '2-digit', 
      hour: '2-digit', minute: '2-digit' 
    }));
  }, []);

  const finalOrder = orderData || {
    id: orderId || 'ORD-8492',
    items: [
      { name: 'Package B (Party Size)', qty: 1, price: 550 },
      { name: 'Special Ensaymada', qty: 2, price: 35 }
    ],
    total: 620
  };

  const fmt = (n) => '₱' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // =========================================
  // ITO ANG FIX: DYNAMIC URL LINK
  // =========================================
  // Gagamit ito ng "origin" kung saan mo kasalukuyang binubuksan ang site.
  // Kung binuksan mo ang laptop gamit ang IP address, iyon ang ilalagay niya sa QR.
  const qrLink = `${window.location.origin}/receipt/${finalOrder.id}`;

  const handleSaveAsImage = async () => {
    if (!ticketRef.current) return;
    setIsDownloading(true);
    
    try {
      const canvas = await html2canvas(ticketRef.current, {
        backgroundColor: '#FCFAF8', 
        scale: 3, // Tinaasan ang scale para mas HD ang QR kapag na-save as image
        logging: false,
        useCORS: true 
      });
      
      const image = canvas.toDataURL('image/png', 1.0);
      const fakeLink = window.document.createElement('a');
      fakeLink.style = 'display:none;';
      fakeLink.download = `ABShop-Receipt-${finalOrder.id}.png`; 
      fakeLink.href = image;
      
      document.body.appendChild(fakeLink);
      fakeLink.click();
      document.body.removeChild(fakeLink);
      
    } catch (error) {
      console.error('Oops, hindi na-save ang image:', error);
      alert('Failed to save receipt. Please take a screenshot instead.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="font-sans bg-[#FCFAF8] min-h-screen text-[#4A3B36] leading-relaxed antialiased">
      <CustomerHeader page="confirm" cartCount={0} cartTotal={0} />

      <div style={{ maxWidth: 540, margin: '60px auto 100px', padding: '0 24px' }}>
        <div style={{ 
          textAlign: 'center', 
          backgroundColor: '#FFFFFF', 
          borderRadius: '28px', 
          padding: '48px 36px',
          boxShadow: '0 15px 50px rgba(107, 79, 72, 0.06)',
          border: '1px solid #F5EDEB'
        }}>

          <div style={{
            width: 72, height: 72, background: 'linear-gradient(135deg, #E6F4EE, #D1E8DD)', color: '#2E7A58',
            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px', boxShadow: '0 4px 12px rgba(46, 122, 88, 0.12)'
          }}>
            <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
          </div>

          <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: 34, fontWeight: 700, color: '#3D2B27', marginBottom: 12 }}>
            Order Success!
          </h2>
          <p style={{ color: '#7A6560', fontSize: 15, lineHeight: 1.6, marginBottom: 36, maxWidth: '400px', margin: '0 auto 36px' }}>
            Thank you! Your digital receipt is ready. Please save this image and present the QR code at the counter to claim and pay.
          </p>

          <div ref={ticketRef} style={{
            background: '#FFFFFF', borderRadius: '24px', padding: '36px 28px',
            margin: '0 auto 32px', maxWidth: '340px', color: '#3D2B27',
            boxShadow: '0 8px 30px rgba(0,0,0,0.03)', border: '1px solid #EBEBEB',
            textAlign: 'left', position: 'relative', overflow: 'hidden'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontFamily: '"Playfair Display", serif', margin: '0 0 4px', fontSize: '20px', fontWeight: 800, color: '#3D2B27' }}>Aileen & Niculus</h3>
              <p style={{ margin: '0', fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#6B4F48', fontWeight: 600 }}>Bake Shop</p>
            </div>

            <div style={{ borderBottom: '1px solid #EEE', margin: '16px 0' }}></div>

            <div style={{ fontSize: '12px', lineHeight: '1.7', color: '#555', fontWeight: 500 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Order No:</span>
                <span style={{ fontWeight: 700, color: '#3D2B27', fontFamily: 'monospace', fontSize: '13px' }}>{finalOrder.id}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Date:</span>
                <span>{currentDate}</span>
              </div>
            </div>

            <div style={{ borderBottom: '1px dashed #E8E0DE', margin: '16px 0' }}></div>

            <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse', color: '#3D2B27' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #EEE' }}>
                  <th style={{ textAlign: 'left', fontWeight: 600, paddingBottom: '10px', color: '#8A7B72' }}>ITEM</th>
                  <th style={{ textAlign: 'right', fontWeight: 600, paddingBottom: '10px', color: '#8A7B72' }}>AMT</th>
                </tr>
              </thead>
              <tbody>
                {finalOrder.items.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #F9F9F9' }}>
                    <td style={{ verticalAlign: 'top', paddingTop: '10px', paddingBottom: '10px' }}>
                      <div style={{ fontWeight: 700 }}>{item.qty}x {item.name}</div>
                    </td>
                    <td style={{ verticalAlign: 'top', paddingTop: '10px', paddingBottom: '10px', textAlign: 'right', fontWeight: 700, fontSize: '13px' }}>
                      {fmt(item.price * item.qty)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 800, margin: '20px 0', color: '#3D2B27' }}>
              <span>TOTAL</span>
              <span>{fmt(finalOrder.total)}</span>
            </div>

            <div style={{ borderBottom: '2px dashed #E8E0DE', margin: '20px 0 24px' }}></div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ padding: '12px', border: '1px solid #EEE', borderRadius: '16px', background: '#FFF' }}>
                {/* INAYOS: Mas malaki at High Error Correction para mabilis ma-scan */}
                <QRCodeSVG 
                  value={qrLink} 
                  size={180} 
                  bgColor={"#ffffff"} 
                  fgColor={"#3D2B27"} 
                  level={"H"} 
                  includeMargin={true}
                />
              </div>
              <p style={{ margin: '16px 0 0', fontSize: '11px', textAlign: 'center', color: '#8A7B72', lineHeight: '1.5', fontWeight: 500 }}>
                Scan to view visual receipt.
              </p>
            </div>
            
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '340px', margin: '0 auto' }}>
            <button className="w-full px-6 py-3 bg-white text-[#4A3B36] border border-[#EAE4E0] rounded-lg font-semibold cursor-pointer transition-all hover:bg-[#FCFAF9]" onClick={handleSaveAsImage} disabled={isDownloading}>
              {isDownloading ? 'Saving...' : 'Save Receipt as Image'}
            </button>
            <button className="w-full px-6 py-3 bg-[#796860] text-white border-none rounded-lg font-semibold cursor-pointer transition-all hover:bg-[#6E4D3A]" onClick={() => navigate('/customer')}>
              Back to Home
            </button>
          </div>
        </div>
      </div>

      <CustomerFooter />
    </div>
  );
}