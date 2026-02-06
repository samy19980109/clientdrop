import { cn, getInitials } from '@/lib/utils';

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Avatar({ name, size = 'md', className }: AvatarProps) {
  const colors = [
    'bg-blue-500',
    'bg-emerald-500',
    'bg-violet-500',
    'bg-amber-500',
    'bg-rose-500',
    'bg-cyan-500',
    'bg-indigo-500',
    'bg-teal-500',
  ];

  const colorIndex = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center rounded-full text-white font-medium shrink-0',
        colors[colorIndex],
        {
          'w-8 h-8 text-xs': size === 'sm',
          'w-10 h-10 text-sm': size === 'md',
          'w-12 h-12 text-base': size === 'lg',
        },
        className
      )}
    >
      {getInitials(name)}
    </div>
  );
}
