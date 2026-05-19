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
                variant="ghost"
                size="sm"
                className="rounded-full text-muted-foreground hover:text-foreground"
                onClick={() => void copy(portfolioUrl)}
            >
                {isCopied ? 'Copied link' : 'Copy link'}
                {isCopied ? (
                    <Check className="size-4" />
                ) : (
                    <Copy className="size-4" />
                )}
            </Button>
        </div>
    );
}
