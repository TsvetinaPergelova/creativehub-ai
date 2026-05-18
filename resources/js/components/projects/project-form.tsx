import { Form, useHttp } from '@inertiajs/react';
import {
    Camera,
    LayoutTemplate,
    LoaderCircle,
    Shapes,
    Sparkles,
    Wand2,
} from 'lucide-react';
import { useState } from 'react';
import ProjectBriefAssistantController from '@/actions/App/Http/Controllers/Projects/ProjectBriefAssistantController';
import ProjectController from '@/actions/App/Http/Controllers/Projects/ProjectController';
import InputError from '@/components/input-error';
import {
    ProjectInsetPanel,
    ProjectOptionCard,
    ProjectSection,
    ProjectSectionHeader,
} from '@/components/projects/project-ui';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { Project } from '@/types';

const projectModes = [
    {
        value: 'photography',
        label: 'Photography',
        description:
            'Best for image sets where selection strength, consistency, and cover quality matter most.',
        icon: Camera,
    },
    {
        value: 'design_case_study',
        label: 'Design / Case Study',
        description:
            'Best for branding, product, or visual design projects that need a clear hero and supporting story.',
        icon: LayoutTemplate,
    },
    {
        value: 'art_series',
        label: 'Art Series',
        description:
            'Best for smaller, more concept-driven work where the title, statement, and cohesion matter a lot.',
        icon: Sparkles,
    },
    {
        value: 'mixed_experimental',
        label: 'Mixed / Experimental',
        description:
            'Best when the project does not fit one pattern yet and you want the most neutral workflow.',
        icon: Shapes,
    },
] as const;

const customCategoryOptionValue = '__custom__';

type CategoryGroup = {
    label: string;
    options: string[];
};

type ProjectBriefAssistantPayload = {
    name: string;
    category: string;
    mode: string;
    description: string;
    project_intent: string;
    target_audience: string;
    creative_direction: string;
};

type ProjectBriefSuggestion = {
    suggested_title: string;
    suggested_description: string;
    framing_note: string;
};

type ProjectBriefSuggestionResponse = {
    suggestion: ProjectBriefSuggestion;
};

function categoryPresetForValue(
    category: string,
    categoryGroups: CategoryGroup[],
): string {
    if (category.length === 0) {
        return '';
    }

    return categoryGroups.some((group) => group.options.includes(category))
        ? category
        : customCategoryOptionValue;
}

export default function ProjectForm({
    project,
    categoryGroups,
}: {
    project?: Project;
    categoryGroups: CategoryGroup[];
}) {
    const action = project
        ? ProjectController.update.form(project.id)
        : ProjectController.store.form();
    const [suggestion, setSuggestion] = useState<ProjectBriefSuggestion | null>(
        null,
    );
    const [selectedCategoryPreset, setSelectedCategoryPreset] = useState(
        categoryPresetForValue(project?.category ?? '', categoryGroups),
    );
    const assistant = useHttp<
        ProjectBriefAssistantPayload,
        ProjectBriefSuggestionResponse
    >({
        name: project?.name ?? '',
        category: project?.category ?? '',
        mode: project?.mode ?? 'mixed_experimental',
        description: project?.description ?? '',
        project_intent: '',
        target_audience: '',
        creative_direction: '',
    });

    function updateCategoryPreset(value: string): void {
        setSelectedCategoryPreset(value);

        if (value === customCategoryOptionValue) {
            assistant.setData(
                'category',
                selectedCategoryPreset === customCategoryOptionValue
                    ? assistant.data.category
                    : '',
            );

            return;
        }

        assistant.setData('category', value);
    }

    async function generateProjectCopy(): Promise<void> {
        try {
            const response = await assistant.submit(
                ProjectBriefAssistantController.store(),
            );

            setSuggestion(response.suggestion);
        } catch {
            // Validation errors are surfaced via the useHttp state.
        }
    }

    const canGenerate = assistant.data.category.trim().length > 0;

    return (
        <Form {...action} className="space-y-5">
            {({ processing, errors }) => (
                <>
                    <ProjectSection>
                        <div className="space-y-4">
                            <ProjectSectionHeader
                                title="Category"
                                description="Start with the closest category so Curator can frame the project more intelligently."
                            />

                            <div className="grid gap-2">
                                <input
                                    type="hidden"
                                    name="category"
                                    value={assistant.data.category}
                                />

                                <Select
                                    value={selectedCategoryPreset || undefined}
                                    onValueChange={updateCategoryPreset}
                                >
                                    <SelectTrigger
                                        id="category"
                                        className="w-full"
                                        aria-label="Category"
                                    >
                                        <SelectValue placeholder="Choose a category" />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-80">
                                        {categoryGroups.map((group) => (
                                            <SelectGroup key={group.label}>
                                                <SelectLabel>
                                                    {group.label}
                                                </SelectLabel>
                                                {group.options.map(
                                                    (category) => (
                                                        <SelectItem
                                                            key={category}
                                                            value={category}
                                                        >
                                                            {category}
                                                        </SelectItem>
                                                    ),
                                                )}
                                            </SelectGroup>
                                        ))}
                                        <SelectItem
                                            value={customCategoryOptionValue}
                                        >
                                            Custom category
                                        </SelectItem>
                                    </SelectContent>
                                </Select>

                                {selectedCategoryPreset ===
                                customCategoryOptionValue ? (
                                    <Input
                                        value={assistant.data.category}
                                        onChange={(event) =>
                                            assistant.setData(
                                                'category',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Type your category"
                                        required
                                    />
                                ) : null}

                                <InputError
                                    message={
                                        errors.category ??
                                        assistant.errors.category
                                    }
                                />
                            </div>
                        </div>
                    </ProjectSection>

                    <ProjectSection>
                        <div className="space-y-4">
                            <ProjectSectionHeader
                                title="Project mode"
                                description="Choose how Curator and the dashboard should judge this project."
                            />

                            <input
                                type="hidden"
                                name="mode"
                                value={assistant.data.mode}
                            />

                            <div className="grid gap-3 md:grid-cols-2">
                                {projectModes.map((mode) => (
                                    <ProjectOptionCard
                                        key={mode.value}
                                        icon={mode.icon}
                                        title={mode.label}
                                        description={mode.description}
                                        selected={
                                            assistant.data.mode === mode.value
                                        }
                                        onClick={() =>
                                            assistant.setData(
                                                'mode',
                                                mode.value,
                                            )
                                        }
                                    />
                                ))}
                            </div>

                            <InputError
                                message={
                                    errors.mode ?? assistant.errors.mode
                                }
                            />
                        </div>
                    </ProjectSection>

                    <ProjectSection>
                        <div className="space-y-4">
                            <ProjectSectionHeader
                                title="Project context"
                                description="These fields are optional, but they help AI suggestions feel more intentional and can later support better project positioning."
                            />

                            <div className="grid gap-2">
                                <Label htmlFor="project_intent">
                                    Project intent
                                </Label>
                                <Input
                                    id="project_intent"
                                    value={assistant.data.project_intent}
                                    onChange={(event) =>
                                        assistant.setData(
                                            'project_intent',
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Portfolio piece, client delivery, visual experiment..."
                                />
                                <InputError
                                    message={assistant.errors.project_intent}
                                />
                            </div>

                            <div className="grid gap-2 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="target_audience">
                                        Audience
                                    </Label>
                                    <Input
                                        id="target_audience"
                                        value={assistant.data.target_audience}
                                        onChange={(event) =>
                                            assistant.setData(
                                                'target_audience',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Clients, creative directors, gallery visitors..."
                                    />
                                    <InputError
                                        message={
                                            assistant.errors.target_audience
                                        }
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="creative_direction">
                                        Creative direction
                                    </Label>
                                    <Input
                                        id="creative_direction"
                                        value={assistant.data.creative_direction}
                                        onChange={(event) =>
                                            assistant.setData(
                                                'creative_direction',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Elegant, bold, cinematic, minimal..."
                                    />
                                    <InputError
                                        message={
                                            assistant.errors.creative_direction
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                    </ProjectSection>

                    <ProjectSection>
                        <div className="space-y-4">
                            <ProjectSectionHeader
                                title="Description"
                                description="Describe what makes the project worth opening or sharing."
                                action={
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={generateProjectCopy}
                                        disabled={
                                            !canGenerate ||
                                            assistant.processing
                                        }
                                        className="w-full sm:w-auto"
                                    >
                                        {assistant.processing ? (
                                            <>
                                                <LoaderCircle className="size-4 animate-spin" />
                                                Generating...
                                            </>
                                        ) : (
                                            <>
                                                <Wand2 className="size-4" />
                                                Generate title and description
                                            </>
                                        )}
                                    </Button>
                                }
                            />

                            <div className="grid gap-2">
                                <Textarea
                                    id="description"
                                    name="description"
                                    value={assistant.data.description}
                                    onChange={(event) =>
                                        assistant.setData(
                                            'description',
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Tell clients what makes this collection special."
                                    rows={5}
                                />
                                <InputError
                                    message={
                                        errors.description ??
                                        assistant.errors.description
                                    }
                                />
                            </div>
                        </div>
                    </ProjectSection>

                    {suggestion ? (
                        <ProjectInsetPanel className="border-primary/20 bg-primary/[0.05]">
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <p className="text-xs font-medium tracking-[0.24em] text-primary/80 uppercase">
                                        Suggested copy
                                    </p>
                                    <p className="text-sm leading-6 text-muted-foreground">
                                        Use the parts you like, edit them, or
                                        regenerate a fresh angle.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-foreground/80">
                                        Title
                                    </p>
                                    <p className="text-lg font-semibold text-foreground">
                                        {suggestion.suggested_title}
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-foreground/80">
                                        Description
                                    </p>
                                    <p className="text-sm leading-7 text-muted-foreground">
                                        {suggestion.suggested_description}
                                    </p>
                                </div>

                                <ProjectInsetPanel className="bg-black/10 px-3 py-2">
                                    <p className="text-xs font-medium tracking-[0.22em] text-muted-foreground uppercase">
                                        Framing note
                                    </p>
                                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                        {suggestion.framing_note}
                                    </p>
                                </ProjectInsetPanel>

                                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() =>
                                            assistant.setData(
                                                'description',
                                                suggestion.suggested_description,
                                            )
                                        }
                                    >
                                        Use description
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() =>
                                            assistant.setData(
                                                'name',
                                                suggestion.suggested_title,
                                            )
                                        }
                                    >
                                        Use title
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={() => {
                                            assistant.setData(
                                                'description',
                                                suggestion.suggested_description,
                                            );
                                            assistant.setData(
                                                'name',
                                                suggestion.suggested_title,
                                            );
                                        }}
                                    >
                                        Use both
                                    </Button>
                                </div>
                            </div>
                        </ProjectInsetPanel>
                    ) : null}

                    <ProjectSection>
                        <div className="space-y-4">
                            <ProjectSectionHeader
                                title="Project name"
                                description="Add one now, or let the AI suggestion above help you land on a stronger title first."
                            />

                            <div className="grid gap-2">
                                <Input
                                    id="name"
                                    name="name"
                                    value={assistant.data.name}
                                    onChange={(event) =>
                                        assistant.setData(
                                            'name',
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Spring Wedding"
                                    required
                                />
                                <InputError
                                    message={
                                        errors.name ?? assistant.errors.name
                                    }
                                />
                            </div>
                        </div>
                    </ProjectSection>

                    <div className="flex justify-end">
                        <Button type="submit" disabled={processing}>
                            {project ? 'Save changes' : 'Create project'}
                        </Button>
                    </div>
                </>
            )}
        </Form>
    );
}
