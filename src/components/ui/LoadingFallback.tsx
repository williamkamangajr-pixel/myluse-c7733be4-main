import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface LoadingFallbackProps {
  className?: string;
  type?: 'card' | 'list' | 'chart' | 'page';
}

export function LoadingFallback({ className, type = 'card' }: LoadingFallbackProps) {
  if (type === 'page') {
    return (
      <div className={cn('space-y-4', className)}>
        <Skeleton className="h-32 w-full rounded-2xl" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (type === 'chart') {
    return (
      <div className={cn('premium-card', className)}>
        <Skeleton className="mb-4 h-4 w-32" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (type === 'list') {
    return (
      <div className={cn('space-y-2', className)}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className={cn('premium-card', className)}>
      <div className="space-y-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-full" />
      </div>
    </div>
  );
}
