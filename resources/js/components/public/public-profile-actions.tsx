import { Check, Copy, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useClipboard } from '@/hooks/use-clipboard';
import { cn } from '@/lib/utils';

export default function PublicProfileActions({
    portfolioUrl,
    className,
}: {
    portfolioUrl: string | null;
    className?: string;
}) {
    const [copiedText, copy] = useClipboard();

    if (!portfolioUrl) {
        return null;
    }

    const isCopied = copiedText === portfolioUrl;

    return (
        <div className={cn('flex flex-wrap items-center gap-2.5', className)}>
            <Button
                variant="outline"
                size="sm"
                className="rounded-full border-primary/35 bg-white text-primary shadow-[0_10px_24px_rgba(15,23,42,0.05)] hover:border-primary/50 hover:bg-primary/10 hover:text-primary dark:border-white/10 dark:bg-transparent dark:text-foreground dark:hover:border-primary/20 dark:hover:bg-white/[0.04] dark:hover:text-foreground"
                asChild
            >
                <a href={portfolioUrl} target="_blank" rel="noreferrer">
                    View portfolio
                    <ExternalLink className="size-4" />
                </a>
            </Button>

            <Button
                type="button"
                variant="outline"
                size="sm"
                className={cn(
                    'rounded-full border-primary/35 bg-white text-primary shadow-[0_10px_24px_rgba(15,23,42,0.05)] transition-all duration-200 hover:border-primary/50 hover:bg-primary/10 hover:text-primary dark:border-white/10 dark:bg-transparent dark:text-muted-foreground dark:hover:border-white/15 dark:hover:bg-white/[0.04] dark:hover:text-foreground',
                    isCopied
                        ? 'border-emerald-400/35 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-100 dark:hover:bg-emerald-500/20 dark:hover:text-emerald-50'
                        : '',
                )}
                onClick={() => void copy(portfolioUrl)}
            >
                {isCopied ? 'Copied link' : 'Copy link'}
                {isCopied ? (
                    <Check className="size-4 scale-110 transition-transform duration-200" />
                ) : (
                    <Copy className="size-4 transition-transform duration-200" />
                )}
            </Button>
        </div>
    );
}
