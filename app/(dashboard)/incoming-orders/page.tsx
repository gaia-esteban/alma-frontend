"use client";

import { useState, useCallback, useMemo } from "react";
import { useGetIncomingOrdersQuery, useLazyGetIncomingOrderByIdQuery, useExportIncomingOrdersMutation, IncomingOrderByIdResponse } from "@/store/api/incomingOrdersApi";
import { toast } from "sonner";
import { FileSpreadsheet, Search } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import { DataTable } from "./data-table";
import { createColumns } from "./columns";
import { IncomingOrderDetailsModal } from "../incoming-orders-details/IncomingOrderDetailsModal";
import { IncomingOrder, IncomingOrderStatus } from "@/types/incoming-order";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

export default function IncomingOrders() {
  const { isHydrated } = useAuth();
  const companyAccess = useAppSelector(state => state.auth.user?.companyAccess);
  const companyId = companyAccess?.join(',');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<IncomingOrder | null>(null);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<IncomingOrderByIdResponse | null>(null);
  const [selectedRows, setSelectedRows] = useState<IncomingOrder[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');

  const { data, isLoading, error } = useGetIncomingOrdersQuery({ companyId: companyId! }, {
    skip: !isHydrated || !companyId,
  });
  const [triggerGetOrderById] = useLazyGetIncomingOrderByIdQuery();
  const [exportIncomingOrders, { isLoading: isExporting }] = useExportIncomingOrdersMutation();

  const orders = useMemo(() => data?.data ?? [], [data?.data]);

  const filtered = useMemo(() => {
    let list = orders;
    if (statusFilter !== 'all') list = list.filter(o => o.status === statusFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(o =>
        o.number.toLowerCase().includes(q) ||
        (o.supplier as { name?: string })?.name?.toLowerCase().includes(q) ||
        o.supplierId.toLowerCase().includes(q)
      );
    }
    return list;
  }, [orders, statusFilter, search]);

  const countFor = (key: StatusFilter) =>
    key === 'all' ? orders.length : orders.filter(o => o.status === key).length;

  const handleDetailsClick = async (order: IncomingOrder) => {
    // Store the clicked row data
    setSelectedOrder(order);

    try {
      // Fetch detailed data from API
      const orderDetails = await triggerGetOrderById({ id: order.id, companyId: companyId! }).unwrap();
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
            <DataTable
              columns={columns}
              data={filtered}
              showFilters={false}
              onRowSelectionChange={handleRowSelectionChange}
            />
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
