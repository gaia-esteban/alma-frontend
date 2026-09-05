'use client';

import React, { useEffect, useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { colors } from '@/lib/colors';
import { Supplier } from '@/types/supplier';
import {
  SupplierCreateBody,
  SupplierUpdateBody,
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
} from '@/store/api/suppliersApi';

interface FormState {
  companyId: number | null;
  identification: string;
  description: string;
  debit_account: string;
  credit_account: string;
  tax_vat_account: string;
  withholdings_account: string;
  withholding_account: string;
  withholdings_threshold: string;
  withholdings_percentage: string;
  is_active: boolean;
}

const emptyForm: FormState = {
  companyId: null,
  identification: '',
  description: '',
  debit_account: '',
  credit_account: '',
  tax_vat_account: '',
  withholdings_account: '',
  withholding_account: '',
  withholdings_threshold: '',
  withholdings_percentage: '',
  is_active: true,
};

function supplierToForm(s: Supplier): FormState {
  return {
    companyId: s.company_id ?? null,
    identification: s.identification ?? '',
    description: s.description ?? '',
    debit_account: s.debit_account ?? '',
    credit_account: s.credit_account ?? '',
    tax_vat_account: s.tax_vat_account ?? '',
    withholdings_account: s.withholdings_account ?? '',
    withholding_account: s.withholding_account ?? '',
    withholdings_threshold: s.withholdings_threshold?.toString() ?? '',
    withholdings_percentage: s.withholdings_percentage?.toString() ?? '',
    is_active: s.is_active ?? true,
  };
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplier: Supplier | null;
  companies: { id: number; description: string }[];
}

interface FieldLabelProps {
  label: string;
  required?: boolean;
  hint?: string;
}

function FieldLabel({ label, required, hint }: FieldLabelProps) {
  return (
    <label className="block text-xs font-semibold mb-1.5" style={{ color: colors.foreground }}>
      {label}
      {required && <span className="ml-0.5" style={{ color: colors.primary }}>*</span>}
      {hint && <span className="ml-1.5 font-normal" style={{ color: colors.mutedForeground }}>({hint})</span>}
    </label>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: colors.mutedForeground }}>
      {children}
    </p>
  );
}

export function SupplierSlideOver({ open, onOpenChange, supplier, companies }: Props) {
  const isEditing = !!supplier;
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  const [createSupplier, { isLoading: isCreating }] = useCreateSupplierMutation();
  const [updateSupplier, { isLoading: isUpdating }] = useUpdateSupplierMutation();
  const isLoading = isCreating || isUpdating;

  useEffect(() => {
    if (open) {
      setForm(supplier ? supplierToForm(supplier) : emptyForm);
      setErrors({});
    }
  }, [open, supplier]);

  const set = (field: keyof FormState, value: string | boolean | number | null) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const validate = (): boolean => {
    const next: typeof errors = {};
    if (!form.companyId) next.companyId = 'La compañía es requerida';
    if (!form.identification.trim()) next.identification = 'La identificación es requerida';
    if (form.identification.length > 100) next.identification = 'Máximo 100 caracteres';
    if (form.description.length > 250) next.description = 'Máximo 250 caracteres';
    const pct = parseFloat(form.withholdings_percentage);
    if (form.withholdings_percentage && (isNaN(pct) || pct < 0 || pct > 100))
      next.withholdings_percentage = 'Debe ser un número entre 0 y 100';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const payload = {
      companyId: form.companyId as number,
      identification: form.identification.trim(),
      description: form.description.trim() || undefined,
      debit_account: form.debit_account.trim() || undefined,
      credit_account: form.credit_account.trim() || undefined,
      tax_vat_account: form.tax_vat_account.trim() || undefined,
      withholdings_account: form.withholdings_account.trim() || undefined,
      withholding_account: form.withholding_account.trim() || undefined,
      withholdings_threshold: form.withholdings_threshold ? parseFloat(form.withholdings_threshold) : undefined,
      withholdings_percentage: form.withholdings_percentage ? parseFloat(form.withholdings_percentage) : undefined,
      is_active: form.is_active,
    };

    try {
      if (isEditing) {
        await updateSupplier({ id: supplier!.id, companyId: supplier!.company_id, data: payload as SupplierUpdateBody }).unwrap();
        toast.success('Proveedor actualizado correctamente');
      } else {
        await createSupplier(payload as SupplierCreateBody).unwrap();
        toast.success('Proveedor creado correctamente');
      }
      onOpenChange(false);
    } catch (err) {
      const e = err as { data?: { message?: string } };
      toast.error(e?.data?.message || 'Error al guardar el proveedor');
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg flex flex-col p-0 gap-0"
      >
        {/* Header */}
        <SheetHeader
          className="px-6 py-5 border-b shrink-0"
          style={{ borderColor: colors.border }}
        >
          <SheetTitle
            className="text-base font-bold tracking-tight"
            style={{ color: colors.foreground }}
          >
            {isEditing ? 'Editar proveedor' : 'Nuevo proveedor'}
          </SheetTitle>
          <SheetDescription className="text-xs" style={{ color: colors.mutedForeground }}>
            {isEditing
              ? `Modificando ${supplier!.identification}`
              : 'Completá los datos para registrar un nuevo proveedor'}
          </SheetDescription>
        </SheetHeader>

        {/* Scrollable form body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

          {/* Identificación */}
          <div>
            <SectionTitle>Identificación</SectionTitle>
            <div className="space-y-4">
              <div>
                <FieldLabel label="Compañía" required />
                <Select
                  value={form.companyId ? String(form.companyId) : undefined}
                  onValueChange={val => set('companyId', Number(val))}
                  disabled={isEditing}
                >
                  <SelectTrigger className="w-full" aria-invalid={!!errors.companyId}>
                    <SelectValue placeholder="Seleccioná una compañía" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map(company => (
                      <SelectItem key={company.id} value={String(company.id)}>
                        {company.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.companyId && (
                  <p className="text-xs mt-1" style={{ color: colors.destructive }}>{errors.companyId}</p>
                )}
              </div>
              <div>
                <FieldLabel label="Identificación" required hint="máx. 100 caracteres" />
                <Input
                  placeholder="Ej. CUIT 20-12345678-9"
                  value={form.identification}
                  onChange={e => set('identification', e.target.value)}
                  error={!!errors.identification}
                  maxLength={100}
                />
                {errors.identification && (
                  <p className="text-xs mt-1" style={{ color: colors.destructive }}>{errors.identification}</p>
                )}
              </div>
              <div>
                <FieldLabel label="Descripción" hint="máx. 250 caracteres" />
                <textarea
                  className="w-full rounded-md border px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 transition-colors"
                  style={{
                    minHeight: 72,
                    backgroundColor: colors.input,
                    borderColor: errors.description ? colors.destructive : colors.border,
                    color: colors.foreground,
                  }}
                  placeholder="Razón social o nombre del proveedor"
                  value={form.description}
                  onChange={e => set('description', e.target.value)}
                  maxLength={250}
                  rows={3}
                />
                {errors.description && (
                  <p className="text-xs mt-1" style={{ color: colors.destructive }}>{errors.description}</p>
                )}
              </div>
            </div>
          </div>

          <Separator style={{ backgroundColor: colors.border }} />

          {/* Cuentas contables */}
          <div>
            <SectionTitle>Cuentas contables</SectionTitle>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <FieldLabel label="Cuenta débito" hint="máx. 50" />
                <Input
                  placeholder="Ej. 2100"
                  value={form.debit_account}
                  onChange={e => set('debit_account', e.target.value)}
                  maxLength={50}
                />
              </div>
              <div>
                <FieldLabel label="Cuenta crédito" hint="máx. 50" />
                <Input
                  placeholder="Ej. 4100"
                  value={form.credit_account}
                  onChange={e => set('credit_account', e.target.value)}
                  maxLength={50}
                />
              </div>
              <div className="col-span-2">
                <FieldLabel label="Cuenta IVA" hint="máx. 50" />
                <Input
                  placeholder="Ej. 2408"
                  value={form.tax_vat_account}
                  onChange={e => set('tax_vat_account', e.target.value)}
                  maxLength={50}
                />
              </div>
            </div>
          </div>

          <Separator style={{ backgroundColor: colors.border }} />

          {/* Retenciones */}
          <div>
            <SectionTitle>Retenciones</SectionTitle>
            <div className="space-y-4">
              <div>
                <FieldLabel label="Cuenta retenciones" hint="máx. 255" />
                <Input
                  placeholder="Ej. 2100-01"
                  value={form.withholdings_account}
                  onChange={e => set('withholdings_account', e.target.value)}
                  maxLength={255}
                />
              </div>
              <div>
                <FieldLabel label="Cuenta retención" hint="máx. 50" />
                <Input
                  placeholder="Ej. 2100-02"
                  value={form.withholding_account}
                  onChange={e => set('withholding_account', e.target.value)}
                  maxLength={50}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FieldLabel label="Monto mínimo" />
                  <Input
                    type="number"
                    placeholder="0"
                    value={form.withholdings_threshold}
                    onChange={e => set('withholdings_threshold', e.target.value)}
                    min={0}
                  />
                </div>
                <div>
                  <FieldLabel label="Porcentaje (%)" />
                  <Input
                    type="number"
                    placeholder="0"
                    value={form.withholdings_percentage}
                    onChange={e => set('withholdings_percentage', e.target.value)}
                    min={0}
                    max={100}
                    step={0.01}
                    error={!!errors.withholdings_percentage}
                  />
                  {errors.withholdings_percentage && (
                    <p className="text-xs mt-1" style={{ color: colors.destructive }}>{errors.withholdings_percentage}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <Separator style={{ backgroundColor: colors.border }} />

          {/* Estado */}
          <div>
            <SectionTitle>Estado</SectionTitle>
            <div
              className="flex items-center justify-between p-3 rounded-lg"
              style={{ backgroundColor: colors.muted }}
            >
              <div>
                <p className="text-sm font-semibold" style={{ color: colors.foreground }}>Proveedor activo</p>
                <p className="text-xs mt-0.5" style={{ color: colors.mutedForeground }}>
                  {form.is_active ? 'Habilitado para operar' : 'Inhabilitado temporalmente'}
                </p>
              </div>
              <Switch
                checked={form.is_active}
                onCheckedChange={val => set('is_active', val)}
              />
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div
          className="px-6 py-4 flex gap-3 shrink-0 border-t"
          style={{ borderColor: colors.border, backgroundColor: colors.background }}
        >
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            className="flex-1"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{isEditing ? 'Guardando...' : 'Creando...'}</>
            ) : (
              isEditing ? 'Guardar cambios' : 'Crear proveedor'
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
