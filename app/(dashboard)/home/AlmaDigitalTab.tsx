'use client';

import { useState, useMemo } from 'react';
import { useGetEventLogQuery } from '@/store/api/eventLogApi';
import { useGetIncomingOrdersStatsQuery } from '@/store/api/incomingOrdersApi';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TimelineSelector } from '@/components/dashboard/TimelineSelector';
import { LoginHistoryAreaChart } from '@/components/charts/LoginHistoryAreaChart';
import { TopUsersRankList } from '@/components/charts/TopUsersRankList';
import { TopUsersByFilesRankList } from '@/components/charts/TopUsersByFilesRankList';
import { InvoicesVsAccountingFilesBarChart } from '@/components/charts/InvoicesVsAccountingFilesBarChart';
import { CompanyVolumeBarChart } from '@/components/charts/CompanyVolumeBarChart';
import { getTimeRange, bucketizeCounts, bucketizeAggregates, TimelineOption } from '@/lib/dashboard-utils';
import { colors } from '@/lib/colors';
import { LogIn, FolderOpen, FileInput, AlertCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';

type KpiStatus = 'success' | 'warning' | 'danger';

const statusColors: Record<KpiStatus, string> = {
  success: colors.success,
  warning: colors.primary,
  danger: colors.destructive,
};

interface AlmaDigitalTabProps {
  companyId?: string;
}

export function AlmaDigitalTab({ companyId }: AlmaDigitalTabProps) {
  const { isHydrated, user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [timeline, setTimeline] = useState<TimelineOption>('current_month');

  const timeRange = useMemo(() => getTimeRange(timeline), [timeline]);

  const { data: eventsData, isLoading: eventsLoading, error: eventsError } = useGetEventLogQuery(
    { companyId: companyId!, startDate: timeRange.startISO, endDate: timeRange.endISO, limit: 1000 },
    { skip: !isHydrated || !companyId },
  );

  const { data: statsData, isLoading: statsLoading } = useGetIncomingOrdersStatsQuery(
    { companyId: companyId!, startDate: timeRange.startISO, endDate: timeRange.endISO, granularity: timeRange.granularity },
    { skip: !isHydrated || !companyId },
  );

  const isLoading = !isHydrated || eventsLoading || statsLoading;

  const analytics = useMemo(() => {
    const events = eventsData?.data ?? [];
    const stats = statsData?.data;

    const loginEvents = events.filter(e => e.eventName === 'LOGGED_IN');
    const successLogins = loginEvents.filter(e => e.outcome === 'SUCCESS');
    const accountingEvents = events.filter(e => e.eventName === 'ACCOUNTING_FILE_CREATED');

    const loginChartData = bucketizeCounts(
      successLogins.map(e => e.createdAt),
      timeRange,
    ).map(d => ({ label: d.label, logins: d.count }));

    const userLoginCounts = successLogins.reduce<Record<string, number>>((acc, e) => {
      const email = e.userEmail ?? 'Desconocido';
      acc[email] = (acc[email] ?? 0) + 1;
      return acc;
    }, {});
    const topUsersByLogins = Object.entries(userLoginCounts)
      .map(([email, logins]) => ({ email, logins }))
      .sort((a, b) => b.logins - a.logins)
      .slice(0, 8);

    const userFileCounts = accountingEvents.reduce<Record<string, number>>((acc, e) => {
      const email = e.userEmail ?? 'Desconocido';
      acc[email] = (acc[email] ?? 0) + 1;
      return acc;
    }, {});
    const topUsersByFiles = Object.entries(userFileCounts)
      .map(([email, files]) => ({ email, files }))
      .sort((a, b) => b.files - a.files)
      .slice(0, 8);

    // "Archivos contables creados" / "% procesadas" / the per-company and
    // per-period breakdowns all come from a server-side GROUP BY aggregate
    // (see invoiceService.getInvoiceStats), not a row-limited invoice fetch —
    // a single high-volume company can no longer crowd out the others.
    const invoicesCreated = stats?.totals.received ?? 0;
    const invoicesProcessed = stats?.totals.processed ?? 0;
    const pctProcessed = invoicesCreated > 0 ? (invoicesProcessed / invoicesCreated) * 100 : 0;

    const opsVolumeChartData = bucketizeAggregates(stats?.byBucket ?? [], timeRange);

    const companyBreakdown = (stats?.byCompany ?? [])
      .map(c => ({ company: c.description, invoices: c.received, files: c.processed }))
      .sort((a, b) => b.invoices - a.invoices)
      .slice(0, 10);

    return {
      totalLogins: successLogins.length,
      accountingFiles: invoicesProcessed,
      invoicesReceived: invoicesCreated,
      invoicesCreated,
      invoicesProcessed,
      pctProcessed,
      loginChartData,
      topUsersByLogins,
      topUsersByFiles,
      opsVolumeChartData,
      companyBreakdown,
    };
  }, [eventsData, statsData, timeRange]);

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

  const pctProcessedStatus: KpiStatus =
    analytics.pctProcessed > 85 ? 'success' : analytics.pctProcessed > 70 ? 'warning' : 'danger';

  const kpis: {
    label: string;
    value: string;
    sub: string;
    icon: typeof LogIn;
    status?: KpiStatus;
  }[] = [
    {
      label: 'Accesos exitosos',
      value: String(analytics.totalLogins),
      sub: 'Inicios de sesión en el período',
      icon: LogIn,
    },
    {
      label: '% Facturas procesadas',
      value: `${analytics.pctProcessed.toFixed(0)}%`,
      sub: `${analytics.invoicesProcessed} procesadas de ${analytics.invoicesCreated} creadas`,
      icon: CheckCircle2,
      status: pctProcessedStatus,
    },
    {
      label: 'Archivos contables',
      value: String(analytics.accountingFiles),
      sub: 'Facturas procesadas en el período',
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
              <div className="flex items-center gap-2">
                {kpi.status && (
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: statusColors[kpi.status] }}
                    aria-hidden
                  />
                )}
                <div
                  className="text-2xl font-bold tracking-tight"
                  style={{ color: kpi.status ? statusColors[kpi.status] : colors.secondary }}
                >
                  {kpi.value}
                </div>
              </div>
              <p className="text-xs mt-1 text-muted-foreground">{kpi.sub}</p>
              {kpi.status === 'danger' && (
                <p
                  className="text-xs mt-1 font-semibold flex items-center gap-1"
                  style={{ color: colors.destructive }}
                >
                  <AlertTriangle className="h-3 w-3" /> ¡Alerta! Procesamiento por debajo del 70%
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Row 1 — facturas vs. archivos contables, por período */}
      <Card className="shadow-none">
        <CardHeader className="px-5 pt-5 pb-3">
          <CardTitle className="text-sm font-semibold">Facturas recibidas vs. archivos contables creados</CardTitle>
          <CardDescription className="text-xs">Comparativa de volumen por período</CardDescription>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          <InvoicesVsAccountingFilesBarChart data={analytics.opsVolumeChartData} />
        </CardContent>
      </Card>

      {/* Row 2 — facturas vs. archivos contables, por empresa */}
      <Card className="shadow-none">
        <CardHeader className="px-5 pt-5 pb-3">
          <CardTitle className="text-sm font-semibold">Facturas y archivos por empresa</CardTitle>
          <CardDescription className="text-xs">Comparativa de volumen por empresa en el período</CardDescription>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          <CompanyVolumeBarChart data={analytics.companyBreakdown} />
        </CardContent>
      </Card>

      {/* Row 3 — historial de accesos */}
      <Card className="shadow-none">
        <CardHeader className="px-5 pt-5 pb-3">
          <CardTitle className="text-sm font-semibold">Historial de accesos</CardTitle>
          <CardDescription className="text-xs">Accesos exitosos por período (LOGIN SUCCESS)</CardDescription>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          <LoginHistoryAreaChart data={analytics.loginChartData} />
        </CardContent>
      </Card>

      {/* Row 4 — usuarios más activos (solo administradores) */}
      {isAdmin && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="shadow-none">
            <CardHeader className="px-5 pt-5 pb-3">
              <CardTitle className="text-sm font-semibold">Usuarios más activos — Accesos</CardTitle>
              <CardDescription className="text-xs">Cantidad de inicios de sesión exitosos por usuario</CardDescription>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <TopUsersRankList data={analytics.topUsersByLogins} />
            </CardContent>
          </Card>

          <Card className="shadow-none">
            <CardHeader className="px-5 pt-5 pb-3">
              <CardTitle className="text-sm font-semibold">Usuarios más activos — Archivos generados</CardTitle>
              <CardDescription className="text-xs">Cantidad de archivos contables procesados por usuario</CardDescription>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <TopUsersByFilesRankList data={analytics.topUsersByFiles} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
