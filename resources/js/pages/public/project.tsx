import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Project } from '@/types';

type Creator = {
    id: number;
    name: string;
    profile_url: string;
};

export default function PublicProject({
    creator,
    project,
}: {
    creator: Creator;
    project: Project;
}) {
    return (
        <>
            <Head title={project.name} />

            <div className="min-h-screen bg-[linear-gradient(180deg,#f7f3ec_0%,#ffffff_44%,#f2ede5_100%)] px-4 py-10 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-6xl space-y-8">
                    <div className="space-y-4">
                        <Link
                            href={creator.profile_url}
                            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                            <ArrowLeft className="size-4" />
                            Back to portfolio
                        </Link>

                        <div className="rounded-[2rem] border bg-white/80 p-8 shadow-sm backdrop-blur">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                                <div className="space-y-3">
                                    <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
                                        {creator.name}
                                    </p>
                                    <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                                        {project.name}
                                    </h1>
                                    <p className="max-w-3xl text-base text-muted-foreground sm:text-lg">
                                        {project.description ??
                                            'A published project from this CreativeHub portfolio.'}
                                    </p>
                                </div>

                                <div className="flex gap-2">
                                    <Badge variant="outline">
                                        {project.category}
                                    </Badge>
                                    <Badge className="capitalize">
                                        {project.visibility}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </div>

                    <section className="grid gap-4 md:grid-cols-2">
                        {(project.assets ?? []).map((asset) => (
                            <figure
                                key={asset.id}
                                className="overflow-hidden rounded-[1.5rem] border bg-white shadow-sm"
                            >
                                <img
                                    src={asset.url}
                                    alt={
                                        asset.analysis?.alt_text ??
                                        `${project.name} image`
                                    }
                                    className="aspect-[4/3] w-full object-cover"
                                />
                                <figcaption className="space-y-2 p-4">
                                    <div className="flex flex-wrap gap-2">
                                        {(asset.analysis?.tags ?? [])
                                            .slice(0, 4)
                                            .map((tag) => (
                                                <Badge
                                                    key={tag}
                                                    variant="outline"
                                                >
                                                    {tag}
                                                </Badge>
                                            ))}
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {asset.analysis?.critique ??
                                            asset.filename}
                                    </p>
                                </figcaption>
                            </figure>
                        ))}
                    </section>
                </div>
            </div>
        </>
    );
}
