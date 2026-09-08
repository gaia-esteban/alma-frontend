"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useGetIncomingOrdersQuery, useLazyGetIncomingOrderByIdQuery, useExportIncomingOrdersMutation, IncomingOrderByIdResponse } from "@/store/api/incomingOrdersApi";
import { useGetCompaniesQuery } from "@/store/api/companiesApi";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, FileSpreadsheet, Search, Building2 } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import { DataTable } from "./data-table";
import { createColumns } from "./columns";
import { IncomingOrderDetailsModal } from "../incoming-orders-details/IncomingOrderDetailsModal";
import { IncomingOrder, IncomingOrderStatus } from "@/types/incoming-order";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { useAppSelector } from "@/store";
import { colors } from "@/lib/colors";

type StatusFilter = 'all' | IncomingOrderStatus;

const STATUS_TABS: { key: StatusFilter; label: string }[] = [
  { key: 'all',        label: 'Todos' },
  { key: 'Pendiente',  label: 'Pendiente' },
  { key: 'Procesada',  label: 'Procesada' },
  { key: 'Fallida',    label: 'Fallida' },
];

const PAGE_SIZES = [25, 50, 100];

export default function IncomingOrders() {
  const { isHydrated } = useAuth();
  const companyAccess = useAppSelector(state => state.auth.user?.companyAccess);
  const defaultCompanyId = companyAccess?.join(',');

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<IncomingOrder | null>(null);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<IncomingOrderByIdResponse | null>(null);
  const [selectedRows, setSelectedRows] = useState<IncomingOrder[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCompanyIds, setSelectedCompanyIds] = useState<string[] | null>(null); // null = all companies (default)
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  // Debounce the search box so it doesn't fire a request on every keystroke
  useEffect(() => {
    const handle = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(handle);
  }, [search]);

  const { data: companiesData } = useGetCompaniesQuery({ limit: 100 }, { skip: !isHydrated });
  const companies = useMemo(() => companiesData?.data ?? [], [companiesData?.data]);

  const effectiveCompanyId = selectedCompanyIds !== null
    ? selectedCompanyIds.join(',')
    : defaultCompanyId;

  const isAllCompaniesSelected = selectedCompanyIds === null;

  const toggleCompany = useCallback((id: string) => {
    setSelectedCompanyIds(prev => {
      const base = prev ?? companies.map(c => String(c.id));
      const next = base.includes(id) ? base.filter(c => c !== id) : [...base, id];
      return next;
    });
    setPage(1);
  }, [companies]);

  const resetCompanyFilter = useCallback(() => {
    setSelectedCompanyIds(null);
    setPage(1);
  }, []);

  // Reset to page 1 whenever a filter that changes the result set changes
  useEffect(() => {
    setPage(1);
  }, [statusFilter, debouncedSearch, pageSize]);

  const baseQueryArgs = useMemo(() => ({
    companyId: effectiveCompanyId!,
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
  }), [effectiveCompanyId, debouncedSearch]);

  const dataQueryArgs = useMemo(() => ({
    ...baseQueryArgs,
    page,
    limit: pageSize,
    ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
  }), [baseQueryArgs, page, pageSize, statusFilter]);

  const skipQueries = !isHydrated || !effectiveCompanyId;

  const { data, isLoading, isFetching, error } = useGetIncomingOrdersQuery(dataQueryArgs, {
    skip: skipQueries,
  });

  // One lightweight (limit: 1) request per tab, scoped to the same company/search filters,
  // so tab totals reflect the full DB count rather than just the rows loaded on this page.
  const countQueryOpts = { skip: skipQueries };
  const { data: countAll } = useGetIncomingOrdersQuery({ ...baseQueryArgs, limit: 1 }, countQueryOpts);
  const { data: countPendiente } = useGetIncomingOrdersQuery({ ...baseQueryArgs, limit: 1, status: 'Pendiente' }, countQueryOpts);
  const { data: countProcesada } = useGetIncomingOrdersQuery({ ...baseQueryArgs, limit: 1, status: 'Procesada' }, countQueryOpts);
  const { data: countFallida } = useGetIncomingOrdersQuery({ ...baseQueryArgs, limit: 1, status: 'Fallida' }, countQueryOpts);

  const countFor = (key: StatusFilter): number => {
    switch (key) {
      case 'all': return countAll?.total ?? 0;
      case 'Pendiente': return countPendiente?.total ?? 0;
      case 'Procesada': return countProcesada?.total ?? 0;
      case 'Fallida': return countFallida?.total ?? 0;
    }
  };

  const [triggerGetOrderById] = useLazyGetIncomingOrderByIdQuery();
  const [exportIncomingOrders, { isLoading: isExporting }] = useExportIncomingOrdersMutation();

  const orders = useMemo(() => data?.data ?? [], [data?.data]);
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const handleDetailsClick = async (order: IncomingOrder) => {
    // Store the clicked row data
    setSelectedOrder(order);

    try {
      // Fetch detailed data from API
      const orderDetails = await triggerGetOrderById({ id: order.id, companyId: effectiveCompanyId! }).unwrap();
      setSelectedOrderDetails(orderDetails);
      setModalOpen(true);
    } catch (error) {
      console.error("Error fetching incoming order details:", error);
    }
  };

  const handleExport = async () => {
    if (selectedRows.length === 0) {
      toast.error("Por favor, selecciona al menos una factura");
      return;
    }

    const distinctCompanyIds = Array.from(new Set(selectedRows.map(row => row.company?.id)));
    if (distinctCompanyIds.length > 1) {
      toast.error("No se pueden exportar facturas de más de una compañía a la vez");
      return;
    }

    try {
      const invoices = selectedRows.map(row => row.id);
      const result = await exportIncomingOrders({
        invoices,
        consecutive: 611,
        companyId: distinctCompanyIds[0],
      }).unwrap();

      toast.success(result.message || "Facturas exportadas exitosamente");
    } catch (error) {
      console.error("Error exporting invoices:", error);
      toast.error("Error al exportar las facturas");
    }
  };

  const handleRowSelectionChange = useCallback((rows: IncomingOrder[]) => {
    setSelectedRows(rows);
  }, []);

  const columns = createColumns(handleDetailsClick);

  if (!isHydrated) {
    return (
      <main className="w-full">
        <div className="text-center py-8" style={{ color: colors.mutedForeground }}>
          Cargando...
        </div>
      </main>
    );
  }

  return (
    <main className="w-full">
      <div className="w-full max-w-full">
        <PageHeader title="Facturas de entrada" />

        {/* Filter bar */}
        <TooltipProvider>
          <div
            className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4 p-3 rounded-lg"
            style={{ border: `1px solid ${colors.border}`, backgroundColor: colors.surface ?? '#fff' }}
          >
            {/* Status tabs */}
            <div
              className="flex rounded-lg p-1 gap-0.5 shrink-0"
              style={{ backgroundColor: colors.muted }}
            >
              {STATUS_TABS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setStatusFilter(key)}
                  className="flex items-center gap-1.5 h-7 px-3 rounded-md text-xs font-semibold transition-colors"
                  style={{
                    backgroundColor: statusFilter === key ? colors.secondary : 'transparent',
                    color: statusFilter === key ? '#fff' : colors.mutedForeground,
                  }}
                >
                  {label}
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{
                      backgroundColor: statusFilter === key ? 'rgba(255,255,255,0.15)' : colors.border,
                      color: statusFilter === key ? '#fff' : colors.mutedForeground,
                    }}
                  >
                    {countFor(key)}
                  </span>
                </button>
              ))}
            </div>

            {/* Company filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 shrink-0 gap-1.5">
                  <Building2 className="h-3.5 w-3.5" />
                  {isAllCompaniesSelected
                    ? "Todas las compañías"
                    : `${selectedCompanyIds!.length} compañía${selectedCompanyIds!.length === 1 ? "" : "s"}`}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuItem onClick={resetCompanyFilter}>
                  Todas las compañías
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {companies.map(company => {
                  const id = String(company.id);
                  const checked = isAllCompaniesSelected || (selectedCompanyIds?.includes(id) ?? false);
                  return (
                    <DropdownMenuCheckboxItem
                      key={id}
                      checked={checked}
                      onSelect={(e) => e.preventDefault()}
                      onCheckedChange={() => toggleCompany(id)}
                    >
                      {company.description}
                    </DropdownMenuCheckboxItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Search */}
            <div className="relative flex-1 w-full sm:w-auto">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5"
                style={{ color: colors.mutedForeground }}
              />
              <Input
                placeholder="Buscar por # factura, tercero o NIT…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-8 h-9 text-sm"
              />
            </div>

            {/* Export */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                  disabled={selectedRows.length === 0 || isExporting}
                >
                  <FileSpreadsheet className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Exportar a Contai</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>

        {/* Data Table */}
        <div className="w-full">
          {isLoading && (
            <div className="text-center py-8" style={{ color: colors.mutedForeground }}>
              Cargando...
            </div>
          )}
          {error && (
            <div className="text-center py-8" style={{ color: colors.destructive }}>
              Error al cargar las ordenes.
            </div>
          )}
          {!isLoading && !error && (
            <>
              <DataTable
                columns={columns}
                data={orders}
                showFilters={false}
                onRowSelectionChange={handleRowSelectionChange}
              />

              {/* Pagination */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-3 px-1">
                <div className="text-xs" style={{ color: colors.mutedForeground }}>
                  {total === 0
                    ? "Sin resultados"
                    : `Mostrando ${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, total)} de ${total}`}
                  {isFetching && " · actualizando…"}
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs" style={{ color: colors.mutedForeground }}>Por página</span>
                    <Select value={`${pageSize}`} onValueChange={(v) => setPageSize(Number(v))}>
                      <SelectTrigger className="h-8 w-[70px] text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PAGE_SIZES.map(size => (
                          <SelectItem key={size} value={`${size}`}>{size}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page <= 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-xs font-medium min-w-[90px] text-center" style={{ color: colors.mutedForeground }}>
                      Página {page} de {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Details Modal */}
      <IncomingOrderDetailsModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        order={selectedOrder}
        orderDetails={selectedOrderDetails}
      />
    </main>
  );
}
