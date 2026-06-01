import { colors } from "@/lib/colors";

interface PageHeaderProps {
  title: string;
  action?: React.ReactNode;
}

export default function PageHeader({ title, action }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6 gap-4">
      <h1 className="text-xl font-bold tracking-tight" style={{ color: colors.foreground }}>
        {title}
      </h1>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
