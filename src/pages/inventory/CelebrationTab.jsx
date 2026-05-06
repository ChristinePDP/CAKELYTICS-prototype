import { useState } from 'react';
import { Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast, Button, Modal, Input, Select, Table, Tr, Td, Pagination, Badge, Card, LevelBar, ConfirmModal } from '../../components/ui';
import { ingStatus } from '../../utils/inventoryHelpers';

const PER_PAGE = 10;

export default function CelebrationTab() {
  // NOTE: Siguraduhing may 'materials', 'addMaterial', 'updateMaterial', at 'deleteMaterial' sa AppContext
  const { materials = [], addMaterial, updateMaterial, deleteMaterial } = useApp();
  const { show: showToast } = useToast();
  const [page, setPage]             = useState(1);
  const [modalOpen, setModalOpen]   = useState(false);
  const [editMat, setEditMat]       = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const paged = materials.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleSave = (data, addedQty = 0, note = '') => {
    if (editMat?.id) {
      updateMaterial(editMat.id, data, addedQty, note);
      showToast(`+${addedQty} ${editMat.unit} na-add sa ${editMat.name}.`);
    } else {
      addMaterial(data);
      showToast('Celebration material added.');
    }
    setModalOpen(false);
  };

  const handleDelete = () => {
    deleteMaterial(deleteTarget.id);
    showToast(`${deleteTarget.name} deleted.`, 'warning');
  };

  return (
    <div className="space-y-5">
      <Card>
        <div className="flex items-center justify-between p-4 border-b border-brand-100">
          <div>
            <h3 className=" font-bold text-brand-800">Celebration Materials</h3>
            <p className="text-xs text-brand-400 mt-0.5">Mag-manage ng Balloons, Tarpaulin, at iba pang party add-ons.</p>
          </div>
          <Button variant="dark" onClick={() => { setEditMat(null); setModalOpen(true); }}>
            <Plus size={14} /> Add New Material
          </Button>
        </div>
        <Table columns={[
          { label: 'Item Name' },
          { label: 'Current Stock' },
          { label: 'Stock Level' },
          { label: 'Status' },
          { label: 'Actions', align: 'right' },
        ]}>
          {paged.map(mat => {
            const st = ingStatus(mat.stock, mat.min);
            return (
              <Tr key={mat.id}>
                <Td><strong>{mat.name}</strong></Td>
                <Td><strong>{mat.stock}</strong> {mat.unit}</Td>
                <Td><LevelBar stock={mat.stock} min={mat.min} /></Td>
                <Td><Badge variant={st.cls}>{st.label}</Badge></Td>
                <Td align="right">
                  <div className="flex gap-2 justify-end">
                    <Button size="sm" variant="secondary" onClick={() => { setEditMat(mat); setModalOpen(true); }}>Add Stock</Button>
                    <Button size="sm" variant="danger" onClick={() => setDeleteTarget(mat)}>Delete</Button>
                  </div>
                </Td>
              </Tr>
            );
          })}
          {!paged.length && (
            <Tr><Td colSpan={5} className="text-center py-8 text-brand-400">Walang naka-record na celebration materials.</Td></Tr>
          )}
        </Table>
        {materials.length > PER_PAGE && (
           <Pagination page={page} count={materials.length} perPage={PER_PAGE} total="materials" onChange={setPage} />
        )}
      </Card>

      <MaterialModal isOpen={modalOpen} onClose={() => setModalOpen(false)} material={editMat} onSave={handleSave} />
      
      <ConfirmModal
        isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Delete Material" message={`I-delete ang "${deleteTarget?.name}"?`}
        confirmLabel="Delete" variant="danger"
      />
    </div>
  );
}

// ─── Celebration Material Modal ───
function MaterialModal({ isOpen, onClose, material, onSave }) {
  const [stock, setStock] = useState('');
  const [min, setMin]     = useState(material?.min ?? '');
  const [cost, setCost]   = useState('');
  const isEdit = !!material?.id;

  useState(() => {
    setStock('');
    setMin(material?.min ?? '');
    setCost('');
  });

  const addedQty = parseFloat(stock) || 0;

  const handleSave = () => {
    if (!isEdit && !stock) return;
    const newStock = isEdit ? +(material.stock + addedQty).toFixed(4) : addedQty;
    onSave(
      { stock: newStock, min: parseFloat(min), costPerUnit: cost && addedQty ? parseFloat(cost) / addedQty : material?.costPerUnit || 0 },
      addedQty,
      isEdit ? 'Stock added' : 'Initial stock'
    );
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen} onClose={onClose}
      title={isEdit ? `Add Stock — ${material?.name}` : 'Add New Celebration Material'}
      subtitle={isEdit ? `Unit: ${material?.unit} · Current: ${material?.stock}` : 'I-record ang mga party materials kagaya ng balloons at tarpaulin.'}
      size="md"
      footer={
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSave} disabled={isEdit ? addedQty <= 0 : !stock}>
            {isEdit ? 'Add Stock' : 'Save Material'}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {!isEdit && (
          <div className="grid grid-cols-2 gap-4">
            <Input label="Item Name" required placeholder="e.g. Number Balloon" />
            <Select label="Unit" required>
              {['pcs', 'packs', 'sets', 'boxes'].map(u => <option key={u}>{u}</option>)}
            </Select>
          </div>
        )}
        {isEdit && (
          <div className="grid grid-cols-2 gap-3">
             <div className="flex flex-col gap-1"><span className="text-[11px] font-bold uppercase text-brand-400">Item Name</span><div className="px-3 py-2 bg-brand-50 border rounded-lg text-sm">{material?.name}</div></div>
             <div className="flex flex-col gap-1"><span className="text-[11px] font-bold uppercase text-brand-400">Unit</span><div className="px-3 py-2 bg-brand-50 border rounded-lg text-sm">{material?.unit}</div></div>
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          <Input label={isEdit ? `Quantity na Idadagdag` : 'Initial Stock Quantity'} required type="number" value={stock} onChange={e => setStock(e.target.value)} min="0" />
          <Input label="Minimum Stock Level" required type="number" value={min} onChange={e => setMin(e.target.value)} min="0" />
          <Input label="Total Cost (₱)" type="number" value={cost} onChange={e => setCost(e.target.value)} min="0" step="0.01" />
        </div>
      </div>
    </Modal>
  );
}