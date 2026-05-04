import { useState, useMemo } from 'react';
import { Trash2, AlertTriangle, DollarSign, TrendingDown, Calendar, Filter } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast, Button, Modal, Input, Select, Textarea, Table, Tr, Td, Pagination, Badge, Card, ConfirmModal } from '../../components/ui';

const PER_PAGE = 10;

export default function WasteTab() {
  // Assuming may deleteWasteLog sa context mo, kung wala pa, pwede mo siyang idagdag sa AppContext later.
  const { wasteLogs = [], ingredients = [], products = [], logWaste, deleteWasteLog } = useApp();
  const { show: showToast } = useToast();
  
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [wasteType, setWasteType] = useState('ingredient');
  
  // States for Inputs
  const [ingIdx, setIngIdx] = useState(0);
  const [qty, setQty] = useState('');
  const [reason, setReason] = useState('Spoiled');
  const [notes, setNotes] = useState('');
  const [productName, setProductName] = useState('');
  const [productQty, setProductQty] = useState('');
  const [productUnit, setProductUnit] = useState('pcs');

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Filter States
  const [filterType, setFilterType] = useState('All');
  const [filterDate, setFilterDate] = useState('All');

  const REASONS = ['Spoiled', 'Broken', 'Expired', 'Contaminated', 'Other'];
  const reasonColor = { Spoiled: 'danger', Broken: 'warning', Expired: 'warning', Unsold: 'preorder', Contaminated: 'danger', Other: 'default' };

  // ─── FILTERING LOGIC ───
  const filteredLogs = useMemo(() => {
    return wasteLogs.filter(log => {
      // 1. Filter by Type
      if (filterType !== 'All' && log.type !== filterType.toLowerCase()) return false;
      
      // 2. Filter by Date (Basic approximation for demo)
      if (filterDate === 'Today') {
        const today = new Date().toISOString().split('T')[0];
        return log.dt?.includes(today);
      }
      if (filterDate === 'This Week') {
        // Simplified check: assuming it's within the last 7 days
        const logDate = new Date(log.dt);
        const diffTime = Math.abs(new Date() - logDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 7;
      }
      
      return true;
    });
  }, [wasteLogs, filterType, filterDate]);

  // ─── KPI COMPUTATIONS ───
  const totalWasteCost = filteredLogs.reduce((sum, log) => sum + (log.cost || 0), 0);
  
  const mostWastedItem = useMemo(() => {
    if (filteredLogs.length === 0) return 'N/A';
    const counts = {};
    filteredLogs.forEach(log => {
      counts[log.item] = (counts[log.item] || 0) + 1;
    });
    return Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0];
  }, [filteredLogs]);

  const paged = filteredLogs.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // ─── HANDLERS ───
  const handleLog = () => {
    if (wasteType === 'ingredient') {
      const ing = ingredients[ingIdx];
      if (!ing || !qty) return;
      
      // Estima ng cost (assuming may price property ang ingredient)
      const estCost = (ing.price || 0) * parseFloat(qty);

      logWaste({ 
        type: 'ingredient', 
        item: ing.name, 
        qty: `${qty} ${ing.unit}`, 
        rawQty: parseFloat(qty), 
        reason, 
        notes,
        cost: estCost 
      });
      showToast(`Waste logged: −${qty} ${ing.unit} of ${ing.name}.`);
    } else {
      if (!productName || !productQty) return;
      
      const prod = products.find(p => p.name === productName);
      // Estima ng cost ng product (assuming may price/estimatedCost ang product)
      const estCost = (prod?.price || prod?.estimatedCost || 0) * parseFloat(productQty);

      logWaste({ 
        type: 'product', 
        item: productName, 
        qty: `${productQty} ${productUnit}`, 
        rawQty: parseFloat(productQty),
        reason: 'Unsold', 
        notes,
        cost: estCost
      });
      showToast('Unsold product logged.');
    }
    setModalOpen(false); setQty(''); setNotes(''); setProductName(''); setProductQty('');
  };

  const handleDelete = () => {
    if (deleteTarget && deleteWasteLog) {
      deleteWasteLog(deleteTarget.id);
      showToast('Waste log entry removed.', 'warning');
    }
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      
      {/* ─── KPI SUMMARY DASHBOARD ─── */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 flex items-center gap-4 bg-gradient-to-br from-red-50 to-white border-red-100">
          <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center text-red-600">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-[12px] font-bold text-red-800 uppercase tracking-wider mb-0.5">Total Lost Value</p>
            <p className="text-2xl font-black text-brand-900 tracking-tight">₱{totalWasteCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4 border-brand-100">
          <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
            <TrendingDown size={24} />
          </div>
          <div>
            <p className="text-[12px] font-bold text-amber-800 uppercase tracking-wider mb-0.5">Most Wasted Item</p>
            <p className="text-xl font-bold text-brand-900 tracking-tight truncate max-w-[150px]">{mostWastedItem}</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4 border-brand-100">
          <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center text-brand-600">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-[12px] font-bold text-brand-800 uppercase tracking-wider mb-0.5">Total Instances</p>
            <p className="text-2xl font-black text-brand-900 tracking-tight">{filteredLogs.length}</p>
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border-b border-brand-100 gap-4">
          <div>
            <h3 className="font-bold text-brand-800">Waste & Spoilage Log</h3>
            <p className="text-xs text-brand-400 mt-0.5">I-monitor ang mga natapon at hindi nabentang produkto.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" onClick={() => { setWasteType('ingredient'); setModalOpen(true); }} className="text-xs py-1.5">
              <Trash2 size={13} /> Log Ingredient Waste
            </Button>
            <Button variant="dark" onClick={() => { setWasteType('product'); setModalOpen(true); }} className="text-xs py-1.5 bg-red-600 hover:bg-red-700 border-none">
              Log Unsold Product
            </Button>
          </div>
        </div>

        {/* ─── FILTERS ─── */}
        <div className="bg-brand-50/50 p-3 px-4 flex items-center gap-4 border-b border-brand-100">
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-brand-400" />
            <select 
              className="text-xs font-semibold bg-white border border-brand-200 rounded-md px-2 py-1 outline-none focus:border-brand-400"
              value={filterType}
              onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
            >
              <option value="All">All Types</option>
              <option value="Ingredient">Ingredients Only</option>
              <option value="Product">Products Only</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-brand-400" />
            <select 
              className="text-xs font-semibold bg-white border border-brand-200 rounded-md px-2 py-1 outline-none focus:border-brand-400"
              value={filterDate}
              onChange={(e) => { setFilterDate(e.target.value); setPage(1); }}
            >
              <option value="All">All Time</option>
              <option value="Today">Today</option>
              <option value="This Week">This Week</option>
            </select>
          </div>
        </div>

        {/* ─── MAIN TABLE ─── */}
        <Table columns={[
          { label: 'Date & Time' }, 
          { label: 'Type' },
          { label: 'Item Name' },
          { label: 'Lost Qty' }, 
          { label: 'Est. Cost' }, 
          { label: 'Reason' }, 
          { label: 'Notes' },
          { label: 'Action', align: 'right' }
        ]}>
          {paged.map(w => (
            <Tr key={w.id} className="hover:bg-brand-50/30 transition-colors">
              <Td className="text-xs text-brand-500 whitespace-nowrap font-medium">{w.dt}</Td>
              <Td>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${w.type === 'ingredient' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                  {w.type}
                </span>
              </Td>
              <Td className="font-bold text-brand-900">{w.item}</Td>
              <Td className="font-semibold text-brand-700">{w.qty}</Td>
              <Td className="text-red-600 font-semibold">₱{(w.cost || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</Td>
              <Td><Badge variant={reasonColor[w.reason] || 'default'}>{w.reason}</Badge></Td>
              <Td className="text-xs text-brand-500 max-w-[150px] truncate" title={w.notes}>{w.notes || '—'}</Td>
              <Td align="right">
                <button 
                  onClick={() => setDeleteTarget(w)}
                  className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="Delete Entry"
                >
                  <Trash2 size={15} />
                </button>
              </Td>
            </Tr>
          ))}
          {!paged.length && (
            <Tr><Td className="text-center text-brand-400 py-10 font-medium" colSpan={8}>No waste records found for this filter.</Td></Tr>
          )}
        </Table>
        
        {filteredLogs.length > PER_PAGE && (
          <div className="p-3 border-t border-brand-100">
            <Pagination page={page} count={filteredLogs.length} perPage={PER_PAGE} total="entries" onChange={setPage} />
          </div>
        )}
      </Card>

      {/* ─── MODALS ─── */}
      <Modal
        isOpen={modalOpen} onClose={() => setModalOpen(false)}
        title={wasteType === 'ingredient' ? 'Log Ingredient Waste' : 'Log Unsold Product'}
        subtitle={wasteType === 'ingredient' ? 'I-deduct ang mga nasira o natapong ingredients sa inventory.' : 'I-record ang mga tinapay na hindi nabenta sa dulo ng araw.'}
        size="sm"
        footer={
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleLog}>Confirm & Log Waste</Button>
          </div>
        }
      >
        {wasteType === 'ingredient' ? (
          <div className="space-y-4">
            <Select label="Select Ingredient" required value={ingIdx} onChange={e => setIngIdx(Number(e.target.value))}>
              {ingredients.map((i, idx) => <option key={i.id} value={idx}>{i.name} ({i.stock} {i.unit} available)</option>)}
            </Select>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Quantity Lost" required type="number" value={qty} onChange={e => setQty(e.target.value)} placeholder="0" min="0.001" step="0.001" />
              <Select label="Reason" required value={reason} onChange={e => setReason(e.target.value)}>
                {REASONS.map(r => <option key={r}>{r}</option>)}
              </Select>
            </div>
            <Textarea label="Additional Notes" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Bakit natapon? (e.g. Nahulog ang tray, napanis...)" rows={2} />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-xs text-red-700 leading-relaxed font-medium">
              <AlertTriangle size={14} className="inline mr-1.5 mb-0.5" />
              Ang unsold products ay hindi na ibebenta kinabukasan. Ang ingredients nito ay nabawas na nung ginawa ang recipe.
            </div>
            
            <Select label="Select Product" required value={productName} onChange={e => {
              const prod = products.find(p => p.name === e.target.value);
              setProductName(e.target.value);
              setProductQty('');
              setProductUnit('pcs');
            }}>
              <option value="">— Piliin ang product —</option>
              {products.filter(p => p.stock > 0 && p.active).map(p => (
                <option key={p.id} value={p.name}>
                  {p.name} (Current Stock: {p.stock} pcs)
                </option>
              ))}
            </Select>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Input
                  label="Quantity na Na-waste"
                  required
                  type="number"
                  value={productQty}
                  onChange={e => setProductQty(e.target.value)}
                  min="1"
                  max={products.find(p => p.name === productName)?.stock || undefined}
                  className="font-bold text-red-600"
                />
                {productName && (
                  <p className="text-[10px] font-bold text-brand-500 mt-1 flex justify-between">
                    <span>Available:</span>
                    <span className="text-brand-800">{products.find(p => p.name === productName)?.stock || 0} pcs</span>
                  </p>
                )}
              </div>
              <Input label="Unit" value={productUnit} onChange={e => setProductUnit(e.target.value)} placeholder="pcs, slices..." />
            </div>
            <Textarea label="Additional Notes" value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g. 5 ensaymada left unsold after closing..." rows={2} />
          </div>
        )}
      </Modal>

      <ConfirmModal
        isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Undo Waste Log" message={`Gusto mo bang burahin ang log na ito para sa "${deleteTarget?.item}"?`}
        confirmLabel="Yes, Delete Log" variant="danger"
      />
    </div>
  );
}