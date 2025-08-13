'use client';

import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  ColumnDef,
} from '@tanstack/react-table';
import { useMemo, useState } from 'react';

// Tipo de datos
type Order = {
  createdAt: string;
  externalId: { value: { orderNumber: string } }[];
  customer: { fullName: string };
  status: { description: string };
  comments: string;
  priceAfterTax: number;
};

// Data simulada
const data: Order[] = [
  {
    createdAt: '2025-06-20T06:41:16.000Z',
    externalId: [{ value: { orderNumber: 'PO08' } }],
    customer: {
      fullName:
        "Ministero dell'Ambiente e della Sicurezza Energetica - Residuos Italia 1234567",
    },
    status: { description: 'Factura pendiente' },
    comments: 'Test',
    priceAfterTax: 0,
  },
  {
    createdAt: '2025-06-25T06:41:16.000Z',
    externalId: [{ value: { orderNumber: 'PO34' } }],
    customer: { fullName: 'ETIQUETAS DE COLOMBIA S.A.S 802002507' },
    status: { description: 'Aprobación del supervisor pendiente' },
    comments: 'TEST CASE P2P03.1',
    priceAfterTax: 612850,
  },
];

// Config del usuario: columnas visibles y ordenadas
const userColumnConfig = [
  'createdAt',
  'orderNumber',
  'customer',
  'status',
  'comments',
  'priceAfterTax',
];

const columnHelper = createColumnHelper<Order>();

// Todas las columnas posibles
const allColumns: Record<string, ColumnDef<Order, any>> = {
  createdAt: columnHelper.accessor(
    row => row.createdAt,
    {
      id: 'createdAt',
      header: 'Fecha de creación',
      cell: info => new Date(info.getValue()).toLocaleDateString(),
    }
  ),
  orderNumber: columnHelper.accessor(
    row => row.externalId[0]?.value.orderNumber ?? '—',
    {
      id: 'orderNumber',
      header: 'Número de orden',
    }
  ),
  customer: columnHelper.accessor(
    row => row.customer.fullName,
    {
      id: 'customer',
      header: 'Cliente',
    }
  ),
  status: columnHelper.accessor(
    row => row.status.description,
    {
      id: 'status',
      header: 'Estado',
    }
  ),
  comments: columnHelper.accessor(
    'comments',
    {
      header: 'Comentarios',
    }
  ),
  priceAfterTax: columnHelper.accessor(
    'priceAfterTax',
    {
      header: 'Precio con impuestos',
      cell: info => `$${info.getValue().toLocaleString()}`,
    }
  ),
};

export default function OrdersTable() {
  // Estado de sorting (orden por defecto: createdAt DESC)
  const [sorting, setSorting] = useState([
    { id: 'createdAt', desc: true }
  ]);

  // Estado de paginación
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 50,
  });

  const pagedData = useMemo(() => {
    const start = pagination.pageIndex * pagination.pageSize;
    const end = start + pagination.pageSize;
    return data.slice(start, end);
  }, [pagination]);

  const columns = useMemo(
    () => userColumnConfig.map(col => allColumns[col]),
    []
  );

  const table = useReactTable({
    data: pagedData,
    columns,
    state: {
      sorting,
      pagination,
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    pageCount: Math.min(Math.ceil(data.length / pagination.pageSize), 4),
  });

  return (
    <div>
      <table className="min-w-full border border-gray-300">
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id} className="bg-gray-100">
              {headerGroup.headers.map(header => (
                <th key={header.id} className="p-2 border text-left">
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row => (
            <tr key={row.id}>
              {row.getVisibleCells().map(cell => (
                <td key={cell.id} className="p-2 border align-top">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Controles de paginación */}
      <div className="mt-4 flex gap-4 items-center">
        <button
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Anterior
        </button>
        <span>
          Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
        </span>
        <button
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
