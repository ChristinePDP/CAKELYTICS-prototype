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

// ─── Ingredient Modal ───
// (Gawin mong exact copy yung dating <IngredientModal> mo rito, walang nabago sa logic ng modal na ito)
function IngredientModal({ isOpen, onClose, ingredient, onSave }) {
  const [stock, setStock] = useState('');
  const [min, setMin]     = useState(ingredient?.min ?? '');
  const [cost, setCost]   = useState('');
  const [note, setNote]   = useState('');
  const [histOpen, setHistOpen] = useState(false);
  const isEdit = !!ingredient?.id;

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
    const newStock = isEdit ? +(ingredient.stock + addedQty).toFixed(4) : addedQty;
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
      subtitle={isEdit ? `Unit: ${ingredient?.unit} · Current stock: ${ingredient?.stock} ${ingredient?.unit}` : 'I-declare ang pangalan, unit, at initial stock ng ingredient.'}
      size="md"
      footer={
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSave} disabled={isEdit ? addedQty <= 0 : !stock}>
            {isEdit ? 'Add Stock' : 'Save Ingredient'}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {!isEdit && (
          <div className="grid grid-cols-2 gap-4">
            <Input label="Ingredient Name" required placeholder="e.g. Eggs" />
            <Select label="Unit" required>{['kg','g','L','ml','pcs','trays','packs','cups'].map(u => <option key={u}>{u}</option>)}</Select>
          </div>
        )}
        {isEdit && (
          <div className="grid grid-cols-2 gap-3">
             <div className="flex flex-col gap-1"><span className="text-[11px] font-bold uppercase text-brand-400">Ingredient Name</span><div className="px-3 py-2 bg-brand-50 border rounded-lg text-sm">{ingredient?.name}</div></div>
             <div className="flex flex-col gap-1"><span className="text-[11px] font-bold uppercase text-brand-400">Unit</span><div className="px-3 py-2 bg-brand-50 border rounded-lg text-sm">{ingredient?.unit}</div></div>
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          <Input label={isEdit ? `Quantity na Idadagdag` : 'Initial Stock Quantity'} required type="number" value={stock} onChange={e => setStock(e.target.value)} min="0" step="0.001" />
          <Input label="Minimum Stock Level" required type="number" value={min} onChange={e => setMin(e.target.value)} min="0" step="0.001" />
          <Input label="Total Cost (₱)" type="number" value={cost} onChange={e => setCost(e.target.value)} min="0" step="0.01" />
        </div>
      </div>
    </Modal>
  );
}