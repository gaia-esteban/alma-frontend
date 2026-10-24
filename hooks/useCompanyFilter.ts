import { useCallback, useMemo, useState } from 'react';
import { useGetCompaniesQuery } from '@/store/api/companiesApi';
import { useAppSelector } from '@/store';
import { useAuth } from '@/hooks/useAuth';

/**
 * Shared company filter logic (list of companies, selection state, and the
 * derived comma-joined companyId used by RTK Query hooks). `null` selection
 * means "all companies" — defaults to every company the user has access to.
 */
export function useCompanyFilter() {
  const { isHydrated } = useAuth();
  const companyAccess = useAppSelector(state => state.auth.user?.companyAccess);
  const defaultCompanyId = companyAccess?.join(',');

  const [selectedCompanyIds, setSelectedCompanyIds] = useState<string[] | null>(null);

  const { data: companiesData } = useGetCompaniesQuery({ limit: 100 }, { skip: !isHydrated });
  const companies = useMemo(() => companiesData?.data ?? [], [companiesData?.data]);

  const isAllCompaniesSelected = selectedCompanyIds === null;

  const effectiveCompanyId = isAllCompaniesSelected ? defaultCompanyId : selectedCompanyIds.join(',');

  const toggleCompany = useCallback((id: string) => {
    setSelectedCompanyIds(prev => {
      const base = prev ?? companies.map(c => String(c.id));
      const next = base.includes(id) ? base.filter(c => c !== id) : [...base, id];
      // Selecting every company individually is equivalent to "all" — collapse back to it.
      return next.length === companies.length ? null : next;
    });
  }, [companies]);

  const toggleAllCompanies = useCallback(() => {
    setSelectedCompanyIds(prev => (prev === null ? [] : null));
  }, []);

  return {
    companies,
    selectedCompanyIds,
    isAllCompaniesSelected,
    effectiveCompanyId,
    toggleCompany,
    toggleAllCompanies,
  };
}
