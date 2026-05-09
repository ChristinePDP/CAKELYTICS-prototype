import { useState, useMemo } from 'react';
import { Trash2, AlertTriangle, Search, Filter, Archive } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast, Button, Modal, Input, Select, Textarea, Table, Tr, Td, Pagination, Badge, Card, ConfirmModal } from '../../components/ui';

const PER_PAGE = 10;

export default function WasteTab() {
  const { 
    wasteLogs = [], 
    ingredients = [], 
    products = [], 
    materials = [], 
    logWaste, 
    deleteWasteLog 
  } = useApp() || {};
  
  const { show: showToast } = useToast();
  
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [wasteType, setWasteType] = useState('ingredient'); // 'ingredient', 'product', o 'material'
  
  // States para sa Inputs
  const [targetIdx, setTargetIdx] = useState(0);
  const [qty, setQty] = useState('');
  const [reason, setReason] = useState('Spoiled');
  const [notes, setNotes] = useState('');
  const [productName, setProductName] = useState('');
  const [productQty, setProductQty] = useState('');
  const [productUnit, setProductUnit] = useState('pcs');

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [search, setSearch]     = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterDate, setFilterDate] = useState('All');

  // Reasons para sa bawat type ng waste
  const REASONS = {
    ingredient: ['Spoiled', 'Broken', 'Expired', 'Contaminated', 'Other'],
    material: ['Popped/Butas', 'Torn/Punit', 'Defective Print', 'Broken', 'Other'],
    product: ['Unsold', 'Spoiled', 'Damaged', 'Other']
  };

  const reasonColor = { 
    Spoiled: 'danger', Expired: 'warning', Contaminated: 'danger',
    Unsold: 'preorder', Damaged: 'warning',
    'Popped/Butas': 'danger', 'Torn/Punit': 'warning', 'Defective Print': 'danger',
    Broken: 'warning', Other: 'default' 
  };

  const filteredLogs = useMemo(() => {
    return wasteLogs.filter(log => {
      if (search && !log.item.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterType !== 'All' && log.type !== filterType.toLowerCase()) return false;
      if (filterDate === 'Today') {
        const today = new Date().toISOString().split('T')[0];
        return log.dt?.includes(today);
      }
      if (filterDate === 'This Week') {
        if (!log.dt) return false;
        const logDate = new Date(log.dt);
        const diffTime = Math.abs(new Date() - logDate);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) <= 7;
      }
      return true;
    });
  }, [wasteLogs, search, filterType, filterDate]);

  const totalWasteCost = filteredLogs.reduce((sum, log) => sum + (log.cost || 0), 0);
  const paged = filteredLogs.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleLog = () => {
    if (wasteType === 'ingredient') {
      const ing = ingredients[targetIdx];
      if (!ing || !qty) return;
      const estCost = (ing.costPerUnit || ing.price || 0) * parseFloat(qty);
      logWaste({ type: 'ingredient', item: ing.name, qty: `${qty} ${ing.unit}`, rawQty: parseFloat(qty), reason, notes, cost: estCost });
      showToast(`Waste logged: −${qty} ${ing.unit} of ${ing.name}.`);
    } 
    else if (wasteType === 'material') {
      const mat = materials[targetIdx];
      if (!mat || !qty) return;
      const estCost = (mat.costPerUnit || mat.price || 0) * parseFloat(qty);
      logWaste({ type: 'material', item: mat.name, qty: `${qty} ${mat.unit}`, rawQty: parseFloat(qty), reason, notes, cost: estCost });
      showToast(`Material waste logged: −${qty} ${mat.unit} of ${mat.name}.`);
    } 
    else {
      if (!productName || !productQty) return;
      const prod = products.find(p => p.name === productName);
      const estCost = (prod?.price || prod?.estimatedCost || 0) * parseFloat(productQty);
      logWaste({ type: 'product', item: productName, qty: `${productQty} ${productUnit}`, rawQty: parseFloat(productQty), reason: reason || 'Unsold', notes, cost: estCost });
      showToast('Product waste logged.');
    }
    setModalOpen(false); 
    setQty(''); 
    setNotes(''); 
    setProductName(''); 
    setProductQty('');
    setTargetIdx(0); 
  };

  // IBINALIK KO NA ITO: Function para mag-delete ng log
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
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 flex items-center gap-4 bg-gradient-to-br from-red-50 to-white border-red-100 shadow-sm">
          
          <div>
            <p className="text-[12px] font-bold text-red-800 uppercase tracking-wider mb-0.5">Total Lost Value</p>
            <p className="text-2xl font-black text-red-900 tracking-tight">₱{totalWasteCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4 border-brand-100 shadow-sm">
          
          <div>
            <p className="text-[12px] font-bold text-brand-800 uppercase tracking-wider mb-0.5">Total Instances</p>
            <p className="text-2xl font-black text-brand-900 tracking-tight">{filteredLogs.length}</p>
          </div>
        </Card>
      </div>

      {/* ─── WASTE LOG TAB ─── */}
      <Card>
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between p-4 border-b border-brand-100 gap-4">
          <div>
            <h3 className="font-bold text-brand-800">Waste & Spoilage Log</h3>
            <p className="text-xs text-brand-400 mt-0.5">I-monitor ang mga natapon, nasira, at hindi nabentang items.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" onClick={() => { setWasteType('ingredient'); setReason('Spoiled'); setTargetIdx(0); setModalOpen(true); }} className="text-xs py-1.5">
              <Trash2 size={13} /> Ingredient
            </Button>
            <Button variant="secondary" onClick={() => { setWasteType('material'); setReason('Popped/Butas'); setTargetIdx(0); setModalOpen(true); }} className="text-xs py-1.5">
              <Archive size={13} /> Material
            </Button>
            <Button variant="dark" onClick={() => { setWasteType('product'); setReason('Unsold'); setModalOpen(true); }} className="text-xs py-1.5 bg-red-600 hover:bg-red-700 border-none">
              Unsold Product
            </Button>
          </div>
        </div>

        {/* ─── FILTERS ─── */}
        <div className="bg-brand-50/50 p-3 px-4 flex flex-wrap items-center gap-3 border-b border-brand-100">
          {/* Search */}
          <div className="relative flex-1 min-w-[160px] max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-300" />
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search item..."
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-brand-200 rounded-lg outline-none focus:border-brand-400 bg-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-brand-400" />
            <select className="text-xs font-semibold bg-white border border-brand-200 rounded-md px-2 py-1 outline-none" value={filterType} onChange={(e) => { setFilterType(e.target.value); setPage(1); }}>
              <option value="All">All Types</option>
              <option value="Ingredient">Ingredients Only</option>
              <option value="Material">Materials Only</option>
              <option value="Product">Products Only</option>
            </select>
          </div>
        </div>

        {/* ─── MAIN TABLE ─── */}
        <Table columns={[{ label: 'Date' }, { label: 'Type' }, { label: 'Item Name' }, { label: 'Lost Qty' }, { label: 'Est. Cost' }, { label: 'Reason' }, { label: 'Notes' }, { label: 'Action', align: 'right' }]}>
          {paged.map(w => (
            <Tr key={w.id} className="hover:bg-brand-50/30 transition-colors">
              <Td className="text-xs text-brand-500 whitespace-nowrap font-medium">{w.dt}</Td>
              <Td>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md 
                  ${w.type === 'ingredient' ? 'bg-blue-50 text-blue-600' : 
                    w.type === 'material' ? 'bg-amber-50 text-amber-600' : 'bg-purple-50 text-purple-600'}`}>
                  {w.type}
                </span>
              </Td>
              <Td className="font-bold text-brand-900">{w.item}</Td>
              <Td className="font-semibold text-brand-700">{w.qty}</Td>
              <Td className="text-red-600 font-semibold">₱{(w.cost || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</Td>
              <Td><Badge variant={reasonColor[w.reason] || 'default'}>{w.reason}</Badge></Td>
              <Td className="text-xs text-brand-500 max-w-[150px] truncate" title={w.notes}>{w.notes || '—'}</Td>
              <Td align="right">
                <button onClick={() => setDeleteTarget(w)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded">
                  <Trash2 size={15} />
                </button>
              </Td>
            </Tr>
          ))}
          {!paged.length && <Tr><Td className="text-center text-brand-400 py-10 font-medium" colSpan={8}>No waste records found.</Td></Tr>}
        </Table>
        
        {filteredLogs.length > PER_PAGE && <div className="p-3 border-t border-brand-100"><Pagination page={page} count={filteredLogs.length} perPage={PER_PAGE} total="entries" onChange={setPage} /></div>}
      </Card>

      {/* ─── MODAL PARA SA LAHAT NG URI NG WASTE ─── */}
      <Modal
        isOpen={modalOpen} onClose={() => setModalOpen(false)}
        title={wasteType === 'ingredient' ? 'Log Ingredient Waste' : wasteType === 'material' ? 'Log Material Waste' : 'Log Unsold Product'}
        subtitle={wasteType === 'ingredient' ? 'I-deduct ang nasirang ingredients.' : wasteType === 'material' ? 'I-record ang pumutok na balloons, punit na tarp, atbp.' : 'I-record ang tinapay na hindi nabenta.'}
        size="sm"
        footer={
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleLog}>Confirm Log</Button>
          </div>
        }
      >
        {/* INGREDIENT O MATERIAL LAYOUT */}
        {(wasteType === 'ingredient' || wasteType === 'material') ? (
          <div className="space-y-4">
            <Select label={`Select ${wasteType === 'ingredient' ? 'Ingredient' : 'Material'}`} required value={targetIdx} onChange={e => setTargetIdx(Number(e.target.value))}>
              {(wasteType === 'ingredient' ? ingredients : materials).map((item, idx) => (
                <option key={item.id} value={idx}>{item.name} ({item.stock} {item.unit} available)</option>
              ))}
            </Select>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Quantity Lost" required type="number" value={qty} onChange={e => setQty(e.target.value)} min="0" step={wasteType === 'ingredient' ? '0.001' : '1'} />
              <Select label="Reason" required value={reason} onChange={e => setReason(e.target.value)}>
                {(REASONS[wasteType] || REASONS.ingredient).map(r => <option key={r}>{r}</option>)}
              </Select>
            </div>
            <Textarea label="Additional Notes" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Ano ang nangyari? Bakit na-waste?" rows={2} />
          </div>
        ) : (
          /* PRODUCT LAYOUT */
          <div className="space-y-4">
             <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-xs text-red-700 leading-relaxed font-medium">
              <AlertTriangle size={14} className="inline mr-1.5 mb-0.5" />
              Ang ingredients nito ay nabawas na nung ginawa ang recipe, wag na mag-double deduct.
            </div>
            <Select label="Select Product" required value={productName} onChange={e => {
              setProductName(e.target.value); setProductQty(''); setProductUnit('pcs');
            }}>
              <option value="">— Piliin ang product —</option>
              {products.filter(p => p.stock > 0).map(p => (
                <option key={p.id} value={p.name}>{p.name} (Current Stock: {p.stock} pcs)</option>
              ))}
            </Select>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Quantity" required type="number" value={productQty} onChange={e => setProductQty(e.target.value)} max={products.find(p => p.name === productName)?.stock || ''} />
              <Select label="Reason" required value={reason} onChange={e => setReason(e.target.value)}>
                {REASONS.product.map(r => <option key={r}>{r}</option>)}
              </Select>
            </div>
            <Textarea label="Additional Notes" value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g. 5 ensaymada left unsold..." rows={2} />
          </div>
        )}
      </Modal>

      <ConfirmModal 
        isOpen={!!deleteTarget} 
        onClose={() => setDeleteTarget(null)} 
        onConfirm={handleDelete} 
        title="Undo Waste Log" 
        message={`Burahin ang log para sa "${deleteTarget?.item}"?`} 
        confirmLabel="Delete" 
        variant="danger" 
      />
    </div>
  );
}