'use client';

import { useState, useMemo } from 'react';
import { useGetSuppliersQuery } from '@/store/api/suppliersApi';
import { useAppSelector } from '@/store';
import { useAuth } from '@/hooks/useAuth';
import { Supplier } from '@/types/supplier';
import { SupplierSlideOver } from '@/components/features/suppliers/SupplierSlideOver';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { colors } from '@/lib/colors';
import { Plus, Pencil, Search, AlertCircle } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';

const PAGE_SIZE = 50;

export default function SuppliersPage() {
  const { isHydrated } = useAuth();
  const companyId = useAppSelector(state => state.auth.user?.companyId);

  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [page, setPage] = useState(1);

  const [slideOverOpen, setSlideOverOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  const { data, isLoading, error } = useGetSuppliersQuery(
    { company_id: companyId, page, limit: PAGE_SIZE },
    { skip: !isHydrated || !companyId }
  );

  const suppliers = useMemo(() => data?.data ?? [], [data?.data]);
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const filtered = useMemo(() => {
    let list = suppliers;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        s =>
          s.identification.toLowerCase().includes(q) ||
          s.description?.toLowerCase().includes(q)
      );
    }
    if (activeFilter === 'active') list = list.filter(s => s.is_active);
    if (activeFilter === 'inactive') list = list.filter(s => !s.is_active);
    return list;
  }, [suppliers, search, activeFilter]);

  const openCreate = () => {
    setSelectedSupplier(null);
    setSlideOverOpen(true);
  };

  const openEdit = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setSlideOverOpen(true);
  };

  const activeCount = suppliers.filter(s => s.is_active).length;
  const inactiveCount = suppliers.filter(s => !s.is_active).length;

  return (
    <main className="w-full">

      <PageHeader
        title="Proveedores"
        action={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-1.5" />
            Nuevo proveedor
          </Button>
        }
      />

      {/* Filter bar */}
      <div
        className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4 p-3 rounded-lg"
        style={{ border: `1px solid ${colors.border}`, backgroundColor: colors.surface ?? '#fff' }}
      >
        {/* Status tabs */}
        <div
          className="flex rounded-lg p-1 gap-0.5 shrink-0"
          style={{ backgroundColor: colors.muted }}
        >
          {([
            { key: 'all', label: 'Todos', count: suppliers.length },
            { key: 'active', label: 'Activos', count: activeCount },
            { key: 'inactive', label: 'Inactivos', count: inactiveCount },
          ] as const).map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => { setActiveFilter(key); setPage(1); }}
              className="flex items-center gap-1.5 h-7 px-3 rounded-md text-xs font-semibold transition-colors"
              style={{
                backgroundColor: activeFilter === key ? colors.secondary : 'transparent',
                color: activeFilter === key ? '#fff' : colors.mutedForeground,
              }}
            >
              {label}
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                style={{
                  backgroundColor: activeFilter === key ? 'rgba(255,255,255,0.15)' : colors.border,
                  color: activeFilter === key ? '#fff' : colors.mutedForeground,
                }}
              >
                {count}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 w-full sm:w-auto">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5"
            style={{ color: colors.mutedForeground }}
          />
          <Input
            placeholder="Buscar por identificación o descripción…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="pl-8 h-9 text-sm"
          />
        </div>
      </div>

      {/* Table */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ border: `1px solid ${colors.border}`, backgroundColor: colors.surface ?? '#fff' }}
      >
        <table className="w-full border-collapse">
          <thead>
            <tr style={{ backgroundColor: colors.background, borderBottom: `1px solid ${colors.border}` }}>
              {['Identificación', 'Descripción', 'Cta. débito', 'Cta. crédito', 'Estado', ''].map(h => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider last:text-right"
                  style={{ color: colors.mutedForeground }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${colors.border}` }}>
                  {[1, 2, 3, 4, 5, 6].map(c => (
                    <td key={c} className="px-4 py-3">
                      <Skeleton className="h-4 w-full" />
                    </td>
                  ))}
                </tr>
              ))
            )}

            {!isLoading && error && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <AlertCircle className="h-5 w-5" style={{ color: colors.destructive }} />
                    <p className="text-sm" style={{ color: colors.destructive }}>
                      Error al cargar los proveedores
                    </p>
                  </div>
                </td>
              </tr>
            )}

            {!isLoading && !error && filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center">
                  <p className="text-sm" style={{ color: colors.mutedForeground }}>
                    {search ? 'No se encontraron proveedores con ese criterio' : 'No hay proveedores registrados'}
                  </p>
                  {!search && (
                    <button
                      onClick={openCreate}
                      className="text-sm font-semibold mt-2 underline underline-offset-2"
                      style={{ color: colors.primary }}
                    >
                      Crear el primero
                    </button>
                  )}
                </td>
              </tr>
            )}

            {!isLoading && !error && filtered.map((supplier, idx) => (
              <tr
                key={supplier.id}
                className="transition-colors group"
                style={{
                  borderBottom: idx < filtered.length - 1 ? `1px solid ${colors.border}` : undefined,
                }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = colors.background)}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <td className="px-4 py-3">
                  <span className="text-sm font-semibold" style={{ color: colors.foreground }}>
                    {supplier.identification}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm" style={{ color: colors.mutedForeground }}>
                    {supplier.description || '—'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm font-mono" style={{ color: colors.mutedForeground }}>
                    {supplier.debit_account || '—'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm font-mono" style={{ color: colors.mutedForeground }}>
                    {supplier.credit_account || '—'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={supplier.is_active ? 'approved' : 'draft'}>
                    {supplier.is_active ? 'Activo' : 'Inactivo'}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => openEdit(supplier)}
                    className="inline-flex items-center gap-1.5 px-3 h-7 rounded-md text-xs font-semibold border opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{
                      borderColor: colors.border,
                      color: colors.foreground,
                      backgroundColor: colors.surface ?? '#fff',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = colors.secondary;
                      e.currentTarget.style.backgroundColor = colors.secondary;
                      e.currentTarget.style.color = '#fff';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = colors.border;
                      e.currentTarget.style.backgroundColor = colors.surface ?? '#fff';
                      e.currentTarget.style.color = colors.foreground;
                    }}
                  >
                    <Pencil className="h-3 w-3" />
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderTop: `1px solid ${colors.border}` }}
          >
            <span className="text-xs" style={{ color: colors.mutedForeground }}>
              Mostrando {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} de {total}
            </span>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                ←
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <Button
                  key={p}
                  variant={p === page ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPage(p)}
                >
                  {p}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                →
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Slide-over */}
      <SupplierSlideOver
        open={slideOverOpen}
        onOpenChange={setSlideOverOpen}
        supplier={selectedSupplier}
        companyId={companyId ?? 0}
      />
    </main>
  );
}
