"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useGetIncomingOrdersQuery, useLazyGetIncomingOrderByIdQuery } from "@/store/api/incomingOrdersApi";
import { Menu, Search } from "lucide-react";
import { DataTable } from "./data-table";
import { createColumns } from "./columns";
import { IncomingOrderDetailsModal } from "../incoming-orders-details/IncomingOrderDetailsModal";
import { IncomingOrder } from "@/types/incoming-order";

export default function IncomingOrders() {
  const [searchText, setSearchText] = useState("");
  const [searchActive, setSearchActive] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<IncomingOrder | null>(null);

  const { data, isLoading, error } = useGetIncomingOrdersQuery({});
  const [triggerGetOrderById, { isLoading: isLoadingDetails }] = useLazyGetIncomingOrderByIdQuery();

  // Show detailed error information
  if (error) {
    console.error("API Error details:", error);
  }

  const handleDetailsClick = async (order: IncomingOrder) => {
    try {
      const result = await triggerGetOrderById(order.id).unwrap();
      setSelectedOrder(result);
      setModalOpen(true);
    } catch (error) {
      console.error("Error fetching incoming order details:", error);
    }
  };

  const filteredOrders = data?.invoices?.filter((order) => {
    const matchesSearch = searchText
      ? order.number.toLowerCase().includes(searchText.toLowerCase()) ||
        order.purchaseOrder.toLowerCase().includes(searchText.toLowerCase())
      : true;
    return matchesSearch;
  }) || [];

  const columns = createColumns(handleDetailsClick);

  return (
    <main className="w-full min-h-screen p-4 md:p-6 lg:p-8">
      <div className="w-full max-w-full">
        <div className="flex justify-between items-center mb-4 md:mb-6">
          {/* Menú + Texto */}
          <div className="flex items-center space-x-2">
            <button className="p-2 rounded-md hover:bg-gray-100">
              <Menu className="w-6 h-6 md:w-7 md:h-7 text-gray-700" />
            </button>

            {!searchActive && (
              <span className="text-lg md:text-xl lg:text-2xl font-semibold text-gray-800">
                Facturas de entrada
              </span>
            )}
          </div>

          {/* Botón de búsqueda / Input */}
          <div className="relative">
            {!searchActive && (
              <button
                className="p-2 rounded-md hover:bg-gray-100"
                onClick={() => setSearchActive(true)}
              >
                <Search className="w-6 h-6 md:w-7 md:h-7 text-gray-700" />
              </button>
            )}
            {searchActive && (
              <input
                autoFocus
                type="text"
                placeholder="Search by number or PO..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onBlur={() => {
                  if (searchText === "") setSearchActive(false);
                }}
                className="border px-3 py-2 md:py-3 rounded-md w-48 sm:w-64 md:w-72 lg:w-96 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              />
            )}
          </div>
        </div>

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
            <DataTable columns={columns} data={filteredOrders} />
          )}
        </div>
      </div>

      {/* Details Modal */}
      <IncomingOrderDetailsModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        order={selectedOrder}
      />
    </main>
  );
}
