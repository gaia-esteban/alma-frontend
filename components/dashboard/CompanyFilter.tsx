'use client';

import { Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Company } from '@/types/company';

interface CompanyFilterProps {
  companies: Company[];
  selectedCompanyIds: string[] | null;
  isAllCompaniesSelected: boolean;
  onToggleCompany: (id: string) => void;
  onToggleAll: () => void;
}

/**
 * Single/multi company selector dropdown. Shared between the incoming-orders
 * page and the /home dashboard so both filter data the same way.
 */
export function CompanyFilter({
  companies,
  selectedCompanyIds,
  isAllCompaniesSelected,
  onToggleCompany,
  onToggleAll,
}: CompanyFilterProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 shrink-0 gap-1.5">
          <Building2 className="h-3.5 w-3.5" />
          {isAllCompaniesSelected
            ? 'Todas las compañías'
            : selectedCompanyIds!.length === 0
              ? 'Ninguna compañía'
              : `${selectedCompanyIds!.length} compañía${selectedCompanyIds!.length === 1 ? '' : 's'}`}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuCheckboxItem
          checked={isAllCompaniesSelected}
          onSelect={(e) => e.preventDefault()}
          onCheckedChange={onToggleAll}
        >
          Todas las compañías
        </DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        {companies.map(company => {
          const id = String(company.id);
          const checked = isAllCompaniesSelected || (selectedCompanyIds?.includes(id) ?? false);
          return (
            <DropdownMenuCheckboxItem
              key={id}
              checked={checked}
              onSelect={(e) => e.preventDefault()}
              onCheckedChange={() => onToggleCompany(id)}
            >
              {company.description}
            </DropdownMenuCheckboxItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
