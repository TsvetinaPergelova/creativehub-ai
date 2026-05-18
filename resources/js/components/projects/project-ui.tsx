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
                'rounded-xl border border-white/10 bg-card/60 p-4 sm:p-5',
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
                <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
                {description ? (
                    <p className="text-sm leading-6 text-muted-foreground">
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
                'rounded-xl border border-white/10 bg-background/50 p-4',
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
                'w-full rounded-xl border bg-background/50 p-4 text-left transition hover:border-primary/35 hover:bg-background/70 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-60',
                selected
                    ? 'border-primary/35 bg-primary/10'
                    : 'border-white/10',
                className,
            )}
        >
            <div className="flex items-start gap-3">
                <ProjectIconBadge
                    icon={icon}
                    className={selected ? 'bg-primary text-primary-foreground' : undefined}
                />
                <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium">{title}</p>
                        {badge}
                    </div>
                    <p className="text-sm leading-6 text-muted-foreground">
                        {description}
                    </p>
                </div>
            </div>
        </button>
    );
}
