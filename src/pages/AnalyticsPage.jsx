import { useState, useMemo, useEffect, useRef } from 'react';
  import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
  import { ShoppingBag, DollarSign, BarChart2, Percent, TrendingUp, TrendingDown, RefreshCw, Sparkles, BrainCircuit, Activity, Lightbulb, LineChart as LucideLineChart } from 'lucide-react';
  import { ANALYTICS } from '../data/dummyData';
  import { Card } from '../components/ui';

  // ─── Constants ─────────────────────────────────────────────────
  const VIEWS = ['Day','Week','Month','Year'];
  const AVF_VIEWS = ['Day','Week','Month','Year','All Time'];
  const VIEW_PERIOD_LABEL = {
    Day:   'Time',
    Week:  'Day',
    Month: 'Month',
    Year:  'Year',
  };
  const HT_VIEWS  = ['Week','Month','Year'];
  const AVF_KEY   = { Day:'day', Week:'week', Month:'month', Year:'year', 'All Time':'allTime' };

  const HEATMAP_DAYS  = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const HEATMAP_HOURS = ['6am','8am','10am','12pm','2pm','4pm','6pm','8pm'];
  const HEATMAP_WEEKS = ['Week 1','Week 2','Week 3','Week 4'];
  const HEATMAP_MONTHS= ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  const AI_COLORS = {
    success: { color:'#10b981', tagBg:'#d1fae5', tagTxt:'#065f46' },
    warning: { color:'#f59e0b', tagBg:'#fef3c7', tagTxt:'#92400e' },
    danger:  { color:'#f43f5e', tagBg:'#fee2e2', tagTxt:'#b91c1c' },
    info:    { color:'#3b82f6', tagBg:'#dbeafe', tagTxt:'#1e40af' },
    neutral: { color:'#8b5cf6', tagBg:'#ede9fe', tagTxt:'#5b21b6' },
  };

  // ─── Formatters ────────────────────────────────────────────────
  const fmtFull  = (n) => '₱' + n.toLocaleString('en-PH');
  const fmtAxis  = (v) => {
    if (v >= 1000000) return '₱'+(v/1000000).toFixed(1)+'M';
    if (v >= 1000)    return '₱'+(v/1000).toFixed(0)+'K';
    return '₱'+v;
  };

  // ─── Components ────────────────────────────────────────────────
  function Tabs({ value, onChange, options }) {
    return (
      <div className="flex border border-brand-300 rounded-lg overflow-hidden shadow-sm">
        {options.map(v => (
          <button
            key={v}
            onClick={() => onChange(v)}
            className={`px-4 py-2 text-[13px] font-bold border-r border-brand-300 last:border-r-0 transition-colors whitespace-nowrap ${
              value === v
                ? 'bg-brand-700 text-white'
                : 'bg-white text-brand-600 hover:bg-brand-50 hover:text-brand-800'
            }`}
          >{v}</button>
        ))}
      </div>
    );
  }

  function ChartTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    const total = payload.reduce((sum, p) => sum + (p.value || 0), 0);
    return (
      <div className="bg-white border border-brand-200 rounded-xl shadow-lg p-3 text-sm">
        <p className="font-semibold text-brand-800 mb-2">{label}</p>
        <p className="flex items-center gap-2 mb-1 text-brand-600">
          <span className="w-2 h-2 rounded-full inline-block bg-blue-500" />
          <span className="text-brand-500">Sales:</span>
          <span className="font-bold text-brand-800">{fmtFull(total)}</span>
        </p>
        <div className="border-t border-brand-100 my-1.5" />
        {payload.map((p, i) => p.value !== null && (
          <p key={i} className="flex items-center gap-2 mb-1 last:mb-0 text-brand-600">
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.stroke || p.color }} />
            <span className="text-brand-500">{p.name}:</span>
            <span className="font-bold text-brand-800">{fmtFull(p.value)}</span>
          </p>
        ))}
      </div>
    );
  }

  function KpiCard({ label, value, delta, rawValue, isCurrency, isGoodUp, accentColor, icon, period }) {
    const isUp   = delta >= 0;
    const isGood = isGoodUp ? isUp : !isUp;

    const prior = rawValue / (1 + (delta / 100));
    const diffAmt = Math.abs(rawValue - prior);

    let diffStr = "";
    if (isCurrency) {
      diffStr = fmtFull(Math.round(diffAmt));
    } else {
      diffStr = diffAmt.toFixed(1) + '%';
    }

    return (
      <div className="bg-white border border-brand-300 rounded-xl overflow-hidden">
        <div className="h-1 w-full" style={{ background: accentColor }} />
        <div className="p-4">
          <div className="flex items-start justify-between mb-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-brand-400">{label}</p>
            <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ background: accentColor+'18' }}>
              {icon}
            </div>
          </div>
          <p className="text-[28px] font-bold text-brand-900 leading-none tracking-tight mb-2" style={{ fontVariantNumeric:'tabular-nums' }}>
            {value}
          </p>
          <p className={`text-[12px] font-semibold flex items-center gap-1 ${isGood ? 'text-emerald-600' : 'text-red-500'}`}>
            <span>{isUp ? '▲' : '▼'}</span>
            <span>{diffStr} vs prior {period}</span>
          </p>
        </div>
      </div>
    );
  }

  function Heatmap({ tab, trendData }) {
    const seed = (a, b) => ((Math.sin(a*127.1+b*311.7)*43758.5453)%1+1)%1;
    const color = (op) => `rgba(92,51,23,${op.toFixed(2)})`;

    if (tab === 'Day') return (
      <div className="flex flex-col gap-1">
        {HEATMAP_HOURS.map((h, hi) => {
          const op = Math.min(0.1+(hi>=3&&hi<=5?0.55:0)+seed(hi,0)*0.25, 0.92);
          const light = op < 0.45;
          const orders = Math.round(3 + op * 18);
          return (
            <div key={h} className="flex items-center gap-2">
              <div className="w-9 text-right text-[10px] text-brand-400 font-semibold shrink-0">{h}</div>
              <div className="flex-1 rounded h-6 flex items-center justify-between px-2 cursor-pointer hover:opacity-75 transition-opacity" style={{ background: color(op) }}>
                <span className="text-[10px] font-bold" style={{ color: light ? '#5C3317' : '#fff' }}>{orders} orders</span>
              </div>
            </div>
          );
        })}
      </div>
    );

    if (tab === 'Week') return (
      <div>
        <div className="grid gap-1 mb-1" style={{ gridTemplateColumns:'36px repeat(7, 1fr)' }}>
          <div />
          {HEATMAP_DAYS.map(d => <div key={d} className="text-center text-[10px] text-brand-400 font-semibold">{d}</div>)}
        </div>
        {HEATMAP_HOURS.map((h, hi) => (
          <div key={h} className="grid gap-1 mb-1 items-center" style={{ gridTemplateColumns:'36px repeat(7, 1fr)' }}>
            <div className="text-right pr-1.5 text-[10px] text-brand-400 font-semibold">{h}</div>
            {HEATMAP_DAYS.map((d, di) => {
              const op = Math.min(0.1+(di>=5?0.35:0)+(hi>=3&&hi<=5?0.3:0)+seed(hi,di)*0.2, 0.92);
              const light = op < 0.45;
              const orders = Math.round(2 + op * 14);
              return (
                <div key={d} className="rounded h-6 flex items-center justify-center cursor-pointer hover:opacity-75 transition-opacity" style={{ background: color(op) }}>
                  <span className="text-[9px] font-bold" style={{ color: light ? '#5C3317' : '#fff' }}>{orders}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );

    if (tab === 'Month') {
      const maxVal = Math.max(...trendData.sales);
      const maxOrders = 420;
      return (
        <div className="grid grid-cols-4 gap-1.5">
          {trendData.labels.map((m, mi) => {
            const op = Math.min(0.1 + (trendData.sales[mi] / maxVal) * 0.82, 0.92);
            const light = op < 0.45;
            const orders = Math.round((trendData.sales[mi] / maxVal) * maxOrders);
            return (
              <div key={m} className="rounded-lg h-10 flex flex-col items-center justify-center cursor-pointer hover:opacity-75 transition-opacity gap-0.5"
                style={{ background: color(op) }}>
                <span className="text-[11px] font-bold" style={{ color: light ? '#5C3317' : '#fff' }}>{m}</span>
                <span className="text-[9px] font-semibold opacity-80" style={{ color: light ? '#5C3317' : '#fff' }}>{orders} orders</span>
              </div>
            );
          })}
        </div>
      );
    }

    if (tab === 'Year') {
      const maxVal = Math.max(...trendData.sales);
      const maxOrders = 4800;
      return (
        <div className="flex flex-col gap-2">
          {trendData.labels.map((yr, yi) => {
            const op = Math.min(0.1 + (trendData.sales[yi] / maxVal) * 0.82, 0.92);
            const light = op < 0.45;
            const orders = Math.round((trendData.sales[yi] / maxVal) * maxOrders);
            return (
              <div key={yr} className="flex items-center gap-2">
                <div className="w-9 text-right text-[10px] text-brand-400 font-semibold shrink-0">{yr}</div>
                <div className="flex-1 rounded h-6 flex items-center justify-between px-2 cursor-pointer hover:opacity-75 transition-opacity" style={{ background: color(op) }}>
                  <span className="text-[10px] font-bold" style={{ color: light ? '#5C3317' : '#fff' }}>{orders.toLocaleString()} orders</span>
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    return null;
  }

  function MiniSparkline({ trend }) {
    const isUp = trend === 'up';
    const color = isUp ? '#10b981' : '#f43f5e';
    const path = isUp
      ? "M0,16 L10,12 L20,14 L30,6 L40,8 L50,2"
      : "M0,2 L10,8 L20,6 L30,14 L40,12 L50,16";

    return (
      <svg width="50" height="20" viewBox="0 0 50 20" className="overflow-visible">
        <path d={path} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M0,18 L50,18" fill="none" stroke={color} strokeWidth="1.5" strokeDasharray="3 3" opacity="0.3" />
      </svg>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // MAIN PAGE
  // ═══════════════════════════════════════════════════════════════
  export default function AnalyticsPage() {
    const [view,    setView]   = useState('Week');
    const [avfTab,  setAvfTab] = useState('Week');

    const [aiData, setAiData] = useState(null);
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [aiError, setAiError] = useState(null);

    const vk       = view.toLowerCase();
    const kpi      = ANALYTICS.kpi[vk];
    const trend    = ANALYTICS.trend[vk];
    const topProds = ANALYTICS.topProducts[vk];
    
    const avfData  = ANALYTICS.actualVsForecast[AVF_KEY[avfTab]];

    const chartData = trend.labels.map((label, i) => ({
      label,
      Sales:    trend.sales[i],
      Expenses: trend.expenses[i],
      Profit:   trend.sales[i] - trend.expenses[i],
    }));

    const avfChartData = avfData.map(r => ({
      label:           r.label,
      'Actual Sales':    r.actualSales,
      'Actual Expenses': r.actualExpenses,
      'Forecast Sales':  r.forecastSales,
      'Forecast Expenses': r.forecastExpenses,
    }));

    const fetchGoogleAIInsights = async (forceRefresh = false) => {
      const cacheKey = `gemini_dashboard_v2_cache_${view}`;

      if (!forceRefresh) {
        const savedData = localStorage.getItem(cacheKey);
        if (savedData) {
          setAiData(JSON.parse(savedData));
          return;
        }
      }

      setIsAiLoading(true);
      setAiError(null);

      try {
        const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
        
        const growthItems = ANALYTICS.predictive.growthLeaders[vk].map(item => `${item.name} (+${item.pct}%)`).join(', ');
        const riskItems = ANALYTICS.predictive.atRisk[vk].map(item => `${item.name} (${item.pct}%)`).join(', ');

        const timeframePinas = view === 'Day' ? 'Arawan (Daily)' 
                            : view === 'Week' ? 'Lingguhan (Weekly)' 
                            : view === 'Month' ? 'Buwanan (Monthly)' 
                            : 'Taunan (Yearly)';

        const systemPrompt = `
          Ikaw ay Business Analyst para sa isang bake shop. Ang iyong trabaho ay mag-generate ng tatlong uri ng analysis batay sa objectives ng sistema:
          1. DESCRIPTIVE - pagsusuri ng kasalukuyan at nakaraang performance gamit ang aktwal na datos
          2. PREDICTIVE - sales at product trend forecasting
          3. PRESCRIPTIVE - rekomendasyon para sa sales

          TIMEFRAME: ${timeframePinas} na report para sa kasalukuyang ${view.toLowerCase()}.

          AKTWAL NA KPI DATA (gamitin ang eksaktong numbers na ito):
          - Total Sales: ₱${kpi.sales.toLocaleString('en-PH')} (${kpi.sDelta >= 0 ? '+' : ''}${kpi.sDelta}% vs prior ${view.toLowerCase()})
          - Total Expenses: ₱${kpi.expenses.toLocaleString('en-PH')} (${kpi.eDelta >= 0 ? '+' : ''}${kpi.eDelta}% vs prior ${view.toLowerCase()})
          - Gross Profit: ₱${kpi.profit.toLocaleString('en-PH')} (${kpi.pDelta >= 0 ? '+' : ''}${kpi.pDelta}% vs prior ${view.toLowerCase()})
          - Profit Margin: ${kpi.margin.toFixed(1)}% (${kpi.mDelta >= 0 ? '+' : ''}${kpi.mDelta}% vs prior ${view.toLowerCase()})
          - Top Products: ${topProds.map((p, i) => `${i+1}. ${p.name} (${p.sold} pcs)`).join(', ')}

          PREDICTIVE DATA:
          - Inaasahang TATAAS: ${growthItems}
          - Inaasahang BABABA (At Risk): ${riskItems}

          INSTRUCTIONS:
          - Para sa "descriptive": Isulat ang 2-3 sentences na nagtatala ng AKTWAL na performance gamit ang totoong numbers (₱ amounts, %, pcs). Sabihin kung pataas o pababa ang benta, gastos, at kita kumpara sa nakaraang ${view.toLowerCase()}. Dapat specific at data-driven, hindi vague.
          - Para sa "prescriptive": Magbigay ng 3-4 actionable recommendations na nakatuon sa SALES STRATEGY, MARKETING, at CUSTOMER ENGAGEMENT batay sa predictive data. 
            STRICT RULE: BAWAL magbigay ng rekomendasyon tungkol sa inventory, stock, o supply management.

          RETURN ONLY A VALID JSON OBJECT (walang markdown, walang backticks):
          {
            "descriptive": "2-3 sentences na may actual figures...",
            "prescriptive": [
              { "badge": "PROMO", "title": "...", "desc": "...", "type": "success" },
              { "badge": "BENTA", "title": "...", "desc": "...", "type": "info" },
              { "badge": "SERBISYO", "title": "...", "desc": "...", "type": "neutral" },
              { "badge": "ESTRATEHIYA", "title": "...", "desc": "...", "type": "warning" }
            ]
          }
        `;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: systemPrompt }] }] })
        });

        if (!response.ok) throw new Error('API connection failed');

        const data = await response.json();
        const text = data.candidates[0].content.parts[0].text;
        const parsed = JSON.parse(text.replace(/```json/gi, '').replace(/```/gi, '').trim());
        
        setAiData(parsed);
        localStorage.setItem(cacheKey, JSON.stringify(parsed));
      } catch (err) {
        console.error(err);
        setAiError("Nabigong makuha ang AI data. Paki-refresh.");
      } finally {
        setIsAiLoading(false);
      }
    };

    useEffect(() => {
      fetchGoogleAIInsights(false);
    }, [view, kpi, topProds]);

    const maxSold = topProds[0]?.sold || 1;
    const rankCls = ['bg-amber-100 text-amber-800','bg-slate-100 text-slate-600','bg-orange-100 text-orange-800','bg-brand-50 text-brand-400','bg-brand-50 text-brand-400'];
    const htTab   = view;
    const htSubs  = { Day:'Peak hours ngayong araw', Week:'Peak hours by day of week', Month:'Peak days per week', Year:'Peak months of the year' };
    const htDescs = {
      Day:   'Ipinapakita ang pinaka-abalang oras ngayong araw. Mas madilim ang kulay, mas maraming orders.',
      Week:  'Ipinapakita ang pinaka-abalang oras sa bawat araw ng linggo. Mas madilim ang kulay, mas maraming orders.',
      Month: 'Ipinapakita kung aling linggo at araw ng buwan ang may pinakamataas na order volume.',
      Year:  'Ipinapakita kung aling buwan ng taon ang pinaka-busy para sa orders.',
    };
    const axisStyle = { fontSize: 13, fill: '#64748b', fontWeight: 600 };

    return (
      <div className="space-y-5 pb-10">

        {/* HEADER */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Tabs value={view} onChange={setView} options={VIEWS} />
          </div>
        </div>

        {/* KPI CARDS */}
        <div className="grid grid-cols-4 gap-4">
          <KpiCard label="Total Sales"    value={fmtFull(kpi.sales)}    delta={kpi.sDelta} rawValue={kpi.sales}    isCurrency={true}  isGoodUp={true}  accentColor="#3b82f6" icon={<ShoppingBag size={16} color="#3b82f6"/>} period={VIEW_PERIOD_LABEL[view].split(' ')[0]} />
          <KpiCard label="Total Expenses" value={fmtFull(kpi.expenses)} delta={kpi.eDelta} rawValue={kpi.expenses} isCurrency={true}  isGoodUp={false} accentColor="#f43f5e" icon={<DollarSign  size={16} color="#f43f5e"/>} period={VIEW_PERIOD_LABEL[view].split(' ')[0]} />
          <KpiCard label="Gross Profit"   value={fmtFull(kpi.profit)}   delta={kpi.pDelta} rawValue={kpi.profit}   isCurrency={true}  isGoodUp={true}  accentColor="#10b981" icon={<BarChart2   size={16} color="#10b981"/>} period={VIEW_PERIOD_LABEL[view].split(' ')[0]} />
          <KpiCard label="Profit Margin"  value={kpi.margin.toFixed(1)+'%'} delta={kpi.mDelta} rawValue={kpi.margin} isCurrency={false} isGoodUp={true} accentColor="#f59e0b" icon={<Percent size={16} color="#f59e0b"/>} period={VIEW_PERIOD_LABEL[view].split(' ')[0]} />
        </div>

        {/* TREND CHART */}
        <Card className="p-5 bg-white border border-brand-100 rounded-xl">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <LucideLineChart size={18} className="text-brand-600" />
              <div>
                <h3 className="text-sm font-bold text-brand-800">Performance Trend</h3>
                <p className="text-xs text-brand-400 mt-0.5">Sales breakdown: expenses at profit · {VIEW_PERIOD_LABEL[view]}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-brand-500 font-semibold">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-rose-400 inline-block"/><span>Expenses</span></span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block"/><span>Profit</span></span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData} margin={{ top:8, right:12, left:0, bottom:0 }} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="label" tick={axisStyle} axisLine={{ stroke:'#f1f5f9' }} tickLine={false} dy={10} />
              <YAxis tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={fmtAxis} width={65} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill:'#f8fafc' }} />
              <Bar dataKey="Expenses" name="Expenses" stackId="a" fill="#f43f5e" radius={[0,0,0,0]} />
              <Bar dataKey="Profit"   name="Profit"   stackId="a" fill="#10b981" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-3 pt-3 border-t border-brand-100 flex items-start gap-2">
            <span className="text-[10px] mt-0.5">💡</span>
            <p className="text-[11px] text-brand-400 leading-relaxed">
              Ang bawat bar ay kumakatawan sa kabuuang <span className="font-semibold text-brand-600">Sales</span> — nahahati sa <span className="font-semibold text-rose-500">Expenses</span> (gastos) at <span className="font-semibold text-emerald-600">Profit</span> (kita). Mas mataas ang berde, mas malaki ang kita.
            </p>
          </div>
        </Card>

        {/* HEATMAP + TOP PRODUCTS */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-5 bg-white border border-brand-100 rounded-xl">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity size={18} className="text-brand-600" />
                <div>
                  <h3 className="text-sm font-bold text-brand-800">Order Volume Heatmap</h3>
                  <p className="text-xs text-brand-400 mt-0.5">{htSubs[htTab]}</p>
                </div>
              </div>
            </div>
            <Heatmap tab={htTab} trendData={trend} />
            <div className="mt-3 pt-3 border-t border-brand-100 flex items-center justify-between gap-3">
              <div className="flex items-start gap-2 flex-1 min-w-0">
                <span className="text-[10px] mt-0.5 shrink-0">💡</span>
                <p className="text-[11px] text-brand-400 leading-relaxed">{htDescs[htTab]}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[10px] text-brand-400">Low</span>
                <div className="flex gap-1">
                  {[0.1,0.3,0.55,0.75,0.92].map(op => (
                    <div key={op} className="w-3 h-3 rounded-sm" style={{ background:`rgba(92,51,23,${op})` }} />
                  ))}
                </div>
                <span className="text-[10px] text-brand-400">High</span>
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-white border border-brand-100 rounded-xl flex flex-col">
            <div className="mb-4 flex items-center gap-2">
              <ShoppingBag size={18} className="text-brand-600" />
              <div>
                <h3 className="text-sm font-bold text-brand-800">Top 5 Products</h3>
                <p className="text-xs text-brand-400 mt-0.5">Pinakamabentang items · {VIEW_PERIOD_LABEL[view]}</p>
              </div>
            </div>
            <div className="flex flex-col gap-3 flex-1 justify-between">
              {topProds.map((p, i) => {
                const pct = Math.round((p.sold / maxSold) * 100);
                const totalSold = topProds.reduce((s, x) => s + x.sold, 0);
                const share = Math.round((p.sold / totalSold) * 100);
                return (
                  <div key={p.name}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-extrabold shrink-0 ${rankCls[i]}`}>{i+1}</div>
                      <span className="text-[13px] text-brand-800 font-semibold flex-1 truncate">{p.name}</span>
                      <span className="text-[14px] font-bold text-brand-900 tabular-nums">{p.sold.toLocaleString()}<span className="text-[10px] text-brand-400 font-normal ml-0.5">pcs</span></span>
                    </div>
                    <div className="h-1.5 bg-brand-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width:`${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* ACTUAL VS FORECAST CHART ONLY */}
        <Card className="p-5 bg-white border border-brand-100 rounded-xl">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart2 size={18} className="text-brand-600" />
              <div>
                <h3 className="text-sm font-bold text-brand-800">Actual vs. Forecast</h3>
                <p className="text-xs text-brand-400 mt-0.5">Solid = actual data · dashed = projected · {avfTab === 'All Time' ? 'taon' : VIEW_PERIOD_LABEL[avfTab] || avfTab.toLowerCase()}</p>
              </div>
            </div>
            <Tabs value={avfTab} onChange={setAvfTab} options={AVF_VIEWS} />
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={avfChartData} margin={{ top:8, right:12, left:0, bottom:0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="label" tick={axisStyle} axisLine={{ stroke:'#e2e8f0' }} tickLine={false} dy={10} />
              <YAxis tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={fmtAxis} width={65} />
              <Tooltip content={<ChartTooltip />} cursor={{ stroke:'#e2e8f0', strokeWidth:1.5 }} />
              <Line type="monotone" dataKey="Actual Sales"       name="Actual Sales"       stroke="#3b82f6" strokeWidth={2.5} dot={{ r:4, fill:'#fff', strokeWidth:2 }} activeDot={{ r:6 }} connectNulls={false} />
              <Line type="monotone" dataKey="Actual Expenses"    name="Actual Expenses"    stroke="#f43f5e" strokeWidth={2.5} dot={{ r:4, fill:'#fff', strokeWidth:2 }} activeDot={{ r:6 }} connectNulls={false} />
              <Line type="monotone" dataKey="Forecast Sales"     name="Forecast Sales"     stroke="#93c5fd" strokeWidth={2}   strokeDasharray="6 4" dot={{ r:3, fill:'#fff', strokeWidth:1.5 }} connectNulls={false} />
              <Line type="monotone" dataKey="Forecast Expenses"  name="Forecast Expenses"  stroke="#fda4af" strokeWidth={2}   strokeDasharray="6 4" dot={{ r:3, fill:'#fff', strokeWidth:1.5 }} connectNulls={false} />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-5 mt-3 pt-3 border-t border-brand-100 flex-wrap">
            <span className="flex items-center gap-1.5 text-xs text-brand-500 font-semibold"><span className="w-5 h-0.5 bg-blue-500 inline-block rounded"/><span>Actual Sales</span></span>
            <span className="flex items-center gap-1.5 text-xs text-brand-400"><span className="w-5 inline-block" style={{ borderTop:'2px dashed #93c5fd' }}/><span>Forecast Sales</span></span>
            <span className="w-px h-4 bg-brand-200 mx-1" />
            <span className="flex items-center gap-1.5 text-xs text-brand-500 font-semibold"><span className="w-5 h-0.5 bg-rose-500 inline-block rounded"/><span>Actual Expenses</span></span>
            <span className="flex items-center gap-1.5 text-xs text-brand-400"><span className="w-5 inline-block" style={{ borderTop:'2px dashed #fda4af' }}/><span>Forecast Expenses</span></span>
          </div>
        </Card>

        {/* AI BUSINESS INSIGHTS HUB & SMART FORECAST (COMBINED LAYOUT) */}
        <div className="mt-8 pt-6 border-t-2 border-brand-100 border-dashed">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div className="flex items-center gap-2.5">
              <div className="bg-gradient-to-br from-brand-100 to-brand-50 p-2 rounded-xl text-brand-700 shadow-sm border border-brand-200">
                <BrainCircuit size={22} />
              </div>
              <div>
                <h2 className="text-xl font-black text-brand-900 tracking-tight">AI Business Insights & Forecast</h2>
                
              </div>
            </div>
            
            <button 
              onClick={() => fetchGoogleAIInsights(true)}
              disabled={isAiLoading}
              className="flex items-center justify-center gap-2 px-5 py-2.5 text-[13px] font-bold text-white bg-gradient-to-r from-[#5C3317] to-[#7A4520] hover:from-[#4a2912] hover:to-[#5C3317] rounded-xl transition-all shadow-md disabled:opacity-70 shrink-0"
            >
              <RefreshCw size={15} className={isAiLoading ? "animate-spin" : ""} />
              {isAiLoading ? 'Analyzing Data...' : 'Generate New Insights'}
            </button>
          </div>

          {isAiLoading ? (
            <div className="h-64 flex flex-col items-center justify-center bg-white border border-brand-200 rounded-2xl shadow-sm">
              <RefreshCw size={32} className="text-brand-300 animate-spin mb-4" />
              <p className="text-brand-600 font-bold animate-pulse text-[15px]">Sinusuri ng AI ang iyong data...</p>
            </div>
          ) : aiError ? (
            <div className="p-5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-700 shadow-sm">
              <Activity size={20} />
              <p className="text-sm font-semibold">{aiError}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              
              {/* PERFORMANCE SUMMARY (FULL WIDTH SA TAAS) */}
              {aiData && (
                <div className="lg:col-span-3 bg-gradient-to-br from-brand-50/80 to-white border border-brand-200 rounded-2xl p-6 shadow-sm relative overflow-hidden group">
                  <div className="relative z-10">
                    <h3 className="text-[12px] font-black text-brand-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Lightbulb size={16} className="text-amber-500" /> Performance Summary
                    </h3>
                    <p className="text-[14px] text-brand-800 leading-relaxed font-medium max-w-6xl">
                      {aiData.descriptive}
                    </p>
                  </div>
                </div>
              )}

              {/* COLUMN 1: SMART FORECAST ANALYSIS */}
              <div className="lg:col-span-1 bg-white border border-brand-200 rounded-2xl shadow-sm flex flex-col p-4">
                
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="p-1.5 bg-brand-50 rounded-lg text-brand-800">
                    <TrendingUp size={16} />
                  </div>
                  <div>
                    <h3 className="text-[12px] font-black text-brand-800 uppercase tracking-widest leading-none mb-1">Smart Forecast Analysis</h3>
                    <span className="text-brand-800 font-bold bg-brand-100 px-1.5 py-0.5 rounded-md text-[10px]">
                      {view === 'Day' ? 'Next Day' : view === 'Week' ? 'Next Week' : view === 'Month' ? 'Next Month' : 'Next Year'}
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-col flex-1 gap-2">

                  {/* Growth — flex-1 so rows stretch evenly */}
                  <div className="flex flex-col flex-1">
                    <h4 className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" /> Lumalagong Products
                    </h4>
                    <div className="flex flex-col flex-1 gap-1.5">
                      {ANALYTICS.predictive.growthLeaders[vk].map((item, i) => {
                        const calculatedPcs = item.diff !== undefined ? item.diff : Math.max(1, Math.round((item.forecast || 50) * (item.pct / 100)));
                        return (
                          <div key={i} className="flex items-center justify-between flex-1 px-3 py-0 border border-emerald-100 bg-emerald-50/30 rounded-lg gap-2 min-h-[44px]">
                            <div className="min-w-0 flex-1">
                              <p className="text-[12px] font-bold text-brand-900 truncate">{item.name}</p>
                              <p className="text-[10px] text-emerald-600 font-semibold">+{calculatedPcs} pcs</p>
                            </div>
                            <MiniSparkline trend="up" />
                            <span className="shrink-0 px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[11px] font-extrabold rounded-md">+{item.pct}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* At Risk — flex-1 so rows stretch evenly */}
                  <div className="flex flex-col flex-1">
                    <h4 className="text-[10px] font-bold text-rose-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" /> At Risk Products
                    </h4>
                    <div className="flex flex-col flex-1 gap-1.5">
                      {ANALYTICS.predictive.atRisk[vk].map((item, i) => {
                        const calculatedPcs = item.diff !== undefined ? Math.abs(item.diff) : Math.max(1, Math.round((item.forecast || 40) * (Math.abs(item.pct) / 100)));
                        return (
                          <div key={i} className="flex items-center justify-between flex-1 px-3 py-0 border border-rose-100 bg-rose-50/30 rounded-lg gap-2 min-h-[44px]">
                            <div className="min-w-0 flex-1">
                              <p className="text-[12px] font-bold text-brand-900 truncate">{item.name}</p>
                              <p className="text-[10px] text-rose-600 font-semibold">-{calculatedPcs} pcs</p>
                            </div>
                            <MiniSparkline trend="down" />
                            <span className="shrink-0 px-2 py-0.5 bg-rose-100 text-rose-800 text-[11px] font-extrabold rounded-md">{item.pct}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              </div>

              {/* COLUMN 2: ACTIONABLE RECOMMENDATIONS — simple 1 col */}
              {aiData && (
                <div className="lg:col-span-2 bg-white border border-brand-200 rounded-2xl shadow-sm flex flex-col overflow-hidden">
                  <div className="px-5 py-3 border-b border-brand-100 flex items-center gap-2">
                    <Sparkles size={15} className="text-brand-500" />
                    <h3 className="text-[12px] font-black text-brand-700 uppercase tracking-widest">Actionable Recommendations</h3>
                  </div>
                  <div className="p-4 flex flex-col gap-3">
                    {aiData.prescriptive.map((ins, i) => {
                      const theme = AI_COLORS[ins.type] || AI_COLORS.neutral;
                      return (
                        <div
                          key={i}
                          className="border border-slate-200 rounded-xl p-4"
                          style={{ borderLeft: `3px solid ${theme.color}` }}
                        >
                          <span
                            className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md mb-2 inline-block"
                            style={{ background: theme.tagBg, color: theme.tagTxt }}
                          >
                            {ins.badge}
                          </span>
                          <h4 className="text-[13px] font-bold text-brand-900 mb-1 leading-snug">{ins.title}</h4>
                          <p className="text-[12px] text-brand-500 leading-relaxed">{ins.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>

      </div>
    );
  }