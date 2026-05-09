import { useMemo, useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Table, Tr, Td, Card, Pagination } from '../../components/ui';

const PER_PAGE = 10;

export default function ProductLogTab() {
  const { productionLogs = [] } = useApp();

  const [page, setPage]         = useState(1);
  const [search, setSearch]     = useState('');
  const [filterDate, setFilterDate] = useState('All');

  const filtered = useMemo(() => {
    return productionLogs.filter(pl => {
      // Search filter
      if (search && !pl.product.toLowerCase().includes(search.toLowerCase())) return false;

      // Date filter
      if (filterDate === 'Today') {
        const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        return pl.dt?.includes(today.split(',')[0]) && pl.dt?.includes(today.split(', ')[1]);
      }
      if (filterDate === 'This Week') {
        if (!pl.dt) return false;
        const logDate = new Date(pl.dt);
        const diffTime = Math.abs(new Date() - logDate);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) <= 7;
      }
      if (filterDate === 'This Month') {
        if (!pl.dt) return false;
        const now = new Date();
        const logDate = new Date(pl.dt);
        return logDate.getMonth() === now.getMonth() && logDate.getFullYear() === now.getFullYear();
      }
      return true;
    });
  }, [productionLogs, search, filterDate]);

  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="space-y-5">
      <Card>
        {/* ─── HEADER: matches RawTab style ─── */}
        <div className="flex items-center justify-between p-4 border-b border-brand-100">
          <div>
            <h3 className=" font-bold text-brand-800">Product Log</h3>
            <p className="text-xs text-brand-400 mt-0.5">
              Lahat ng na-confirm na batch production. Reference ito bago mag-log ng unsold sa Waste Log.
            </p>
          </div>
        </div>

        {/* ─── SEARCH + DATE FILTER ─── */}
        <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-brand-100 bg-brand-50/40">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-300" />
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search product..."
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-brand-200 rounded-lg outline-none focus:border-brand-400 bg-white"
            />
          </div>

          {/* Date Filter */}
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-brand-400" />
            <select
              className="text-xs font-semibold bg-white border border-brand-200 rounded-md px-2 py-1.5 outline-none"
              value={filterDate}
              onChange={e => { setFilterDate(e.target.value); setPage(1); }}
            >
              <option value="All">All Time</option>
              <option value="Today">Today</option>
              <option value="This Week">This Week</option>
              <option value="This Month">This Month</option>
            </select>
          </div>
        </div>

        {/* ─── TABLE ─── */}
        <Table columns={[
          { label: 'Date & Time' },
          { label: 'Product' },
          { label: 'Qty Produced' },
        ]}>
          {paged.map(pl => (
            <Tr key={pl.id}>
              <Td className="text-xs text-brand-500 whitespace-nowrap font-medium">{pl.dt}</Td>
              <Td><strong>{pl.product}</strong></Td>
              <Td>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-md">
                  +{pl.produced} {pl.yieldUnit}
                </span>
              </Td>
            </Tr>
          ))}
          {!filtered.length && (
            <Tr>
              <Td className="text-center text-brand-400 py-12 font-medium" colSpan={3}>
                {search || filterDate !== 'All'
                  ? 'Walang nahanap na production record.'
                  : 'Wala pang production record. Mag-set ng target sa Recipe Log at i-confirm ang batch.'}
              </Td>
            </Tr>
          )}
        </Table>

        {filtered.length > 0 && (
          <Pagination page={page} count={filtered.length} perPage={PER_PAGE} total="entries" onChange={setPage} />
        )}
      </Card>
    </div>
  );
}