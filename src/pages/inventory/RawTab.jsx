import { useState } from 'react';
import { Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast, Button, Modal, Input, Select, Table, Tr, Td, Pagination, Badge, Card, LevelBar, ConfirmModal } from '../../components/ui';
import { ingStatus } from '../../utils/inventoryHelpers';

const PER_PAGE = 10;

export default function RawTab() {
  const { ingredients, addIngredient, updateIngredient, deleteIngredient } = useApp();
  const { show: showToast } = useToast();
  const [page, setPage]             = useState(1);
  const [modalOpen, setModalOpen]   = useState(false);
  const [editIng, setEditIng]       = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const total = ingredients.length;
  const low   = ingredients.filter(i => i.stock < i.min * 2).length;
  const paged = ingredients.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleSave = (data, addedQty = 0, note = '') => {
    if (editIng?.id) {
      updateIngredient(editIng.id, data, addedQty, note);
      showToast(`+${addedQty} ${editIng.unit} na-add sa ${editIng.name}.`);
    } else {
      addIngredient(data);
      showToast('Ingredient added.');
    }
    setModalOpen(false);
  };

  const handleDelete = () => {
    deleteIngredient(deleteTarget.id);
    showToast(`${deleteTarget.name} deleted.`, 'warning');
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        {[
          ['Total Ingredients', total, ''],
          ['Low Stock',         low,   'danger'],
        ].map(([label, val, color]) => (
          <Card key={label} className="p-5">
            <p className={`text-[11px] font-bold uppercase tracking-wider mb-2 ${
              color === 'danger' ? 'text-red-500' : 'text-brand-400'
            }`}>{label}</p>
            <p className={`font-serif text-3xl font-bold ${
              color === 'danger' ? 'text-red-600' : 'text-brand-800'
            }`}>{val}</p>
          </Card>
        ))}
      </div>

      <Card>
        <div className="flex items-center justify-between p-4 border-b border-brand-100">
          <div>
            <h3 className="font-serif font-bold text-brand-800">Raw Ingredients</h3>
            <p className="text-xs text-brand-400 mt-0.5">Low = below 2× minimum stock. Enough = at or above 2× minimum.</p>
          </div>
          <Button variant="dark" onClick={() => { setEditIng(null); setModalOpen(true); }}>
            <Plus size={14} /> Add New Ingredient
          </Button>
        </div>
        <Table columns={[
          { label: 'Ingredient' },
          { label: 'Current Stock' },
          { label: 'Stock Level' },
          { label: 'Status' },
          { label: 'Actions', align: 'right' },
        ]}>
          {paged.map(ing => {
            const st = ingStatus(ing.stock, ing.min);
            return (
              <Tr key={ing.id}>
                <Td><strong>{ing.name}</strong></Td>
                <Td><strong>{ing.stock}</strong> {ing.unit}</Td>
                <Td><LevelBar stock={ing.stock} min={ing.min} /></Td>
                <Td><Badge variant={st.cls}>{st.label}</Badge></Td>
                <Td align="right">
                  <div className="flex gap-2 justify-end">
                    <Button size="sm" variant="secondary" onClick={() => { setEditIng(ing); setModalOpen(true); }}>Add Stock</Button>
                    <Button size="sm" variant="danger" onClick={() => setDeleteTarget(ing)}>Delete</Button>
                  </div>
                </Td>
              </Tr>
            );
          })}
        </Table>
        <Pagination page={page} count={ingredients.length} perPage={PER_PAGE} total="ingredients" onChange={setPage} />
      </Card>

      <IngredientModal isOpen={modalOpen} onClose={() => setModalOpen(false)} ingredient={editIng} onSave={handleSave} />
      <ConfirmModal
        isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Delete Ingredient" message={`Delete "${deleteTarget?.name}"?`}
        confirmLabel="Delete" variant="danger"
      />
    </div>
  );
}

// ─── Ingredient Modal ─────────────────────────────────────────
function IngredientModal({ isOpen, onClose, ingredient, onSave }) {
  const [stock, setStock] = useState('');
  const [min, setMin]     = useState(ingredient?.min ?? '');
  const [cost, setCost]   = useState('');
  const [note, setNote]   = useState('');
  const [histOpen, setHistOpen] = useState(false);
  const isEdit = !!ingredient?.id;

  // Reset fields when modal opens/closes or ingredient changes
  useState(() => {
    setStock('');
    setMin(ingredient?.min ?? '');
    setCost('');
    setNote('');
  });

  const addedQty = parseFloat(stock) || 0;

  const handleSave = () => {
    if (!isEdit && !stock) return;
    if (isNaN(parseFloat(min))) return;
    const newStock = isEdit
      ? +(ingredient.stock + addedQty).toFixed(4)
      : addedQty;
    onSave(
      { stock: newStock, min: parseFloat(min), costPerUnit: cost && addedQty ? parseFloat(cost) / addedQty : ingredient?.costPerUnit || 0 },
      addedQty,
      note || (isEdit ? 'Stock added' : 'Initial stock'),
    );
    onClose();
  };

  const LOG_TYPE_STYLE = {
    initial:  { bg: 'bg-blue-50',   text: 'text-blue-700',   label: 'Initial'  },
    restock:  { bg: 'bg-green-50',  text: 'text-green-700',  label: 'Restock'  },
    deducted: { bg: 'bg-amber-50',  text: 'text-amber-700',  label: 'Ginamit'  },
    waste:    { bg: 'bg-red-50',    text: 'text-red-700',    label: 'Waste'    },
  };

  return (
    <Modal
      isOpen={isOpen} onClose={onClose}
      title={isEdit ? `Add Stock — ${ingredient?.name}` : 'Add New Ingredient'}
      subtitle={isEdit
        ? `Unit: ${ingredient?.unit} · Current stock: ${ingredient?.stock} ${ingredient?.unit}`
        : 'I-declare ang pangalan, unit, at initial stock ng ingredient.'}
      size="md"
      footer={
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSave}
            disabled={isEdit ? addedQty <= 0 : !stock}>
            {isEdit ? 'Add Stock' : 'Save Ingredient'}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">

        {/* Add mode: name + unit fields (free input) */}
        {!isEdit && (
          <div className="grid grid-cols-2 gap-4">
            <Input label="Ingredient Name" required
              placeholder="e.g. Eggs"
              id="ing-name-input"
            />
            <Select label="Unit" required id="ing-unit-input">
              {['kg','g','L','ml','pcs','trays','packs','cups'].map(u => <option key={u}>{u}</option>)}
            </Select>
          </div>
        )}

        {/* Edit mode: locked name + unit display */}
        {isEdit && (
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-400">Ingredient Name</span>
              <div className="px-3 py-2 bg-brand-50 border border-brand-200 rounded-lg text-sm text-brand-700 font-semibold">
                {ingredient?.name}
              </div>
              <span className="text-[11px] text-brand-400">Hindi na mababago</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-400">Unit</span>
              <div className="px-3 py-2 bg-brand-50 border border-brand-200 rounded-lg text-sm text-brand-700 font-semibold">
                {ingredient?.unit}
              </div>
              <span className="text-[11px] text-brand-400">Hindi na mababago</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Input
            label={isEdit ? `Quantity na Idadagdag (${ingredient?.unit})` : 'Initial Stock Quantity'}
            required
            hint={isEdit ? `Bago: ${ingredient?.stock} + ${addedQty || 0} = ${+(ingredient?.stock + addedQty).toFixed(4)} ${ingredient?.unit}` : 'Initial stock amount'}
            type="number" value={stock} onChange={e => setStock(e.target.value)}
            placeholder="0" min="0" step="0.001"
          />
          <Input label="Minimum Stock Level" required hint="Below 2× this = Low"
            type="number" value={min} onChange={e => setMin(e.target.value)}
            placeholder="0" min="0" step="0.001" />
          <Input label="Total Cost ng Dinagdag (₱)" hint="Para sa cost tracking"
            type="number" value={cost} onChange={e => setCost(e.target.value)}
            placeholder="0.00" min="0" step="0.01" />
          
        </div>

        {/* Stock Ledger — edit mode only */}
        {isEdit && (
          <div className="border border-brand-200 rounded-xl overflow-hidden">
            <button
              onClick={() => setHistOpen(h => !h)}
              className="w-full flex items-center justify-between p-3 bg-brand-50 text-sm font-semibold text-brand-700 hover:bg-brand-100 transition-colors"
            >
              <span>Stock Ledger — Kasaysayan ng Stock</span>
              {histOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>
            {histOpen && (
              <div className="divide-y divide-brand-100 max-h-52 overflow-y-auto">
                {(ingredient?.stockLog || []).length === 0 ? (
                  <p className="p-3 text-xs text-brand-400 italic">Walang naitalang history.</p>
                ) : (
                  (ingredient?.stockLog || []).map((entry, i) => {
                    const s = LOG_TYPE_STYLE[entry.type] || { bg: 'bg-gray-50', text: 'text-gray-700', label: entry.type };
                    const isDeduction = entry.type === 'deducted' || entry.type === 'waste';
                    return (
                      <div key={i} className="flex items-start gap-3 px-4 py-2.5 hover:bg-brand-50/50">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5 shrink-0 ${s.bg} ${s.text}`}>
                          {s.label}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-brand-500">{entry.note || '—'}</p>
                          <p className="text-[11px] text-brand-400 mt-0.5">{entry.dt}</p>
                        </div>
                        <span className={`text-sm font-bold shrink-0 ${isDeduction ? 'text-red-600' : 'text-green-600'}`}>
                          {isDeduction ? '−' : '+'}{entry.qty} {entry.unit}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}