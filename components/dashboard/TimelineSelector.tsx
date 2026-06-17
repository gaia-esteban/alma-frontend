'use client';

import { cn } from '@/lib/utils';
import { TimelineOption } from '@/lib/dashboard-utils';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const QUICK_OPTIONS: { value: TimelineOption; label: string }[] = [
  { value: 'today', label: 'Hoy' },
  { value: 'yesterday', label: 'Ayer' },
  { value: 'last_week', label: 'Última semana' },
];

const DROPDOWN_VALUES: TimelineOption[] = [
  'current_month',
  'last_30_days',
  'current_quarter',
  'last_90_days',
];


interface TimelineSelectorProps {
  value: TimelineOption;
  onChange: (value: TimelineOption) => void;
}

export function TimelineSelector({ value, onChange }: TimelineSelectorProps) {
  const isDropdownActive = DROPDOWN_VALUES.includes(value);

  return (
    <div className="flex items-center gap-2">
      {/* Quick-access pills */}
      <div className="flex gap-1 rounded-lg p-1 bg-muted">
        {QUICK_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={cn(
              'px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 whitespace-nowrap',
              value === opt.value
                ? 'bg-[#172C3B] text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Grouped dropdown for month / quarter */}
      <Select
        value={isDropdownActive ? value : ''}
        onValueChange={v => onChange(v as TimelineOption)}
      >
        <SelectTrigger
          className={cn(
            'h-[34px] w-auto min-w-[148px] text-xs border transition-all duration-200',
            isDropdownActive
              ? 'bg-[#172C3B] text-white border-[#172C3B] [&>svg]:text-white'
              : 'bg-background text-muted-foreground hover:text-foreground',
          )}
        >
          <SelectValue placeholder="Mes / Trimestre" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel className="text-xs text-muted-foreground px-2 py-1">Mes</SelectLabel>
            <SelectItem value="current_month" className="text-xs">Mes actual</SelectItem>
            <SelectItem value="last_30_days" className="text-xs">Últimos 30 días</SelectItem>
          </SelectGroup>
          <SelectGroup>
            <SelectLabel className="text-xs text-muted-foreground px-2 py-1">Trimestre</SelectLabel>
            <SelectItem value="current_quarter" className="text-xs">Trimestre actual</SelectItem>
            <SelectItem value="last_90_days" className="text-xs">Últimos 90 días</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
