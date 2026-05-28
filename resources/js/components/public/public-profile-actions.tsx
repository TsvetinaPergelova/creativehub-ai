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
            <Button variant="outline" size="sm" className="rounded-full" asChild>
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
                    'rounded-full border-white/10 text-muted-foreground transition-all duration-200 hover:text-foreground',
                    isCopied
                        ? 'border-emerald-400/35 bg-emerald-500/15 text-emerald-100 hover:bg-emerald-500/20 hover:text-emerald-50'
                        : 'bg-transparent hover:border-white/15 hover:bg-white/[0.04]',
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
