"use client";

import { useState, useCallback } from "react";
import { useGetIncomingOrdersQuery, useLazyGetIncomingOrderByIdQuery, useExportIncomingOrdersMutation } from "@/store/api/incomingOrdersApi";
import { toast } from "sonner";
import { Filter, FileSpreadsheet } from "lucide-react";
import { DataTable } from "./data-table";
import { createColumns } from "./columns";
import { IncomingOrderDetailsModal } from "../incoming-orders-details/IncomingOrderDetailsModal";
import { IncomingOrder } from "@/types/incoming-order";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";

export default function IncomingOrders() {
  const { isHydrated } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<IncomingOrder | null>(null);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<IncomingOrder | null>(null);
  const [showFilters, setShowFilters] = useState(true);
  const [selectedRows, setSelectedRows] = useState<IncomingOrder[]>([]);

  const { data, isLoading, error } = useGetIncomingOrdersQuery({}, {
    skip: !isHydrated, // Skip query until auth is hydrated
  });
  const [triggerGetOrderById] = useLazyGetIncomingOrderByIdQuery();
  const [exportIncomingOrders, { isLoading: isExporting }] = useExportIncomingOrdersMutation();

  const handleDetailsClick = async (order: IncomingOrder) => {
    // Store the clicked row data
    setSelectedOrder(order);

    try {
      // Fetch detailed data from API
      const orderDetails = await triggerGetOrderById(order.id).unwrap();
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

    try {
      const invoiceIds = selectedRows.map(row => row.id);
      const result = await exportIncomingOrders({
        invoiceIds,
        storage: "firebase"
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

  // Show loading state while checking localStorage
  if (!isHydrated) {
    return (
      <main className="w-full">
        <div className="text-center py-8 text-gray-600">
          Cargando...
        </div>
      </main>
    );
  }

  return (
    <main className="w-full">
      <div className="w-full max-w-full">
        <div className="flex items-center mb-4 md:mb-6">
          <h1 className="text-lg md:text-xl lg:text-2xl font-semibold text-gray-800">
            Facturas de entrada
          </h1>
        </div>

        {/* Filter Control Bar */}
        <TooltipProvider>
          <div className="mb-4 p-3 border border-gray-300 rounded-lg flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className={`${
                  showFilters ? "text-blue-600" : "text-gray-600"
                }`}
              >
                <Filter className={`w-4 h-4 ${showFilters ? "text-blue-600" : "text-gray-600"}`} />
              </Button>

              <Input
                type="text"
                placeholder="Buscar facturas de entrada..."
                className="max-w-sm"
              />
            </div>

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
            <div className="text-center py-8 text-gray-600">
              Cargando...
            </div>
          )}
          {error && (
            <div className="text-center py-8 text-red-600">
              Error al cargar las ordenes.
            </div>
          )}
          {!isLoading && !error && (
            <DataTable
              columns={columns}
              data={data?.invoices || []}
              showFilters={showFilters}
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
