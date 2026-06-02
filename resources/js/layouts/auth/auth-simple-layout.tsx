import { Link } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="relative flex min-h-svh flex-col items-center justify-center gap-6 overflow-hidden bg-[linear-gradient(180deg,#f8f9ff_0%,#f5f6fd_100%)] p-6 text-foreground md:p-10 dark:bg-[linear-gradient(180deg,#09090b_0%,#111827_55%,#09090b_100%)]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.08),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(244,114,182,0.04),transparent_24%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(244,114,182,0.12),transparent_26%)]" />

            <div className="relative w-full max-w-sm">
                <div className="flex flex-col gap-8">
                    <div className="flex flex-col items-center gap-4">
                        <Link
                            href={home()}
                            className="flex flex-col items-center gap-2 font-medium"
                        >
                            <div className="mb-1 flex size-16 items-center justify-center rounded-full border border-primary/28 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.12),transparent_58%),#ffffff] text-primary ring-1 ring-primary/14 dark:border-primary/35 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01)),radial-gradient(circle_at_top_left,rgba(99,102,241,0.34),transparent_60%),#151728] dark:text-white dark:ring-primary/18">
                                <AppLogoIcon className="size-7 text-primary dark:text-white" />
                            </div>
                            <span className="sr-only">{title}</span>
                        </Link>

                        <div className="space-y-2 text-center">
                            <h1 className="text-xl font-medium">{title}</h1>
                            <p className="text-center text-sm text-foreground/68 dark:text-muted-foreground">
                                {description}
                            </p>
                        </div>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
