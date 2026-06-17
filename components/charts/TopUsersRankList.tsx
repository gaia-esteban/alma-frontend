'use client';

import { useMemo } from 'react';
import { colors } from '@/lib/colors';

interface Props {
  data: { email: string; logins: number }[];
}

export function TopUsersRankList({ data }: Props) {
  const max = useMemo(() => Math.max(...data.map(d => d.logins), 1), [data]);

  if (!data.length) {
    return (
      <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">
        Sin accesos registrados en el período
      </div>
    );
  }

  return (
    <div className="space-y-2 py-1" style={{ minHeight: 280 }}>
      {data.map((user, i) => (
        <div key={user.email} className="flex items-center gap-3 group">
          {/* Rank */}
          <span
            className="text-xs font-semibold w-5 text-right shrink-0 tabular-nums"
            style={{ color: i === 0 ? colors.primary : colors.mutedForeground }}
          >
            {i + 1}
          </span>

          {/* Email + progress */}
          <div className="flex-1 min-w-0">
            <p
              className="text-xs font-medium truncate"
              title={user.email}
              style={{ color: colors.secondary }}
            >
              {user.email}
            </p>
            <div className="mt-1 h-1.5 rounded-full overflow-hidden bg-muted">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(user.logins / max) * 100}%`,
                  backgroundColor: i === 0 ? colors.primary : colors.secondaryLight,
                }}
              />
            </div>
          </div>

          {/* Count */}
          <span
            className="text-xs font-bold tabular-nums shrink-0"
            style={{ color: i === 0 ? colors.primary : colors.secondary }}
          >
            {user.logins}
          </span>
        </div>
      ))}
    </div>
  );
}
