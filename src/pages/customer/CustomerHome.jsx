import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CustomerHeader, CustomerFooter } from './CustomerLayout';

import cakeImage from '../../assets/images/homepage/images.png';
import ensaymada from '../../assets/images/homepage/imagee.png';
import heroimg from '../../assets/images/homepage/heroimg.png';

import cake1 from '../../assets/images/homepage/image2.png';
import cake2 from '../../assets/images/homepage/image3.png';
import cake3 from '../../assets/images/homepage/image4.png';
import cake4 from '../../assets/images/homepage/image5.png';
import cake5 from '../../assets/images/homepage/image6.png';
import cake6 from '../../assets/images/homepage/image7.png';
import cake7 from '../../assets/images/homepage/image8.png';
import cake8 from '../../assets/images/homepage/image9.png';
import cake9 from '../../assets/images/homepage/image10.png';
import cake10 from '../../assets/images/homepage/image11.png';

// ─── Data ───────────────────────
const COLLECTIONS = [
  {
    title: 'Celebration Packages',
    desc: 'Complete sets featuring our signature themed cakes, cupcakes, and balloons for a hassle-free celebration.',
    img: cakeImage,
    tag: 'Best for Events',
  },
  {
    title: 'Filipino Common Pastries',
    desc: 'Freshly baked daily treats from our classic crinkles and brownies to premium ensaymada.',
    img: ensaymada,
    tag: 'Baked Fresh',
  },
];

// Dito mo ilalagay ang mga pictures ng dating orders (dinamihan ko ang placeholder para makita ang epekto ng maliit na layout)
const GALLERY_IMAGES = [
  { id: 1, title: 'Custom Birthday Cake', category: 'Cakes', img: cake1 },
  { id: 2, title: 'Special Occasion Cupcakes', category: 'Pastries', img: cake2 },
  { id: 3, title: 'Themed Event Package', category: 'Events', img: cake3 },
  { id: 4, title: 'Artisan Bread Box', category: 'Pastries', img: cake4 },
  { id: 5, title: 'Minimalist Wedding Cake', category: 'Cakes', img: cake5 },
  { id: 6, title: 'Holiday Treats Set', category: 'Pastries', img: cake6 },
  { id: 7, title: 'Anniversary Cake', category: 'Cakes', img: cake7 },
  { id: 8, title: 'Graduation Cupcakes', category: 'Pastries', img: cake8 },
  { id: 9, title: 'Company Event Package', category: 'Events', img: cake9 },
  { id: 10, title: 'Daily Pastry Box', category: 'Pastries', img: cake10 },
];

export default function CustomerHome({ cartCount, cartTotal, onCartClick }) {
  const navigate = useNavigate();

  return (
    <>
      <style>
        {`
          ::-webkit-scrollbar { display: none; }
          html, body { -ms-overflow-style: none; scrollbar-width: none; }
          .custom-scrollbar::-webkit-scrollbar { display: block; width: 4px; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #EAE4E0; border-radius: 4px; }
        `}
      </style>
    <div className="min-h-screen bg-[#E8E2DD] text-[#5A453C] font-sans selection:bg-[#D1C7C0] no-scroll">
      <CustomerHeader 
        cartCount={cartCount} 
        cartTotal={cartTotal} 
        onCartClick={onCartClick} 
        page="home" 
      />

      <main>
        {/* HERO SECTION */}
        <section className="w-full min-h-[90vh] flex items-center bg-[#E8E2DD] py-16 lg:py-5">
          <div className="max-w-[1300px] mx-auto px-8 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <div className="w-full text-center lg:text-left">
                <h1 className="text-6xl md:text-7xl lg:text-8xl font-serif text-[#5A453C] leading-tight mb-8">
                  Elevating Everyday <br className="hidden lg:block" /> Moments.
                </h1>
                <p className="text-xl md:text-2xl text-[#796860] mb-10 leading-relaxed font-light max-w-xl mx-auto lg:mx-0">
                  Discover our meticulously handcrafted cakes and pastries, baked fresh daily using only the finest ingredients.
                </p>
                <button 
                  onClick={() => navigate('/customer/menu')}
                  className="inline-block bg-[#5A453C] text-white px-12 py-5 text-base uppercase tracking-widest font-medium hover:bg-[#4A3831] transition-colors duration-300 border-none"
                >
                  Explore Menu
                </button>
              </div>
              <div className="w-full h-[400px] md:h-[500px] lg:h-[650px] shadow-2xl">
                <img 
                  src={heroimg} 
                  alt="Artisan Pastries" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* HOW TO ORDER */}
        <section className="py-20 bg-[#FDFBF7] ">
          <div className="max-w-[1300px] mx-auto px-8">
            <div className="text-center mb-20">
              <span className="text-sm uppercase tracking-[0.2em] text-[#9E8F88] mb-3 block">Simple Process</span>
              <h2 className="text-4xl font-serif text-[#5A453C]">How to Order</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
              {[
                { num: '01', title: 'Browse Menu', desc: 'Explore our artisan cakes, pastries, and exclusive packages.' },
                { num: '02', title: 'Add to Cart', desc: 'Select your favorites and proceed to our seamless checkout.' },
                { num: '03', title: 'Confirm Details', desc: 'Review your order and select your preferred pickup time.' },
                { num: '04', title: 'Enjoy', desc: 'Pick up your freshly baked goods and enjoy every bite.' }
              ].map((step, idx) => (
                <div key={idx} className="text-center md:text-left">
                  <span className="block text-7xl font-serif text-[#C4B7B1] mb-6">
                    {step.num}
                  </span>
                  <h4 className="text-lg uppercase tracking-widest font-semibold mb-3 text-[#5A453C]">{step.title}</h4> 
                  <p className="text-base text-[#796860] font-light leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* GALLERY SECTION (Past Creations) - UPDATED TO BE SMALLER AND NO HOVER */}
        <section className="py-24 bg-[#FDFBF7]">
          <div className="max-w-[1300px] mx-auto px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-serif text-[#5A453C] mb-4">Some Past Creations</h2>
              <p className="text-[#796860] font-light italic">A glimpse of the bespoke orders we've crafted for our customers.</p>
            </div>

            {/* Changed grid cols to be smaller: starts at 2 on mobile, goes up to 5 on large screens */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {GALLERY_IMAGES.map((item) => (
                // Replaced fixed height with aspect-ratio for smaller, square items. Removed overflow-hidden as scaling is gone.
                <div key={item.id} className="relative aspect-[1/1] overflow-hidden bg-[#E8E2DD] shadow-md cursor-default">
                  <img 
                    src={item.img} 
                    alt={item.title} 
                    // Removed transition and hover scaling classes
                    className="w-full h-full object-cover"
                  />
                  {/* Removed the hover overlay div entirely */}
                </div>
              ))}
            </div>

            <div className="mt-16 text-center">
              <p className="text-[#796860] mb-6 font-light">Want something customized for your special day?</p>
              <button 
                onClick={() => navigate('/customer/menu')}
                className="border-b border-[#5A453C] pb-1 text-sm uppercase tracking-widest font-bold hover:text-[#9E8F88] hover:border-[#9E8F88] transition-all"
              >
                Start your order here
              </button>
            </div>
          </div>
        </section>

        {/* COLLECTIONS SECTION */}
        <section className="bg-[#FDFBF7] pb-20"> 
  <div className="max-w-[1200px] mx-auto px-8">
    {/* Mula 650px, ginawang 350px na lang ang height */}
    <div className="flex flex-col md:flex-row gap-4 w-full md:h-[350px]">
      {COLLECTIONS.map((item, idx) => (
        <div key={idx} className="relative flex-1 h-[250px] md:h-full overflow-hidden group cursor-pointer" onClick={() => navigate('/customer/menu')}>
          <img src={item.img} alt={item.title} className="w-full h-full object-cover transition-transform duration-700" /> 
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A1412]/80 via-transparent to-transparent flex flex-col justify-end p-8">
            <h3 className="text-xl font-serif text-white mb-1">{item.title}</h3>
            <p className="text-[11px] text-white/70 max-w-xs font-light">{item.desc}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>
      </main>

      <CustomerFooter />
    </div>
    </>
  );
}