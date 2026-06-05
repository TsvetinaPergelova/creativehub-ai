import { useEffect, useMemo, useState } from 'react';
import { BellDot, CheckCircle2, LoaderCircle, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ProjectProcessing } from '@/types';

type ProjectCuratorPresenceProps = {
    assistantName: string;
    processing: ProjectProcessing;
    recentlyUploadedCount: number;
};

export default function ProjectCuratorPresence({
    assistantName,
    processing,
    recentlyUploadedCount,
}: ProjectCuratorPresenceProps) {
    const [isOpen, setIsOpen] = useState(false);
    const isRecentlySynced = !processing.is_reviewing && recentlyUploadedCount > 0;
    const shouldShow = processing.is_reviewing || isRecentlySynced;
    const hasNewNotification = processing.is_reviewing || isRecentlySynced;

    const notification = useMemo(() => {
        if (processing.is_reviewing) {
            return {
                eyebrow: 'Live review',
                headline: processing.current_asset_label
                    ? `Reviewing ${processing.current_asset_label}`
                    : processing.pending_count === 1
                      ? '1 image is still under review'
                      : `${processing.pending_count} images are still under review`,
                message: processing.current_asset_label
                    ? `${processing.reviewed_count} of ${processing.total_count} images are already reviewed.`
                    : 'Curator is still working through the latest uploads.',
                helper: processing.expectation,
                primaryChip: `${processing.reviewed_count}/${processing.total_count} reviewed`,
                secondaryChip: `${processing.pending_count} pending`,
                statusLabel: 'Working now',
                actionLabel: 'Open live review',
            };
        }

        return {
            eyebrow: 'Fresh update',
            headline: recentlyUploadedCount === 1
                ? 'Latest upload finished reviewing'
                : `${recentlyUploadedCount} uploads finished reviewing`,
            message: recentlyUploadedCount === 1
                ? 'The newest image has already been analyzed and added to your project.'
                : 'The newest images have already been analyzed and added to your project.',
            helper: 'Naming those uploads is optional. It only changes how they appear in the library.',
            primaryChip: `${processing.coverage_percent}% reviewed`,
            secondaryChip: recentlyUploadedCount === 1
                ? '1 new frame synced'
                : `${recentlyUploadedCount} new frames synced`,
            statusLabel: 'Ready to read',
            actionLabel: 'Open review',
        };
    }, [processing, recentlyUploadedCount]);

    useEffect(() => {
        if (!shouldShow) {
            setIsOpen(false);
        }
    }, [shouldShow]);

    if (!shouldShow) {
        return null;
    }

    return (
        <>
            {isOpen ? (
                <button
                    type="button"
                    aria-label={`Close ${assistantName} update`}
                    onClick={() => setIsOpen(false)}
                    className="fixed -inset-8 z-40 bg-background/45 backdrop-blur-[3px]"
                />
            ) : null}

            <div className="pointer-events-none fixed inset-x-4 bottom-4 z-50 sm:left-auto sm:right-6 sm:w-[22rem]">
                <div className="pointer-events-auto relative w-full">
                    {isOpen ? (
                        <div className="absolute bottom-20 right-0 w-full rounded-[1.75rem] border border-white/10 bg-background/95 p-4 shadow-none backdrop-blur-xl">
                            <div className="absolute -bottom-2 right-7 size-5 rotate-45 rounded-[0.45rem] border-r border-b border-white/10 bg-background/95" />

                            <div className="space-y-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-foreground">
                                            {assistantName}
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {notification.eyebrow}
                                        </p>
                                    </div>

                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="size-8 rounded-full"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <X className="size-4" />
                                    </Button>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-base font-semibold leading-6 text-foreground">
                                        {notification.headline}
                                    </p>
                                    <p className="text-sm leading-6 text-foreground/90">
                                        {notification.message}
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    <div className="rounded-full border border-white/10 bg-background/70 px-3 py-1.5 text-xs text-muted-foreground">
                                        {notification.primaryChip}
                                    </div>
                                    <div className="rounded-full border border-white/10 bg-background/70 px-3 py-1.5 text-xs text-muted-foreground">
                                        {notification.secondaryChip}
                                    </div>
                                </div>

                                <div className="flex items-end justify-between gap-3">
                                    <p className="min-w-0 text-xs leading-5 text-muted-foreground">
                                        {notification.helper}
                                    </p>

                                    <Button
                                        type="button"
                                        variant="ghost"
                                        className="h-9 shrink-0 rounded-full px-3 text-xs"
                                        asChild
                                    >
                                        <a
                                            href="#curator-review"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            <Sparkles className="mr-2 size-3.5" />
                                            {notification.actionLabel}
                                        </a>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ) : null}

                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={() => setIsOpen((currentState) => !currentState)}
                            aria-expanded={isOpen}
                            aria-label={isOpen ? `Hide ${assistantName} update` : `Show ${assistantName} update`}
                            className="group relative flex items-center gap-3 rounded-full border border-primary/20 bg-background/92 px-3 py-2 shadow-none backdrop-blur-xl transition hover:border-primary/35 hover:bg-background focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-none"
                        >
                            <div className="absolute inset-0 rounded-full bg-primary/10 blur-xl" />
                            <div className="relative flex size-12 items-center justify-center">
                                {hasNewNotification ? (
                                    <>
                                        <span className="absolute inset-0 rounded-full bg-primary/18 animate-ping" />
                                        <span className="absolute inset-[7px] rounded-full bg-primary/18 animate-pulse" />
                                    </>
                                ) : null}
                                <span className="relative flex size-12 items-center justify-center rounded-full border border-primary/25 bg-primary text-primary-foreground shadow-none">
                                    {processing.is_reviewing ? (
                                        <LoaderCircle className="size-5 animate-spin" />
                                    ) : (
                                        <CheckCircle2 className="size-5" />
                                    )}
                                </span>
                            </div>

                            <div className="relative pr-1 text-left">
                                <p className="text-sm font-semibold text-foreground">
                                    {assistantName}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {notification.statusLabel}
                                </p>
                            </div>

                            <div className="relative flex items-center justify-center rounded-full border border-white/10 bg-background/80 p-1.5 text-primary">
                                <BellDot className="size-4" />
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
