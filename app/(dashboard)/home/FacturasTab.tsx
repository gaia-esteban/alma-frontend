'use client';

import { useState, useMemo } from 'react';
import { useGetIncomingOrdersQuery } from '@/store/api/incomingOrdersApi';
import { useAuth } from '@/hooks/useAuth';
import { useAppSelector } from '@/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TimelineSelector } from '@/components/dashboard/TimelineSelector';
import { InvoiceRevenueAreaChart } from '@/components/charts/InvoiceRevenueAreaChart';
import { PaymentMethodsDonutChart } from '@/components/charts/PaymentMethodsDonutChart';
import { TopSuppliersBarChart } from '@/components/charts/TopSuppliersBarChart';
import {
  getTimeRange,
  bucketizeRevenue,
  formatCurrency,
  TimelineOption,
} from '@/lib/dashboard-utils';
import { colors } from '@/lib/colors';
import { DollarSign, FileText, TrendingUp, Clock, AlertCircle, Calendar } from 'lucide-react';

export function FacturasTab() {
  const { isHydrated } = useAuth();
  const companyAccess = useAppSelector(state => state.auth.user?.companyAccess);
  const companyId = companyAccess?.join(',');
  const [timeline, setTimeline] = useState<TimelineOption>('today');

  const { data, isLoading, error } = useGetIncomingOrdersQuery(
    { companyId: companyId!, populate: true, limit: 1000 },
    { skip: !isHydrated || !companyId },
  );

  const timeRange = useMemo(() => getTimeRange(timeline), [timeline]);

  const analytics = useMemo(() => {
    if (!data?.data) return null;

    const filtered = data.data.filter(order => {
      const d = new Date(order.createdAt);
      return d >= timeRange.startDate && d <= timeRange.endDate;
    });

    const totalRevenue = filtered.reduce((sum, order) => {
      return sum + (order.details?.reduce((s, d) => s + d.totalPrice, 0) ?? 0);
    }, 0);

    const avgOrderValue = filtered.length > 0 ? totalRevenue / filtered.length : 0;

    const pendingAmount = filtered
      .filter(o => o.status === 'Pendiente')
      .reduce((sum, order) => sum + (order.details?.reduce((s, d) => s + d.totalPrice, 0) ?? 0), 0);

    const revenueChartData = bucketizeRevenue(
      filtered.map(o => ({
        date: o.createdAt,
        revenue: o.details?.reduce((s, d) => s + d.totalPrice, 0) ?? 0,
      })),
      timeRange,
    );

    const paymentCounts = filtered.reduce<Record<string, number>>((acc, order) => {
      const method = order.paymentMethod || 'No especificado';
      acc[method] = (acc[method] ?? 0) + 1;
      return acc;
    }, {});
    const paymentData = Object.entries(paymentCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    const supplierStats = filtered.reduce<Record<string, { revenue: number; orders: number }>>((acc, order) => {
      const name =
        typeof order.supplier === 'object' && order.supplier !== null
          ? ((order.supplier as { name?: string; description?: string }).name ??
            (order.supplier as { description?: string }).description ??
            String(order.supplierId))
          : String(order.supplierId);
      const revenue = order.details?.reduce((s, d) => s + d.totalPrice, 0) ?? 0;
      if (!acc[name]) acc[name] = { revenue: 0, orders: 0 };
      acc[name].revenue += revenue;
      acc[name].orders += 1;
      return acc;
    }, {});
    const topSuppliers = Object.entries(supplierStats)
      .map(([supplier, stats]) => ({ supplier, ...stats }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8);

    const today = new Date();
    const thirtyDaysLater = new Date(today);
    thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);
    const upcomingDue = data.data
      .filter(o => {
        const due = new Date(o.dueDate);
        return due > today && due <= thirtyDaysLater;
      })
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 6);

    const overdueCount = data.data.filter(o => new Date(o.dueDate) < today).length;

    return {
      totalRevenue,
      invoiceCount: filtered.length,
      avgOrderValue,
      pendingAmount,
      overdueCount,
      revenueChartData,
      paymentData,
      topSuppliers,
      upcomingDue,
    };
  }, [data, timeRange]);

  if (!isHydrated || isLoading) {
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

  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2 text-base">
            <AlertCircle className="h-4 w-4" />
            Error al cargar facturas
          </CardTitle>
          <CardDescription>No se pudo conectar con el servidor. Intente nuevamente.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const kpis = [
    {
      label: 'Ingresos totales',
      value: `$${formatCurrency(analytics?.totalRevenue ?? 0)}`,
      sub: `${analytics?.invoiceCount ?? 0} facturas en el período`,
      icon: DollarSign,
      highlight: false,
    },
    {
      label: 'Total facturas',
      value: String(analytics?.invoiceCount ?? 0),
      sub: 'En el período seleccionado',
      icon: FileText,
      highlight: false,
    },
    {
      label: 'Valor promedio',
      value: `$${formatCurrency(analytics?.avgOrderValue ?? 0)}`,
      sub: 'Por factura',
      icon: TrendingUp,
      highlight: false,
    },
    {
      label: 'Pendientes',
      value: `$${formatCurrency(analytics?.pendingAmount ?? 0)}`,
      sub: analytics?.overdueCount
        ? `${analytics.overdueCount} vencida${analytics.overdueCount !== 1 ? 's' : ''}`
        : 'Sin vencidos',
      icon: Clock,
      highlight: (analytics?.overdueCount ?? 0) > 0,
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
              <div
                className="text-2xl font-bold tracking-tight"
                style={{ color: kpi.highlight ? colors.destructive : colors.secondary }}
              >
                {kpi.value}
              </div>
              <p
                className="text-xs mt-1"
                style={{ color: kpi.highlight ? colors.destructive : colors.mutedForeground }}
              >
                {kpi.sub}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="shadow-none">
          <CardHeader className="px-5 pt-5 pb-3">
            <CardTitle className="text-sm font-semibold">Tendencia de ingresos</CardTitle>
            <CardDescription className="text-xs">Ingresos por período según la selección de tiempo</CardDescription>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <InvoiceRevenueAreaChart data={analytics?.revenueChartData ?? []} />
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader className="px-5 pt-5 pb-3">
            <CardTitle className="text-sm font-semibold">Métodos de pago</CardTitle>
            <CardDescription className="text-xs">Distribución de métodos utilizados en el período</CardDescription>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <PaymentMethodsDonutChart data={analytics?.paymentData ?? []} />
          </CardContent>
        </Card>
      </div>

      {/* Charts row 2 */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="shadow-none">
          <CardHeader className="px-5 pt-5 pb-3">
            <CardTitle className="text-sm font-semibold">Principales proveedores</CardTitle>
            <CardDescription className="text-xs">Por ingresos y cantidad de facturas en el período</CardDescription>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <TopSuppliersBarChart data={analytics?.topSuppliers ?? []} />
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader className="px-5 pt-5 pb-3">
            <CardTitle className="text-sm font-semibold">Próximos vencimientos</CardTitle>
            <CardDescription className="text-xs">Facturas con vencimiento en los próximos 30 días</CardDescription>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            {analytics?.upcomingDue.length ? (
              <div className="space-y-2">
                {analytics.upcomingDue.map(order => {
                  const orderTotal = order.details?.reduce((s, d) => s + d.totalPrice, 0) ?? 0;
                  const daysUntilDue = Math.ceil(
                    (new Date(order.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
                  );
                  return (
                    <div key={order.id} className="flex items-center justify-between p-3 rounded-lg border bg-background">
                      <div>
                        <p className="text-sm font-medium" style={{ color: colors.secondary }}>
                          {order.number}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Calendar className="h-3 w-3" />
                          {new Date(order.dueDate).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">${formatCurrency(orderTotal)}</p>
                        <p
                          className="text-xs font-medium"
                          style={{ color: daysUntilDue <= 7 ? colors.destructive : colors.mutedForeground }}
                        >
                          {daysUntilDue} {daysUntilDue === 1 ? 'día' : 'días'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-[280px] flex flex-col items-center justify-center gap-2 text-muted-foreground">
                <Calendar className="h-8 w-8 opacity-30" />
                <p className="text-sm">Sin vencimientos próximos</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
