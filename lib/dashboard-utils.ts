export type TimelineOption =
  | 'today'
  | 'yesterday'
  | 'last_week'
  | 'last_30_days'
  | 'current_month'
  | 'last_90_days'
  | 'current_quarter';

export type Granularity = 'hour' | 'day' | 'week';

export interface TimeRange {
  startDate: Date;
  endDate: Date;
  granularity: Granularity;
  startISO: string;
  endISO: string;
}

export function getTimeRange(option: TimelineOption): TimeRange {
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  switch (option) {
    case 'today':
      return {
        startDate: todayStart,
        endDate: now,
        granularity: 'hour',
        startISO: todayStart.toISOString(),
        endISO: now.toISOString(),
      };
    case 'yesterday': {
      const start = new Date(todayStart);
      start.setDate(start.getDate() - 1);
      const end = new Date(todayStart);
      end.setMilliseconds(-1);
      return {
        startDate: start,
        endDate: end,
        granularity: 'hour',
        startISO: start.toISOString(),
        endISO: end.toISOString(),
      };
    }
    case 'last_week': {
      const start = new Date(todayStart);
      start.setDate(start.getDate() - 7);
      return {
        startDate: start,
        endDate: now,
        granularity: 'day',
        startISO: start.toISOString(),
        endISO: now.toISOString(),
      };
    }
    case 'last_30_days': {
      const start = new Date(todayStart);
      start.setDate(start.getDate() - 30);
      return {
        startDate: start,
        endDate: now,
        granularity: 'day',
        startISO: start.toISOString(),
        endISO: now.toISOString(),
      };
    }
    case 'current_month': {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return {
        startDate: start,
        endDate: now,
        granularity: 'day',
        startISO: start.toISOString(),
        endISO: now.toISOString(),
      };
    }
    case 'last_90_days': {
      const start = new Date(todayStart);
      start.setDate(start.getDate() - 90);
      return {
        startDate: start,
        endDate: now,
        granularity: 'week',
        startISO: start.toISOString(),
        endISO: now.toISOString(),
      };
    }
    case 'current_quarter': {
      const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3;
      const start = new Date(now.getFullYear(), quarterStartMonth, 1);
      return {
        startDate: start,
        endDate: now,
        granularity: 'week',
        startISO: start.toISOString(),
        endISO: now.toISOString(),
      };
    }
  }
}

function getBucketKey(date: Date, granularity: Granularity): string {
  if (granularity === 'hour') {
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getHours()}`;
  }
  if (granularity === 'day') {
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  }
  // week: normalize to Monday of that week
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function formatBucketLabel(date: Date, granularity: Granularity): string {
  if (granularity === 'hour') {
    return `${date.getHours().toString().padStart(2, '0')}:00`;
  }
  return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
}

export function generateBuckets(
  startDate: Date,
  endDate: Date,
  granularity: Granularity,
): { key: string; label: string }[] {
  const buckets: { key: string; label: string }[] = [];

  if (granularity === 'hour') {
    const current = new Date(startDate);
    current.setMinutes(0, 0, 0);
    while (current <= endDate) {
      buckets.push({ key: getBucketKey(current, 'hour'), label: formatBucketLabel(current, 'hour') });
      current.setHours(current.getHours() + 1);
    }
  } else if (granularity === 'day') {
    const current = new Date(startDate);
    current.setHours(0, 0, 0, 0);
    while (current <= endDate) {
      buckets.push({ key: getBucketKey(current, 'day'), label: formatBucketLabel(current, 'day') });
      current.setDate(current.getDate() + 1);
    }
  } else {
    // week
    const current = new Date(startDate);
    current.setHours(0, 0, 0, 0);
    const day = current.getDay();
    const diff = current.getDate() - day + (day === 0 ? -6 : 1);
    current.setDate(diff);
    while (current <= endDate) {
      buckets.push({ key: getBucketKey(current, 'week'), label: formatBucketLabel(current, 'week') });
      current.setDate(current.getDate() + 7);
    }
  }

  return buckets;
}

export function bucketizeCounts(
  dates: string[],
  timeRange: TimeRange,
): { label: string; count: number }[] {
  const { startDate, endDate, granularity } = timeRange;
  const buckets = generateBuckets(startDate, endDate, granularity);
  const counts = new Map<string, number>(buckets.map(b => [b.key, 0]));

  dates.forEach(dateStr => {
    const d = new Date(dateStr);
    if (d >= startDate && d <= endDate) {
      const key = getBucketKey(d, granularity);
      if (counts.has(key)) counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  });

  return buckets.map(b => ({ label: b.label, count: counts.get(b.key) ?? 0 }));
}

export function bucketizeRevenue(
  items: { date: string; revenue: number }[],
  timeRange: TimeRange,
): { label: string; revenue: number }[] {
  const { startDate, endDate, granularity } = timeRange;
  const buckets = generateBuckets(startDate, endDate, granularity);
  const sums = new Map<string, number>(buckets.map(b => [b.key, 0]));

  items.forEach(item => {
    const d = new Date(item.date);
    if (d >= startDate && d <= endDate) {
      const key = getBucketKey(d, granularity);
      if (sums.has(key)) sums.set(key, (sums.get(key) ?? 0) + item.revenue);
    }
  });

  return buckets.map(b => ({ label: b.label, revenue: sums.get(b.key) ?? 0 }));
}

export function formatCurrency(value: number): string {
  return value.toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
