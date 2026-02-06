import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-foreground/5 p-4 mb-4">
        <Icon className="w-8 h-8 text-muted" />
      </div>
      <h3 className="text-lg font-medium text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted max-w-sm mb-4">{description}</p>
      {action}
    </div>
  );
}
