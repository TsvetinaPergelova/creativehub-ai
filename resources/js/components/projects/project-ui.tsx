import { type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function ProjectSection({
    children,
    className,
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <section
            className={cn(
                'rounded-[1.5rem] border border-slate-200/85 bg-white/88 p-4 shadow-none sm:p-5 dark:border-white/10 dark:bg-card/60 dark:shadow-none',
                className,
            )}
        >
            {children}
        </section>
    );
}

export function ProjectSectionHeader({
    title,
    description,
    action,
    className,
}: {
    title: string;
    description?: string;
    action?: ReactNode;
    className?: string;
}) {
    return (
        <div
            className={cn(
                'flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between',
                className,
            )}
        >
            <div className="min-w-0 space-y-1">
                <h2 className="text-xl font-semibold tracking-tight text-slate-950 dark:text-foreground">
                    {title}
                </h2>
                {description ? (
                    <p className="text-sm leading-6 text-slate-600 dark:text-muted-foreground">
                        {description}
                    </p>
                ) : null}
            </div>
            {action ? <div className="shrink-0">{action}</div> : null}
        </div>
    );
}

export function ProjectInsetPanel({
    children,
    className,
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <div
            className={cn(
                'rounded-[1.35rem] border border-slate-200/85 bg-white p-4 shadow-none dark:border-white/10 dark:bg-background/50 dark:shadow-none',
                className,
            )}
        >
            {children}
        </div>
    );
}

export function ProjectIconBadge({
    icon: Icon,
    className,
}: {
    icon: LucideIcon;
    className?: string;
}) {
    return (
        <div
            className={cn(
                'flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/12 text-primary',
                className,
            )}
        >
            <Icon className="size-4" />
        </div>
    );
}

export function ProjectOptionCard({
    icon,
    title,
    description,
    selected = false,
    badge,
    onClick,
    disabled = false,
    className,
}: {
    icon: LucideIcon;
    title: string;
    description: string;
    selected?: boolean;
    badge?: ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    className?: string;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={cn(
                'w-full rounded-[1.35rem] border border-slate-200/85 bg-white p-4 text-left shadow-none transition hover:border-primary/25 hover:bg-white focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-60 dark:border-white/10 dark:bg-background/50 dark:shadow-none dark:hover:border-primary/20 dark:hover:bg-background/70',
                selected
                    ? 'border-primary/35 bg-primary/10 dark:bg-primary/10'
                    : '',
                className,
            )}
        >
            <div className="flex items-start gap-3">
                <ProjectIconBadge
                    icon={icon}
                    className={
                        selected
                            ? 'bg-primary text-primary-foreground'
                            : undefined
                    }
                />
                <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium text-slate-950 dark:text-foreground">
                            {title}
                        </p>
                        {badge}
                    </div>
                    <p className="text-sm leading-6 text-slate-600 dark:text-muted-foreground">
                        {description}
                    </p>
                </div>
            </div>
        </button>
    );
}
