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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Loader2, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { colors } from '@/lib/colors';
import { AdminUser } from '@/types/adminUser';
import {
  UserCreateBody,
  UserUpdateBody,
  useCreateUserMutation,
  useUpdateUserMutation,
} from '@/store/api/usersApi';

interface FormState {
  name: string;
  email: string;
  role: 'user' | 'admin';
  active: boolean;
  companyIds: string[];
}

const emptyForm: FormState = {
  name: '',
  email: '',
  role: 'user',
  active: true,
  companyIds: [],
};

function userToForm(u: AdminUser): FormState {
  return {
    name: u.name ?? '',
    email: u.email ?? '',
    role: u.role ?? 'user',
    active: u.active ?? true,
    companyIds: (u.company_access ?? []).map(String),
  };
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: AdminUser | null;
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

export function UserSlideOver({ open, onOpenChange, user, companies }: Props) {
  const isEditing = !!user;
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const isLoading = isCreating || isUpdating;

  useEffect(() => {
    if (open) {
      setForm(user ? userToForm(user) : emptyForm);
      setErrors({});
    }
  }, [open, user]);

  const set = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const toggleCompany = (id: string) => {
    setForm(prev => ({
      ...prev,
      companyIds: prev.companyIds.includes(id)
        ? prev.companyIds.filter(c => c !== id)
        : [...prev.companyIds, id],
    }));
    if (errors.companyIds) setErrors(prev => ({ ...prev, companyIds: undefined }));
  };

  const validate = (): boolean => {
    const next: typeof errors = {};
    if (!form.name.trim()) next.name = 'El nombre es requerido';
    if (form.name.trim().length > 0 && form.name.trim().length < 3) next.name = 'Mínimo 3 caracteres';
    if (form.name.length > 50) next.name = 'Máximo 50 caracteres';
    if (!form.email.trim()) next.email = 'El email es requerido';
    if (form.companyIds.length === 0) next.companyIds = 'Selecciona al menos una compañía';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const company_access = form.companyIds.map(String);

    try {
      if (isEditing) {
        const data: UserUpdateBody = {
          name: form.name.trim(),
          email: form.email.trim(),
          role: form.role,
          active: form.active,
          company_access,
        };
        await updateUser({ id: user!.id, data }).unwrap();
        toast.success('Usuario actualizado correctamente');
      } else {
        const data: UserCreateBody = {
          name: form.name.trim(),
          email: form.email.trim(),
          role: form.role,
          company_access,
        };
        await createUser(data).unwrap();
        toast.success('Usuario creado. Se envió un correo con el código QR para configurar el acceso.');
      }
      onOpenChange(false);
    } catch (err) {
      const e = err as { data?: { message?: string } };
      toast.error(e?.data?.message || 'Error al guardar el usuario');
    }
  };

  const selectedCompanyNames = companies
    .filter(c => form.companyIds.includes(String(c.id)))
    .map(c => c.description);

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
            {isEditing ? 'Editar usuario' : 'Nuevo usuario'}
          </SheetTitle>
          <SheetDescription className="text-xs" style={{ color: colors.mutedForeground }}>
            {isEditing
              ? `Modificando ${user!.email}`
              : 'Completa los datos para registrar un nuevo usuario'}
          </SheetDescription>
        </SheetHeader>

        {/* Scrollable form body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

          {/* Identificación */}
          <div>
            <SectionTitle>Identificación</SectionTitle>
            <div className="space-y-4">
              <div>
                <FieldLabel label="Nombre" required hint="3-50 caracteres" />
                <Input
                  placeholder="Ej. Juana Pérez"
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                  error={!!errors.name}
                  maxLength={50}
                />
                {errors.name && (
                  <p className="text-xs mt-1" style={{ color: colors.destructive }}>{errors.name}</p>
                )}
              </div>
              <div>
                <FieldLabel label="Email" required />
                <Input
                  type="email"
                  placeholder="Ej. juana@almafconsultora.com"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                  error={!!errors.email}
                  maxLength={100}
                />
                {errors.email && (
                  <p className="text-xs mt-1" style={{ color: colors.destructive }}>{errors.email}</p>
                )}
              </div>
            </div>
          </div>

          <Separator style={{ backgroundColor: colors.border }} />

          {/* Rol y compañías */}
          <div>
            <SectionTitle>Rol y acceso</SectionTitle>
            <div className="space-y-4">
              <div>
                <FieldLabel label="Rol" required />
                <Select
                  value={form.role}
                  onValueChange={val => set('role', val as 'user' | 'admin')}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Usuario</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <FieldLabel label="Compañías" required />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between font-normal"
                      aria-invalid={!!errors.companyIds}
                    >
                      <span className="truncate text-left">
                        {selectedCompanyNames.length > 0
                          ? selectedCompanyNames.join(', ')
                          : 'Selecciona una o más compañías'}
                      </span>
                      <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-[--radix-dropdown-menu-trigger-width]">
                    <DropdownMenuLabel>Compañías</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {companies.map(company => (
                      <DropdownMenuCheckboxItem
                        key={company.id}
                        checked={form.companyIds.includes(String(company.id))}
                        onCheckedChange={() => toggleCompany(String(company.id))}
                        onSelect={e => e.preventDefault()}
                      >
                        {company.description}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                {errors.companyIds && (
                  <p className="text-xs mt-1" style={{ color: colors.destructive }}>{errors.companyIds}</p>
                )}
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
                <p className="text-sm font-semibold" style={{ color: colors.foreground }}>Usuario activo</p>
                <p className="text-xs mt-0.5" style={{ color: colors.mutedForeground }}>
                  {form.active ? 'Habilitado para operar' : 'Inhabilitado temporalmente'}
                </p>
              </div>
              <Switch
                checked={form.active}
                onCheckedChange={val => set('active', val)}
                disabled={!isEditing}
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
              isEditing ? 'Guardar cambios' : 'Crear usuario'
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
