"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Info, CircleArrowUp, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CardHeader } from "@/components/ui/cardHeader";
import { CardDescription } from "@/components/ui/cardDescription";
import { CardContent } from "@/components/ui/cardContent";
import { getPurchaseOrder, PurchaseOrder } from "@/types/purchaseOrder";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Menu, Search } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { FileUser, FileX } from "lucide-react";
import Image from "next/image";

export default function Home() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState<number[]>([]);
  const [showPendingOnly, setShowPendingOnly] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchActive, setSearchActive] = useState(false);

  const filteredOrders = orders.filter((order) => {
    const matchesPending = showPendingOnly
      ? order["status.description"] === "Factura pendiente"
      : true;
    const matchesSearch = searchText
      ? order["customer.fullName"]
          .toLowerCase()
          .includes(searchText.toLowerCase())
      : true;
    return matchesPending && matchesSearch;
  });

  useEffect(() => {
    getPurchaseOrder().then((data) => setOrders(data));
  }, []);

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case "Totalmente facturada":
        return "primary";
      case "Factura pendiente":
        return "warning";
      case "Parcialmente recibida":
        return "warning";
      default:
        return "secondary";
    }
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return (
      date.toLocaleDateString("es-CO", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }) +
      " " +
      date.toLocaleTimeString("es-CO", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    );
  };

  const formatCurrency = (value: number) =>
    value.toLocaleString("es-CO", { style: "currency", currency: "COP" });

  const [images, setImages] = useState<File[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages([...images, ...Array.from(e.target.files)]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, idx) => idx !== index));
  };

  const toggleSelectAll = (
    checked: boolean,
    visibleOrders: PurchaseOrder[]
  ) => {
    if (checked) {
      // Seleccionar todos los índices de las órdenes visibles
      setSelectedOrders(visibleOrders.map((_, index) => index));
    } else {
      // Deseleccionar todos
      setSelectedOrders([]);
    }
  };

  const toggleOrderSelection = (orderIndex: number, checked: boolean) => {
    // orderIndex: índice dentro de filteredOrders
    const actualIndex = orders.findIndex(
      (o) => o === filteredOrders[orderIndex]
    );

    if (actualIndex === -1) return;

    if (checked) {
      setSelectedOrders((prev) => [...prev, actualIndex]);
    } else {
      setSelectedOrders((prev) => prev.filter((i) => i !== actualIndex));
    }
  };

  return (
    <main className="p-4 space-y-4">
      <div className="flex justify-between items-center mb-4">
        {/* Menú + Texto */}
        <div className="flex items-center space-x-2">
          <button className="p-2 rounded-md hover:bg-gray-100">
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
          <span className="text-lg font-semibold text-gray-800">
            Active orders
          </span>
        </div>

        {/* Botón de búsqueda / Input */}
        <div className="relative">
          {!searchActive && (
            <button
              className="p-2 rounded-md hover:bg-gray-100"
              onClick={() => setSearchActive(true)}
            >
              <Search className="w-6 h-6 text-gray-700" />
            </button>
          )}
          {searchActive && (
            <input
              autoFocus
              type="text"
              placeholder="Buscar por cliente..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onBlur={() => {
                if (searchText === "") setSearchActive(false);
              }}
              className="border px-3 py-1 rounded-md w-64 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            />
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 items-center gap-6 mb-6">
        <div className="flex items-center gap-3">
          <Checkbox
            id="select-all"
            className="scale-150"
            checked={
              selectedOrders.length === filteredOrders.length &&
              filteredOrders.length > 0
            }
            onCheckedChange={(checked) =>
              toggleSelectAll(!!checked, filteredOrders)
            }
          />
          <label htmlFor="select-all" className="text-base font-medium">
            All
          </label>
        </div>

        <div className="flex items-center justify-center gap-3">
          <Switch
            id="pending-orders"
            checked={showPendingOnly}
            onCheckedChange={setShowPendingOnly}
            className={`
            scale-150
            data-[state=checked]:bg-primary
            data-[state=checked]:border-primary
            [&>span]:bg-white
          `}
          />
          <label htmlFor="pending-orders" className="text-base font-medium">
            Órdenes pendientes
          </label>
        </div>

        <div className="flex items-center justify-end gap-4 text-gray-700">
          <FileUser
            strokeWidth={2.5}
            className="w-7 h-7 cursor-pointer hover:text-gray-900"
          />
          <FileX
            strokeWidth={2.5}
            className="w-7 h-7 cursor-pointer hover:text-gray-900"
          />
        </div>
      </div>

      {filteredOrders.map((order, index) => (
        <Card key={index}>
          <CardHeader>
            <CardDescription className="flex flex-col gap-4">
              <div className="flex justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id={`order-${index}`}
                    checked={selectedOrders.includes(index)}
                    onCheckedChange={(checked) =>
                      toggleOrderSelection(index, !!checked)
                    }
                  />

                  <label
                    htmlFor={`order-${index}`}
                    className="text-right text-sm font-medium leading-none"
                  >
                    # {order["externalId[].value.orderNumber"]}{" "}
                    {formatDate(order.createdAt)}
                  </label>
                </div>
                <span className="text-left">
                  {formatCurrency(order.priceAfterTax)}
                </span>
              </div>
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col gap-4">
            <div className="flex justify-between">
              <span className="truncate max-w-[160px] inline-block align-middle">
                {order["customer.fullName"]}
              </span>
              <span className="text-left"></span>
            </div>
            <div className="flex justify-between items-center">
              <Badge variant={getBadgeVariant(order["status.description"])}>
                {order["status.description"]}
              </Badge>
              <div className="flex gap-2 text-gray-700">
                <Info
                  strokeWidth={2.5}
                  className="w-5 h-5 cursor-pointer hover:text-gray-900"
                />
                <CircleArrowUp
                  strokeWidth={2.5}
                  className="w-5 h-5 cursor-pointer hover:text-gray-900"
                />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <MoreHorizontal
                      strokeWidth={2.5}
                      className="w-5 h-5 cursor-pointer hover:text-gray-900"
                    />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Ver detalles</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setOpen(true)}>
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem>Eliminar</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader className="text-center">
            <DialogTitle className="text-lg font-bold text-center">
              Actualizar Estado
            </DialogTitle>
            <DialogDescription className="text-center">
              Selecciona el nuevo Estado y agrega comentarios
            </DialogDescription>
          </DialogHeader>

          {/* Label + Select */}
          <div className="mt-4">
            <label className="text-sm font-medium mb-1 block">
              Siguiente Estado
            </label>
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar estado..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recoleccion-finalizada">
                  Recolección finalizada
                </SelectItem>
                <SelectItem value="transito-acopio">
                  Tránsito a acopio
                </SelectItem>
                <SelectItem value="recibido-acopio">
                  Recibido en acopio
                </SelectItem>
                <SelectItem value="salida-puerto">Salida a puerto</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Label + Textarea */}
          <div className="mt-4">
            <label className="text-sm font-medium mb-1 block">
              Comentarios
            </label>
            <Textarea
              placeholder="Agregar comentarios sobre el cambio de estado..."
              className="w-full"
            />
          </div>

          {/* Área de subida */}
          <label
            htmlFor="file-upload"
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center transition-all duration-200 ease-in-out cursor-pointer hover:border-green-400 hover:bg-green-50"
          >
            <div className="w-12 h-12 mx-auto mb-4 bg-[var(--primary)] rounded-full flex items-center justify-center text-white text-lg">
              <svg
                width="24"
                height="24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21,15 16,10 5,21" />
              </svg>
            </div>

            <div className="text-lg font-bold text-center">
              Subir fotografías
            </div>
            <div className="text-center">Máximo 3 imágenes • JPG, PNG</div>
            <input
              id="file-upload"
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>

          {/* Vista previa */}
          {images.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-4">
              {images.map((image, idx) => (
                <div
                  key={idx}
                  className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-gray-300"
                >
                  <Image
                    src={URL.createObjectURL(image)}
                    alt={`preview-${idx}`}
                    width={96} // 24 * 4 tailwind
                    height={96}
                    className="object-cover"
                    unoptimized
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Footer con botones */}
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => setOpen(false)}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
