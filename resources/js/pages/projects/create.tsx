import { Head } from '@inertiajs/react';
import ProjectForm from '@/components/projects/project-form';
import Heading from '@/components/heading';
import { create, index } from '@/actions/App/Http/Controllers/Projects/ProjectController';
import type { Project } from '@/types';

type CategoryGroup = {
    label: string;
    options: string[];
};

export default function CreateProject({
    project,
    categoryGroups,
}: {
    project?: Project;
    categoryGroups: CategoryGroup[];
}) {
    const isEditing = Boolean(project);

    return (
        <>
            <Head title={isEditing ? 'Edit project' : 'Create project'} />

            <div className="max-w-4xl space-y-6 p-4">
                <Heading
                    title={isEditing ? 'Edit project' : 'Create project'}
                    description="Set the foundation for a new collection before you upload and curate its imagery."
                />

                <div className="rounded-xl border p-6">
                    <ProjectForm
                        project={project}
                        categoryGroups={categoryGroups}
                    />
                </div>
            </div>
        </>
    );
}

CreateProject.layout = {
    breadcrumbs: [
        {
            title: 'Projects',
            href: index(),
        },
        {
            title: 'Create project',
            href: create(),
        },
    ],
};
