'use client';

import React, { useMemo } from 'react';
import { useGetIncomingOrdersQuery } from '@/store/api/incomingOrdersApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { colors } from '@/lib/colors';
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Calendar,
  AlertCircle
} from 'lucide-react';

export default function HomePage() {
  const { isHydrated } = useAuth();

  // Fetch incoming orders with populate=true to get details
  const { data, isLoading, error } = useGetIncomingOrdersQuery({
    populate: true,
    limit: 1000 // Get all orders for dashboard analytics
  }, {
    skip: !isHydrated, // Skip query until auth is hydrated
  });

  // Calculate KPIs and chart data
  const dashboardData = useMemo(() => {
    if (!data?.data) {
      return null;
    }

    const orders = data.data;

    // Calculate total revenue from order details
    const totalRevenue = orders.reduce((sum, order) => {
      const orderTotal = order.details?.reduce((detailSum, detail) =>
        detailSum + detail.totalPrice, 0) || 0;
      return sum + orderTotal;
    }, 0);

    // Calculate average order value
    const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

    // Calculate pending payments (orders with due dates in the future)
    const today = new Date();
    const pendingOrders = orders.filter(order => new Date(order.dueDate) > today);
    const pendingAmount = pendingOrders.reduce((sum, order) => {
      const orderTotal = order.details?.reduce((detailSum, detail) =>
        detailSum + detail.totalPrice, 0) || 0;
      return sum + orderTotal;
    }, 0);

    // Overdue orders
    const overdueOrders = orders.filter(order => new Date(order.dueDate) < today);

    // Revenue by month
    const revenueByMonth = orders.reduce((acc: Record<string, number>, order) => {
      const month = new Date(order.issuanceDate).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric'
      });
      const orderTotal = order.details?.reduce((sum, detail) => sum + detail.totalPrice, 0) || 0;
      acc[month] = (acc[month] || 0) + orderTotal;
      return acc;
    }, {});

    const revenueChartData = Object.entries(revenueByMonth)
      .map(([month, revenue]) => ({ month, revenue }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
      .slice(-6); // Last 6 months

    // Payment methods distribution
    const paymentMethodsCount = orders.reduce((acc: Record<string, number>, order) => {
      acc[order.paymentMethod] = (acc[order.paymentMethod] || 0) + 1;
      return acc;
    }, {});

    const paymentMethodsData = Object.entries(paymentMethodsCount).map(([method, count]) => ({
      name: method || 'Not specified',
      value: count,
    }));

    // Top suppliers by revenue and order count
    const supplierStats = orders.reduce((acc: Record<string, { revenue: number; orders: number }>, order) => {
      const supplierName = typeof order.supplier === 'object' && order.supplier !== null
        ? (order.supplier as any).name || order.supplierId
        : order.supplierId;
      const orderTotal = order.details?.reduce((sum, detail) => sum + detail.totalPrice, 0) || 0;

      if (!acc[supplierName]) {
        acc[supplierName] = { revenue: 0, orders: 0 };
      }
      acc[supplierName].revenue += orderTotal;
      acc[supplierName].orders += 1;
      return acc;
    }, {});

    const topSuppliersData = Object.entries(supplierStats)
      .map(([supplier, stats]) => ({
        supplier,
        revenue: stats.revenue,
        orders: stats.orders
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Upcoming due dates (next 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const upcomingDue = orders
      .filter(order => {
        const dueDate = new Date(order.dueDate);
        return dueDate > today && dueDate <= thirtyDaysFromNow;
      })
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 5);

    return {
      totalRevenue,
      orderCount: orders.length,
      avgOrderValue,
      pendingAmount,
      overdueCount: overdueOrders.length,
      revenueChartData,
      paymentMethodsData,
      topSuppliersData,
      upcomingDue,
    };
  }, [data]);

  // Show loading state while checking localStorage or loading data
  if (!isHydrated || isLoading) {
    return (
      <div className="w-full space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="w-full">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Error al Cargar el Tablero
            </CardTitle>
            <CardDescription>
              No se pueden cargar los datos del tablero. Por favor, intente nuevamente más tarde.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const COLORS = [colors.primary, colors.secondary, '#8884d8', '#82ca9d', '#ffc658', '#ff8042'];

  return (
    <div className="w-full space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold" style={{ color: colors.secondary }}>
          Tablero
        </h1>
        <p className="text-sm md:text-base text-muted-foreground mt-1">
          Resumen del rendimiento de su negocio y métricas clave
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${dashboardData.totalRevenue.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              De {dashboardData.orderCount} pedidos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.orderCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Todos los pedidos entrantes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Valor Promedio por Pedido</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${dashboardData.avgOrderValue.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Por pedido
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pagos Pendientes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${dashboardData.pendingAmount.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {dashboardData.overdueCount > 0 && (
                <span className="text-destructive font-medium">
                  {dashboardData.overdueCount} vencidos
                </span>
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Revenue Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Tendencia de Ingresos</CardTitle>
            <CardDescription>Ingresos mensuales durante los últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dashboardData.revenueChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value: number) => `$${value.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}`}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke={colors.primary}
                  strokeWidth={2}
                  name="Ingresos"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Payment Methods Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Métodos de Pago</CardTitle>
            <CardDescription>Distribución de métodos de pago utilizados</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dashboardData.paymentMethodsData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: { name: string; percent: number }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {dashboardData.paymentMethodsData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Top Suppliers */}
        <Card>
          <CardHeader>
            <CardTitle>Principales Proveedores</CardTitle>
            <CardDescription>Proveedores por ingresos y cantidad de pedidos</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dashboardData.topSuppliersData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis
                  dataKey="supplier"
                  type="category"
                  width={100}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip
                  formatter={(value: number, name: string) => {
                    if (name === 'Ingresos') {
                      return `$${value.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}`;
                    }
                    return value;
                  }}
                />
                <Legend />
                <Bar dataKey="revenue" fill={colors.primary} name="Ingresos" />
                <Bar dataKey="orders" fill={colors.secondary} name="Pedidos" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Upcoming Due Dates */}
        <Card>
          <CardHeader>
            <CardTitle>Próximos Vencimientos</CardTitle>
            <CardDescription>Pedidos con vencimiento en los próximos 30 días</CardDescription>
          </CardHeader>
          <CardContent>
            {dashboardData.upcomingDue.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.upcomingDue.map((order) => {
                  const orderTotal = order.details?.reduce((sum, detail) =>
                    sum + detail.totalPrice, 0) || 0;
                  const daysUntilDue = Math.ceil(
                    (new Date(order.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                  );

                  return (
                    <div
                      key={order.id}
                      className="flex justify-between items-start p-3 rounded-lg border"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-sm">{order.number}</p>
                        <p className="text-xs text-muted-foreground">
                          Vence: {new Date(order.dueDate).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-sm">
                          ${orderTotal.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}
                        </p>
                        <p
                          className="text-xs font-medium"
                          style={{
                            color: daysUntilDue <= 7 ? colors.destructive : colors.neutral
                          }}
                        >
                          {daysUntilDue} {daysUntilDue === 1 ? 'día' : 'días'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[252px] text-muted-foreground">
                <p className="text-sm">No hay vencimientos próximos</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
