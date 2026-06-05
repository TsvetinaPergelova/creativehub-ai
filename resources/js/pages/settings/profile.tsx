import { type ChangeEvent, type FormEvent, useEffect, useState } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    Camera,
    ExternalLink,
    Globe,
    Instagram,
    Mail,
    MapPin,
    Sparkles,
    UserRound,
} from 'lucide-react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import DeleteUser from '@/components/delete-user';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import {
    ProjectIconBadge,
    ProjectInsetPanel,
    ProjectSection,
    ProjectSectionHeader,
} from '@/components/projects/project-ui';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useInitials } from '@/hooks/use-initials';
import {
    profileCoverOptions,
    resolveProfileCoverStyle,
} from '@/lib/profile-cover';
import { edit } from '@/routes/profile';
import { send } from '@/routes/verification';

export default function Profile({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const { auth } = usePage().props;
    const user = auth.user;
    const currentUserAvatar = user?.avatar ?? null;
    const getInitials = useInitials();
    const [avatarPreview, setAvatarPreview] = useState<string | null>(
        currentUserAvatar,
    );

    const form = useForm({
        name: user?.name ?? '',
        email: user?.email ?? '',
        specialization: user?.specialization ?? '',
        location: user?.location ?? '',
        bio: user?.bio ?? '',
        website_url: user?.website_url ?? '',
        instagram_url: user?.instagram_url ?? '',
        contact_email: user?.contact_email ?? '',
        profile_cover_style: user?.profile_cover_style ?? 'studio',
        avatar: null as File | null,
        remove_avatar: false,
    });

    useEffect(() => {
        return () => {
            if (avatarPreview?.startsWith('blob:')) {
                URL.revokeObjectURL(avatarPreview);
            }
        };
    }, [avatarPreview]);

    if (user === null) {
        return null;
    }

    const publicLinks = [
        makeProfileLink('Website', form.data.website_url, Globe),
        makeProfileLink('Instagram', form.data.instagram_url, Instagram),
        makeProfileLink(
            'Contact email',
            form.data.contact_email
                ? `mailto:${form.data.contact_email}`
                : null,
            Mail,
        ),
    ].filter(Boolean) as Array<{
        label: string;
        href: string;
        icon: typeof Globe;
    }>;
    const coverStyle = resolveProfileCoverStyle(form.data.profile_cover_style);

    function updateAvatarPreview(file: File | null): void {
        if (avatarPreview?.startsWith('blob:')) {
            URL.revokeObjectURL(avatarPreview);
        }

        setAvatarPreview(file ? URL.createObjectURL(file) : currentUserAvatar);
    }

    function handleAvatarChange(event: ChangeEvent<HTMLInputElement>): void {
        const file = event.target.files?.[0] ?? null;

        form.setData('avatar', file);
        form.setData('remove_avatar', false);
        updateAvatarPreview(file);
    }

    function removeAvatar(): void {
        form.setData('avatar', null);
        form.setData('remove_avatar', true);
        updateAvatarPreview(null);
    }

    function submit(event: FormEvent<HTMLFormElement>): void {
        event.preventDefault();

        form.transform((data) => ({
            ...data,
            remove_avatar: data.remove_avatar ? 1 : 0,
        }));

        form.patch(ProfileController.update().url, {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                form.reset('avatar');
            },
        });
    }

    return (
        <>
            <Head title="Profile settings" />

            <h1 className="sr-only">Profile settings</h1>

            <div className="mx-auto max-w-6xl space-y-8">
                <Heading
                    variant="small"
                    title="Portfolio profile"
                    description="Update the public-facing details that people will see across your portfolio and contact flows."
                />

                <form className="space-y-8" onSubmit={submit}>
                    <ProjectSection className="space-y-5">
                        <ProjectSectionHeader
                            title="Public preview"
                            description="A quick read on how your profile will feel once someone lands on your portfolio."
                            action={
                                <Badge variant="outline" className="gap-1.5">
                                    <Camera className="size-3.5" />
                                    {coverStyle.label} cover
                                </Badge>
                            }
                        />

                        <ProjectInsetPanel className="overflow-hidden bg-background/70 p-0">
                            <div
                                className={`h-40 sm:h-48 ${coverStyle.coverClass}`}
                            />

                            <div className="relative px-5 pb-5 sm:px-6 sm:pb-6">
                                <div className="absolute top-0 left-5 z-10 flex -translate-y-1/2 flex-col items-start gap-3 sm:left-6">
                                    <label
                                        htmlFor="avatar"
                                        className="group inline-flex cursor-pointer"
                                    >
                                        <span className="sr-only">
                                            Upload profile image
                                        </span>

                                        <div className="relative">
                                            <Avatar className="size-28 overflow-hidden rounded-[2rem] border border-white/10 bg-card shadow-sm transition group-hover:border-primary/40 sm:size-32">
                                                <AvatarImage
                                                    src={
                                                        avatarPreview ??
                                                        undefined
                                                    }
                                                    alt={user.name}
                                                />
                                                <AvatarFallback className="bg-white/[0.06] text-xl text-foreground">
                                                    {getInitials(user.name)}
                                                </AvatarFallback>
                                            </Avatar>

                                            <div className="absolute inset-0 flex items-end justify-center rounded-[2rem] bg-gradient-to-t from-black/75 via-black/20 to-transparent p-3 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
                                                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-background/85 px-3 py-1.5 text-xs font-medium text-foreground shadow-sm backdrop-blur">
                                                    <Camera className="size-3.5" />
                                                    {avatarPreview
                                                        ? 'Change photo'
                                                        : 'Upload photo'}
                                                </span>
                                            </div>
                                        </div>
                                    </label>

                                    {avatarPreview ? (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="w-28 rounded-full border-primary/28 bg-white/[0.04] text-primary shadow-none backdrop-blur hover:border-primary/45 hover:bg-primary/10 hover:text-primary sm:w-32"
                                            onClick={removeAvatar}
                                        >
                                            Remove avatar
                                        </Button>
                                    ) : null}
                                </div>

                                <div className="space-y-6 pt-[4.5rem] sm:pt-20 lg:pt-6 lg:pl-40">
                                    <div className="space-y-4">
                                        <div className="space-y-3">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <p className="text-2xl font-semibold tracking-tight">
                                                    {form.data.name ||
                                                        user.name}
                                                </p>
                                                {form.data.specialization ? (
                                                    <Badge variant="outline">
                                                        {
                                                            form.data
                                                                .specialization
                                                        }
                                                    </Badge>
                                                ) : null}
                                            </div>

                                            {form.data.location ? (
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <MapPin className="size-4" />
                                                    {form.data.location}
                                                </div>
                                            ) : null}

                                            <p className="max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
                                                {form.data.bio ||
                                                    'Add a short bio.'}
                                            </p>
                                        </div>

                                        {publicLinks.length > 0 ? (
                                            <div className="flex flex-wrap gap-2">
                                                {publicLinks.map(
                                                    ({
                                                        label,
                                                        href,
                                                        icon: Icon,
                                                    }) => (
                                                        <a
                                                            key={label}
                                                            href={href}
                                                            target={
                                                                href.startsWith(
                                                                    'mailto:',
                                                                )
                                                                    ? undefined
                                                                    : '_blank'
                                                            }
                                                            rel={
                                                                href.startsWith(
                                                                    'mailto:',
                                                                )
                                                                    ? undefined
                                                                    : 'noreferrer'
                                                            }
                                                            className="inline-flex items-center gap-2 rounded-full border border-primary/28 bg-white/[0.04] px-3 py-2 text-xs text-primary transition hover:border-primary/45 hover:bg-primary/10 hover:text-primary"
                                                        >
                                                            <Icon className="size-3.5" />
                                                            {label}
                                                            {!href.startsWith(
                                                                'mailto:',
                                                            ) ? (
                                                                <ExternalLink className="size-3.5" />
                                                            ) : null}
                                                        </a>
                                                    ),
                                                )}
                                            </div>
                                        ) : (
                                            <ProjectInsetPanel className="mb-3 border-dashed bg-background/40 px-4 py-3 text-sm text-muted-foreground">
                                                Add contact links so the public
                                                profile is not just visible, but
                                                actually actionable.
                                            </ProjectInsetPanel>
                                        )}

                                        <InputError
                                            message={form.errors.avatar}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3 border-t border-white/10 pt-5">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium">
                                            Header cover
                                        </p>
                                        <p className="text-sm leading-6 text-muted-foreground">
                                            Choose the mood that frames the
                                            first impression of your portfolio.
                                        </p>
                                    </div>

                                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                                        {profileCoverOptions.map((option) => (
                                            <button
                                                key={option.value}
                                                type="button"
                                                onClick={() =>
                                                    form.setData(
                                                        'profile_cover_style',
                                                        option.value,
                                                    )
                                                }
                                                className={`rounded-[1.35rem] border p-3 text-left transition ${
                                                    form.data
                                                        .profile_cover_style ===
                                                    option.value
                                                        ? 'border-primary/50 bg-primary/[0.08]'
                                                        : 'border-primary/18 bg-background/40 hover:border-primary/35'
                                                }`}
                                            >
                                                <div
                                                    className={`h-16 rounded-[1rem] ${option.swatchClass}`}
                                                />
                                                <div className="mt-3 space-y-1">
                                                    <p className="text-sm font-medium text-foreground">
                                                        {option.label}
                                                    </p>
                                                    <p className="text-xs leading-5 text-muted-foreground">
                                                        {option.description}
                                                    </p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>

                                    <InputError
                                        message={
                                            form.errors.profile_cover_style
                                        }
                                    />
                                </div>
                            </div>
                        </ProjectInsetPanel>
                    </ProjectSection>

                    <Input
                        id="avatar"
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={handleAvatarChange}
                    />

                    <div className="space-y-5">
                        <ProjectSection className="space-y-5">
                            <ProjectSectionHeader
                                title="Identity"
                                description="Start with the core details someone should understand within the first few seconds."
                                action={
                                    <Badge
                                        variant="outline"
                                        className="gap-1.5"
                                    >
                                        <Sparkles className="size-3.5" />
                                        Public-facing
                                    </Badge>
                                }
                            />

                            <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)]">
                                <div className="grid gap-5 md:grid-cols-2">
                                    <div className="grid gap-2 md:col-span-2">
                                        <Label htmlFor="name">Name</Label>
                                        <Input
                                            id="name"
                                            value={form.data.name}
                                            onChange={(event) =>
                                                form.setData(
                                                    'name',
                                                    event.target.value,
                                                )
                                            }
                                            required
                                            autoComplete="name"
                                            placeholder="Full name"
                                            className="border-primary/18 bg-[#f5f1ff] shadow-none focus-visible:border-primary/60 focus-visible:ring-primary/20"
                                        />
                                        <InputError
                                            message={form.errors.name}
                                        />
                                    </div>

                                    <div className="grid gap-2 md:col-span-2">
                                        <Label htmlFor="bio">Bio / About</Label>
                                        <Textarea
                                            id="bio"
                                            value={form.data.bio}
                                            onChange={(event) =>
                                                form.setData(
                                                    'bio',
                                                    event.target.value,
                                                )
                                            }
                                            rows={6}
                                            placeholder="Tell visitors what kind of work you make, how you approach it, and what makes your point of view distinct."
                                            className="min-h-44 rounded-[1.6rem] border-primary/18 bg-[#f5f1ff] px-5 py-4 text-base leading-7 text-slate-900 shadow-none placeholder:text-muted-foreground/75 focus-visible:border-primary/60 focus-visible:ring-primary/20 dark:bg-background/60 dark:text-foreground dark:placeholder:text-muted-foreground md:text-base"
                                        />
                                        <InputError message={form.errors.bio} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="specialization">
                                            Specialization
                                        </Label>
                                        <Input
                                            id="specialization"
                                            value={form.data.specialization}
                                            onChange={(event) =>
                                                form.setData(
                                                    'specialization',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="Portrait photographer, design systems, art direction..."
                                            className="border-primary/18 bg-[#f5f1ff] shadow-none focus-visible:border-primary/60 focus-visible:ring-primary/20"
                                        />
                                        <InputError
                                            message={form.errors.specialization}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="location">
                                            Location
                                        </Label>
                                        <Input
                                            id="location"
                                            value={form.data.location}
                                            onChange={(event) =>
                                                form.setData(
                                                    'location',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="Sofia, Bulgaria"
                                            className="border-primary/18 bg-[#f5f1ff] shadow-none focus-visible:border-primary/60 focus-visible:ring-primary/20"
                                        />
                                        <InputError
                                            message={form.errors.location}
                                        />
                                    </div>
                                </div>

                                <ProjectInsetPanel className="space-y-3 border-primary/18 shadow-none">
                                    <div className="flex items-center gap-2 text-sm font-medium">
                                        <UserRound className="size-4 text-primary" />
                                        Public profile snapshot
                                    </div>
                                    <p className="text-sm leading-6 text-muted-foreground">
                                        {form.data.specialization ||
                                            'Add your primary creative focus.'}
                                    </p>
                                    <p className="text-sm leading-6 text-muted-foreground">
                                        {form.data.location ||
                                            'Let visitors know where you work from.'}
                                    </p>
                                    <p className="text-sm leading-6 text-muted-foreground">
                                        {form.data.bio
                                            ? 'Your current bio is already giving the profile some editorial context.'
                                            : 'A short, specific bio will make the portfolio feel much more intentional.'}
                                    </p>
                                </ProjectInsetPanel>
                            </div>
                        </ProjectSection>

                        <ProjectSection className="space-y-5">
                            <ProjectSectionHeader
                                title="Contact and links"
                                description="Keep private account access separate from the contact routes you want portfolio visitors to use."
                            />

                            <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)]">
                                <div className="grid gap-5 md:grid-cols-2">
                                    <div className="grid gap-2 md:col-span-2">
                                        <Label htmlFor="email">
                                            Email address
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={form.data.email}
                                            onChange={(event) =>
                                                form.setData(
                                                    'email',
                                                    event.target.value,
                                                )
                                            }
                                            required
                                            autoComplete="username"
                                            placeholder="Email address"
                                            className="border-primary/18 bg-[#f5f1ff] shadow-none focus-visible:border-primary/60 focus-visible:ring-primary/20"
                                        />
                                        <InputError
                                            message={form.errors.email}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="contact_email">
                                            Public contact email
                                        </Label>
                                        <Input
                                            id="contact_email"
                                            type="email"
                                            value={form.data.contact_email}
                                            onChange={(event) =>
                                                form.setData(
                                                    'contact_email',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="hello@yourstudio.com"
                                            className="border-primary/18 bg-[#f5f1ff] shadow-none focus-visible:border-primary/60 focus-visible:ring-primary/20"
                                        />
                                        <InputError
                                            message={form.errors.contact_email}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="website_url">
                                            Website
                                        </Label>
                                        <Input
                                            id="website_url"
                                            value={form.data.website_url}
                                            onChange={(event) =>
                                                form.setData(
                                                    'website_url',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="https://yourstudio.com"
                                            className="border-primary/18 bg-[#f5f1ff] shadow-none focus-visible:border-primary/60 focus-visible:ring-primary/20"
                                        />
                                        <InputError
                                            message={form.errors.website_url}
                                        />
                                    </div>

                                    <div className="grid gap-2 md:col-span-2">
                                        <Label htmlFor="instagram_url">
                                            Instagram
                                        </Label>
                                        <Input
                                            id="instagram_url"
                                            value={form.data.instagram_url}
                                            onChange={(event) =>
                                                form.setData(
                                                    'instagram_url',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="https://instagram.com/yourhandle"
                                            className="border-primary/18 bg-[#f5f1ff] shadow-none focus-visible:border-primary/60 focus-visible:ring-primary/20"
                                        />
                                        <InputError
                                            message={form.errors.instagram_url}
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                                    <ProjectInsetPanel className="space-y-3 border-primary/18 shadow-none">
                                        <div className="flex items-center gap-2 text-sm font-medium">
                                            <Mail className="size-4 text-primary" />
                                            Contact route
                                        </div>
                                        <p className="text-sm leading-6 text-muted-foreground">
                                            {form.data.contact_email ||
                                                'Add the email you want public inquiries to land in.'}
                                        </p>
                                    </ProjectInsetPanel>

                                    <ProjectInsetPanel className="space-y-3 border-primary/18 shadow-none">
                                        <div className="flex items-center gap-2 text-sm font-medium">
                                            <Globe className="size-4 text-primary" />
                                            Public links
                                        </div>
                                        <p className="text-sm leading-6 text-muted-foreground">
                                            {form.data.website_url ||
                                            form.data.instagram_url
                                                ? 'Visitors will be able to jump directly from your profile to the places where your work lives.'
                                                : 'Add at least one public link so the profile can lead somewhere useful.'}
                                        </p>
                                    </ProjectInsetPanel>
                                </div>
                            </div>
                        </ProjectSection>
                    </div>

                    {mustVerifyEmail && user.email_verified_at === null && (
                        <ProjectInsetPanel className="space-y-2">
                            <p className="text-sm text-muted-foreground">
                                Your email address is unverified.{' '}
                                <Link
                                    href={send()}
                                    as="button"
                                    className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current dark:decoration-neutral-500"
                                >
                                    Click here to resend the verification email.
                                </Link>
                            </p>

                            {status === 'verification-link-sent' && (
                                <div className="text-sm font-medium text-green-600">
                                    A new verification link has been sent to
                                    your email address.
                                </div>
                            )}
                        </ProjectInsetPanel>
                    )}

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-muted-foreground">
                            Keep this profile concise and specific so it reads
                            well both to clients and collaborators.
                        </p>

                        <div className="flex items-center gap-4">
                            <Button
                                disabled={form.processing}
                                data-test="update-profile-button"
                            >
                                {form.processing ? 'Saving...' : 'Save profile'}
                            </Button>
                            {form.recentlySuccessful ? (
                                <p className="text-sm text-muted-foreground">
                                    Your public profile details have been
                                    updated.
                                </p>
                            ) : null}
                        </div>
                    </div>
                </form>

                <DeleteUser />
            </div>
        </>
    );
}

Profile.layout = {
    breadcrumbs: [
        {
            title: 'Profile settings',
            href: edit(),
        },
    ],
};

function makeProfileLink(
    label: string,
    href: string | null,
    icon: typeof Globe,
): {
    label: string;
    href: string;
    icon: typeof Globe;
} | null {
    if (!href) {
        return null;
    }

    return { label, href, icon };
}
