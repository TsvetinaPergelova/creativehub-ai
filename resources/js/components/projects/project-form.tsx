import { Form } from '@inertiajs/react';
import ProjectController from '@/actions/App/Http/Controllers/Projects/ProjectController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Project } from '@/types';

export default function ProjectForm({ project }: { project?: Project }) {
    const action = project
        ? ProjectController.update.form(project.id)
        : ProjectController.store.form();

    return (
        <Form {...action} className="space-y-6">
            {({ processing, errors }) => (
                <>
                    <div className="grid gap-2">
                        <Label htmlFor="name">Project name</Label>
                        <Input
                            id="name"
                            name="name"
                            defaultValue={project?.name}
                            placeholder="Spring Wedding"
                            required
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="category">Category</Label>
                        <Input
                            id="category"
                            name="category"
                            defaultValue={project?.category}
                            placeholder="Weddings"
                            required
                        />
                        <InputError message={errors.category} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            name="description"
                            defaultValue={project?.description ?? ''}
                            placeholder="Tell clients what makes this collection special."
                            rows={5}
                        />
                        <InputError message={errors.description} />
                    </div>

                    <Button type="submit" disabled={processing}>
                        {project ? 'Save changes' : 'Create project'}
                    </Button>
                </>
            )}
        </Form>
    );
}
