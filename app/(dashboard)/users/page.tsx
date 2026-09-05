'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGetUsersQuery, useDeleteUserMutation } from '@/store/api/usersApi';
import { useGetCompaniesQuery } from '@/store/api/companiesApi';
import { useAuth } from '@/hooks/useAuth';
import { AdminUser } from '@/types/adminUser';
import { UserSlideOver } from '@/components/features/users/UserSlideOver';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { colors } from '@/lib/colors';
import { Plus, Pencil, Trash2, Search, AlertCircle } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import { toast } from 'sonner';

const PAGE_SIZE = 50;

export default function UsersPage() {
  const router = useRouter();
  const { user: currentUser, isHydrated } = useAuth();
  const isAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    if (isHydrated && !isAdmin) {
      router.replace('/home');
    }
  }, [isHydrated, isAdmin, router]);

  const { data: companiesData } = useGetCompaniesQuery({ limit: 1000 }, { skip: !isHydrated || !isAdmin });
  const companies = useMemo(() => companiesData?.data ?? [], [companiesData?.data]);

  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [page, setPage] = useState(1);

  const [slideOverOpen, setSlideOverOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  const { data, isLoading, error } = useGetUsersQuery(
    { page, limit: PAGE_SIZE },
    { skip: !isHydrated || !isAdmin }
  );
  const [deleteUser] = useDeleteUserMutation();

  const users = useMemo(() => data?.data ?? [], [data?.data]);
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const companyNamesFor = (companyAccess: string[]) =>
    companies
      .filter(c => companyAccess.includes(String(c.id)))
      .map(c => c.description)
      .join(', ') || '—';

  const filtered = useMemo(() => {
    let list = users;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      );
    }
    if (activeFilter === 'active') list = list.filter(u => u.active);
    if (activeFilter === 'inactive') list = list.filter(u => !u.active);
    return list;
  }, [users, search, activeFilter]);

  const openCreate = () => {
    setSelectedUser(null);
    setSlideOverOpen(true);
  };

  const openEdit = (u: AdminUser) => {
    setSelectedUser(u);
    setSlideOverOpen(true);
  };

  const handleDelete = async (u: AdminUser) => {
    if (String(u.id) === String(currentUser?.uid)) {
      toast.error('No podés eliminar tu propia cuenta');
      return;
    }
    if (!window.confirm(`¿Eliminar al usuario ${u.name} (${u.email})? Esta acción no se puede deshacer.`)) {
      return;
    }
    try {
      await deleteUser({ id: u.id }).unwrap();
      toast.success('Usuario eliminado correctamente');
    } catch (err) {
      const e = err as { data?: { message?: string } };
      toast.error(e?.data?.message || 'Error al eliminar el usuario');
    }
  };

  const activeCount = users.filter(u => u.active).length;
  const inactiveCount = users.filter(u => !u.active).length;

  if (!isHydrated || !isAdmin) {
    return null;
  }

  return (
    <main className="w-full">

      <PageHeader
        title="Usuarios"
        action={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-1.5" />
            Nuevo usuario
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
            { key: 'all', label: 'Todos', count: users.length },
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
            placeholder="Buscar por nombre o email…"
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
              {['Nombre', 'Email', 'Rol', 'Compañías', 'Estado', ''].map(h => (
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
                      Error al cargar los usuarios
                    </p>
                  </div>
                </td>
              </tr>
            )}

            {!isLoading && !error && filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center">
                  <p className="text-sm" style={{ color: colors.mutedForeground }}>
                    {search ? 'No se encontraron usuarios con ese criterio' : 'No hay usuarios registrados'}
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

            {!isLoading && !error && filtered.map((u, idx) => (
              <tr
                key={u.id}
                className="transition-colors group"
                style={{
                  borderBottom: idx < filtered.length - 1 ? `1px solid ${colors.border}` : undefined,
                }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = colors.background)}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <td className="px-4 py-3">
                  <span className="text-sm font-semibold" style={{ color: colors.foreground }}>
                    {u.name}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm" style={{ color: colors.mutedForeground }}>
                    {u.email}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={u.role === 'admin' ? 'inReview' : 'outline'}>
                    {u.role === 'admin' ? 'Administrador' : 'Usuario'}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm" style={{ color: colors.foreground }}>
                    {companyNamesFor(u.company_access)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={u.active ? 'approved' : 'draft'}>
                    {u.active ? 'Activo' : 'Inactivo'}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="inline-flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEdit(u)}
                      className="inline-flex items-center gap-1.5 px-3 h-7 rounded-md text-xs font-semibold border"
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
                    <button
                      onClick={() => handleDelete(u)}
                      className="inline-flex items-center justify-center w-7 h-7 rounded-md border"
                      style={{
                        borderColor: colors.border,
                        color: colors.destructive,
                        backgroundColor: colors.surface ?? '#fff',
                      }}
                      aria-label="Eliminar usuario"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
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
      <UserSlideOver
        open={slideOverOpen}
        onOpenChange={setSlideOverOpen}
        user={selectedUser}
        companies={companies}
      />
    </main>
  );
}
