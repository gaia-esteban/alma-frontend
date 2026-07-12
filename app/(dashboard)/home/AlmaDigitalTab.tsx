'use client';

import { useState, useMemo } from 'react';
import { useGetEventLogQuery } from '@/store/api/eventLogApi';
import { useGetIncomingOrdersQuery } from '@/store/api/incomingOrdersApi';
import { useAuth } from '@/hooks/useAuth';
import { useAppSelector } from '@/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TimelineSelector } from '@/components/dashboard/TimelineSelector';
import { LoginHistoryAreaChart } from '@/components/charts/LoginHistoryAreaChart';
import { TopUsersRankList } from '@/components/charts/TopUsersRankList';
import { AccountingFilesBarChart } from '@/components/charts/AccountingFilesBarChart';
import { IncomingVolumeBarChart } from '@/components/charts/IncomingVolumeBarChart';
import { getTimeRange, bucketizeCounts, TimelineOption } from '@/lib/dashboard-utils';
import { colors } from '@/lib/colors';
import { LogIn, Users, FolderOpen, FileInput, AlertCircle } from 'lucide-react';

export function AlmaDigitalTab() {
  const { isHydrated } = useAuth();
  const companyAccess = useAppSelector(state => state.auth.user?.companyAccess);
  const companyId = companyAccess?.join(',');
  const [timeline, setTimeline] = useState<TimelineOption>('today');

  const timeRange = useMemo(() => getTimeRange(timeline), [timeline]);

  const { data: eventsData, isLoading: eventsLoading, error: eventsError } = useGetEventLogQuery(
    { companyId: companyId!, startDate: timeRange.startISO, endDate: timeRange.endISO, limit: 1000 },
    { skip: !isHydrated || !companyId },
  );

  const { data: invoicesData, isLoading: invoicesLoading } = useGetIncomingOrdersQuery(
    { companyId: companyId!, populate: false, limit: 1000 },
    { skip: !isHydrated || !companyId },
  );

  const isLoading = !isHydrated || eventsLoading || invoicesLoading;

  const analytics = useMemo(() => {
    const events = eventsData?.data ?? [];
    const invoices = invoicesData?.data ?? [];

    const loginEvents = events.filter(e => e.eventName === 'LOGGED_IN');
    const successLogins = loginEvents.filter(e => e.outcome === 'SUCCESS');
    const accountingEvents = events.filter(e => e.eventName === 'ACCOUNTING_FILE_CREATED');

    const uniqueUsers = new Set(successLogins.map(e => e.userEmail).filter(Boolean)).size;

    const loginChartData = bucketizeCounts(
      successLogins.map(e => e.createdAt),
      timeRange,
    ).map(d => ({ label: d.label, logins: d.count }));

    const accountingChartData = bucketizeCounts(
      accountingEvents.map(e => e.createdAt),
      timeRange,
    ).map(d => ({ label: d.label, files: d.count }));

    const userLoginCounts = successLogins.reduce<Record<string, number>>((acc, e) => {
      const email = e.userEmail ?? 'Desconocido';
      acc[email] = (acc[email] ?? 0) + 1;
      return acc;
    }, {});
    const topUsers = Object.entries(userLoginCounts)
      .map(([email, logins]) => ({ email, logins }))
      .sort((a, b) => b.logins - a.logins)
      .slice(0, 8);

    const filteredInvoices = invoices.filter(o => {
      const d = new Date(o.createdAt);
      return d >= timeRange.startDate && d <= timeRange.endDate;
    });
    const invoiceChartData = bucketizeCounts(
      filteredInvoices.map(o => o.createdAt),
      timeRange,
    ).map(d => ({ label: d.label, invoices: d.count }));

    return {
      totalLogins: successLogins.length,
      uniqueUsers,
      accountingFiles: accountingEvents.length,
      invoicesReceived: filteredInvoices.length,
      loginChartData,
      accountingChartData,
      topUsers,
      invoiceChartData,
    };
  }, [eventsData, invoicesData, timeRange]);

  if (isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-9 w-72 rounded-lg" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-[340px] w-full rounded-xl" />
          <Skeleton className="h-[340px] w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (eventsError) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2 text-base">
            <AlertCircle className="h-4 w-4" />
            Error al cargar eventos
          </CardTitle>
          <CardDescription>No se pudo acceder al registro de eventos. Intente nuevamente.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const kpis = [
    {
      label: 'Accesos exitosos',
      value: String(analytics.totalLogins),
      sub: 'Inicios de sesión en el período',
      icon: LogIn,
    },
    {
      label: 'Usuarios únicos',
      value: String(analytics.uniqueUsers),
      sub: 'Distintos usuarios activos',
      icon: Users,
    },
    {
      label: 'Archivos contables',
      value: String(analytics.accountingFiles),
      sub: 'Creados en el período',
      icon: FolderOpen,
    },
    {
      label: 'Facturas recibidas',
      value: String(analytics.invoicesReceived),
      sub: 'Nuevas facturas en el período',
      icon: FileInput,
    },
  ];

  return (
    <div className="space-y-5">
      <TimelineSelector value={timeline} onChange={setTimeline} />

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map(kpi => (
          <Card key={kpi.label} className="shadow-none">
            <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-5">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {kpi.label}
              </CardTitle>
              <kpi.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-5 pb-4">
              <div className="text-2xl font-bold tracking-tight" style={{ color: colors.secondary }}>
                {kpi.value}
              </div>
              <p className="text-xs mt-1 text-muted-foreground">{kpi.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Row 1 — accesos */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="shadow-none">
          <CardHeader className="px-5 pt-5 pb-3">
            <CardTitle className="text-sm font-semibold">Historial de accesos</CardTitle>
            <CardDescription className="text-xs">Accesos exitosos por período (LOGIN SUCCESS)</CardDescription>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <LoginHistoryAreaChart data={analytics.loginChartData} />
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader className="px-5 pt-5 pb-3">
            <CardTitle className="text-sm font-semibold">Usuarios más activos</CardTitle>
            <CardDescription className="text-xs">Por cantidad de accesos exitosos en el período</CardDescription>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <TopUsersRankList data={analytics.topUsers} />
          </CardContent>
        </Card>
      </div>

      {/* Row 2 — facturas */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="shadow-none">
          <CardHeader className="px-5 pt-5 pb-3">
            <CardTitle className="text-sm font-semibold">Volumen de facturas recibidas</CardTitle>
            <CardDescription className="text-xs">Nuevas facturas ingresadas por período</CardDescription>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <IncomingVolumeBarChart data={analytics.invoiceChartData} />
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader className="px-5 pt-5 pb-3">
            <CardTitle className="text-sm font-semibold">Archivos contables creados</CardTitle>
            <CardDescription className="text-xs">Cantidad de archivos generados por período</CardDescription>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <AccountingFilesBarChart data={analytics.accountingChartData} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
