import type { LucideIcon } from 'lucide-react';
import { Monitor, Moon, Sun } from 'lucide-react';
import type { HTMLAttributes } from 'react';
import type { Appearance } from '@/hooks/use-appearance';
import { useAppearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';

export default function AppearanceToggleTab({
    className = '',
    ...props
}: HTMLAttributes<HTMLDivElement>) {
    const { appearance, updateAppearance } = useAppearance();

    const tabs: { value: Appearance; icon: LucideIcon; label: string }[] = [
        { value: 'light', icon: Sun, label: 'Light' },
        { value: 'dark', icon: Moon, label: 'Dark' },
        { value: 'system', icon: Monitor, label: 'System' },
    ];

    return (
        <div
            className={cn(
                'inline-flex gap-1 rounded-full border border-primary/35 bg-primary/10 p-1 shadow-[0_10px_24px_rgba(99,102,241,0.04)] dark:border-white/10 dark:bg-background/50 dark:shadow-none',
                className,
            )}
            {...props}
        >
            {tabs.map(({ value, icon: Icon, label }) => (
                <button
                    key={value}
                    onClick={() => updateAppearance(value)}
                    className={cn(
                        'flex items-center rounded-full px-4 py-2 transition-colors',
                        appearance === value
                            ? 'border border-primary/28 bg-white text-primary shadow-[0_8px_18px_rgba(99,102,241,0.06)] dark:border-white/10 dark:bg-primary/12 dark:text-foreground dark:shadow-none'
                            : 'text-slate-600 hover:border-primary/20 hover:bg-white/70 hover:text-primary dark:text-muted-foreground dark:hover:border-white/10 dark:hover:bg-white/[0.04] dark:hover:text-foreground',
                    )}
                >
                    <Icon className="h-4 w-4" />
                    <span className="ml-2 text-sm font-medium">{label}</span>
                </button>
            ))}
        </div>
    );
}
