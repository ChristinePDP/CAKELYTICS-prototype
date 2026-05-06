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

  const qrLink = `${window.location.origin}/receipt/${finalOrder.id}`;

  const handleSaveAsImage = async () => {
    if (!ticketRef.current) return;
    setIsDownloading(true);
    
    try {
      const canvas = await html2canvas(ticketRef.current, {
        backgroundColor: '#FCFAF8', 
        scale: 3, 
        logging: false,
        useCORS: true 
      });
      
      const image = canvas.toDataURL('image/png', 1.0);
      const fakeLink = window.document.createElement('a');
      fakeLink.style = 'display:none;';
      fakeLink.download = `AileenNiculus-Receipt-${finalOrder.id}.png`; 
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

      <div className="max-w-[500px] mx-auto mt-10 mb-20 px-4">
        <div className="bg-white rounded-[28px] p-8 shadow-sm border border-[#EAE4E0] text-center relative overflow-hidden">
          
          {/* Success Icon */}
          <div className="w-16 h-16 bg-gradient-to-br from-green-50 to-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm border border-green-200">
            <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
          </div>

          <h2 className="font-serif text-3xl font-bold text-[#3D2B27] mb-2">Order Placed!</h2>
          <p className="text-[13px] text-[#7A6560] leading-relaxed max-w-[320px] mx-auto mb-8">
            Please save your digital receipt. Present the QR code at the counter to claim your order.
          </p>

          {/* ─── MODERN & COMPACT RECEIPT TICKET ─── */}
          <div 
            ref={ticketRef} 
            className="bg-white rounded-2xl p-6 mx-auto mb-8 max-w-[320px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-[#EAE4E0] text-left relative"
          >
            {/* Header */}
            <div className="text-center mb-4">
              <h3 className="font-serif text-[22px] font-black text-[#3D2B27] leading-tight mb-1">Aileen Cake Max</h3>
              <p className="text-[9px] tracking-[0.2em] uppercase text-[#7A6560] font-bold">Bake Shop</p>
            </div>

            {/* Meta Info (Order ID & Date) */}
            <div className="flex justify-between items-center py-3 border-y border-dashed border-[#EAE4E0] mb-4">
              <div>
                <span className="block text-[9px] uppercase tracking-wider text-[#A3918B] font-bold mb-0.5">Order No.</span>
                <span className="text-[13px] font-black text-[#3D2B27] tracking-wide">{finalOrder.id}</span>
              </div>
              <div className="text-right">
                <span className="block text-[9px] uppercase tracking-wider text-[#A3918B] font-bold mb-0.5">Date</span>
                <span className="text-[12px] font-bold text-[#5A453C]">{currentDate}</span>
              </div>
            </div>

            {/* Order Items */}
            <div className="mb-4 min-h-[60px]">
              {finalOrder.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-[13px] mb-2 text-[#4A3B36]">
                  <span className="pr-4 leading-tight"><span className="font-black text-[#3D2B27] mr-1">{item.qty}x</span> {item.name}</span>
                  <span className="font-bold whitespace-nowrap">{fmt(item.price * item.qty)}</span>
                </div>
              ))}
            </div>

            {/* Highlighted Total Area */}
            <div className="flex justify-between items-center bg-[#FDFBF9] border border-[#F3EFEA] p-3.5 rounded-xl mb-5">
              <span className="text-[12px] font-black text-[#7A6560] uppercase tracking-wider">Total</span>
              <span className="text-[18px] font-black text-[#3D2B27]">{fmt(finalOrder.total)}</span>
            </div>

            {/* Smaller QR Code */}
            <div className="flex flex-col items-center">
              <div className="p-2.5 bg-white border border-[#EAE4E0] rounded-xl mb-2 shadow-sm">
                <QRCodeSVG 
                  value={qrLink} 
                  size={120} 
                  bgColor={"#ffffff"} 
                  fgColor={"#3D2B27"} 
                  level={"H"} 
                />
              </div>
              <p className="text-[9px] text-[#A3918B] uppercase tracking-widest font-bold">Scan to verify</p>
            </div>
          </div>
          {/* ─── END OF TICKET ─── */}

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 max-w-[320px] mx-auto">
            <button 
              className="w-full px-6 py-3.5 bg-[#F5EFEB] text-[#4A3B36] rounded-xl font-bold text-[13px] hover:bg-[#EAE4E0] transition-colors border-none cursor-pointer disabled:opacity-50"
              onClick={handleSaveAsImage} 
              disabled={isDownloading}
            >
              {isDownloading ? 'Saving Image...' : '↓ Save Receipt as Image'}
            </button>
            <button 
              className="w-full px-6 py-3.5 bg-[#3D2B27] text-white rounded-xl font-bold text-[13px] hover:bg-[#2A1D1A] transition-colors border-none cursor-pointer shadow-md shadow-[#3D2B27]/20"
              onClick={() => navigate('/customer')}
            >
              Back to Home
            </button>
          </div>

        </div>
      </div>

      <CustomerFooter />
    </div>
  );
}