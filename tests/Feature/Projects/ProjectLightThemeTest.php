<?php

test('projects pages use dashboard-like light theme surfaces', function () {
    $files = [
        resource_path('js/pages/projects/index.tsx') => [
            'border border-slate-200 bg-white',
            'h-11 rounded-full border-primary/20 bg-[#f5f1ff] pr-4 pl-11 text-slate-900 shadow-none placeholder:text-slate-400 focus-visible:border-primary/50 dark:border-white/10 dark:bg-background/60 dark:text-inherit dark:placeholder:text-muted-foreground dark:focus-visible:border-ring',
            'text-slate-950 dark:text-foreground',
            'dark:bg-card/60 dark:shadow-none',
            'h-11 w-full rounded-full border-primary/35 bg-white text-primary shadow-none hover:border-primary/50 hover:bg-primary/10 hover:text-primary focus-visible:border-primary/50 dark:border-white/10 dark:bg-background/60 dark:text-foreground dark:shadow-none dark:hover:bg-background/80 dark:hover:text-foreground dark:focus-visible:border-ring',
            'rounded-[1rem] border border-primary/16 bg-[#f5f1ff] px-3 py-2 shadow-none dark:border-white/10 dark:bg-black/[0.16] dark:shadow-none',
            'rounded-[1.1rem] border border-primary/16 bg-[#f5f1ff] px-3 py-1.5 shadow-none dark:border-white/10 dark:bg-black/[0.16] dark:shadow-none',
        ],
        resource_path('js/pages/projects/client.tsx') => [
            'bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.08),transparent_28%),radial-gradient(circle_at_top_right,rgba(244,114,182,0.08),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(250,204,21,0.08),transparent_34%),#ffffff] px-3 py-6 text-foreground sm:px-6 sm:py-10 lg:px-8 dark:bg-[radial-gradient(circle_at_top_left,rgba(244,114,182,0.16),transparent_28%),radial-gradient(circle_at_top_right,rgba(250,204,21,0.1),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.18),transparent_34%),rgba(255,255,255,0.03)]',
            'bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.15),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(244,114,182,0.08),transparent_34%),linear-gradient(90deg,rgba(255,255,255,0.08),transparent_30%,transparent_70%,rgba(255,255,255,0.06))] dark:bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.22),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(244,114,182,0.16),transparent_34%)]',
            'text-slate-950 dark:text-foreground',
            'text-3xl font-semibold tracking-tight text-slate-950 dark:text-foreground sm:text-5xl',
        ],
        resource_path('js/components/projects/project-card.tsx') => [
            'border border-slate-200 bg-white py-0 shadow-[0_18px_40px_rgba(15,23,42,0.05)]',
            'border-slate-200 bg-slate-50 px-2.5',
            'text-slate-700 uppercase',
            'text-slate-950 transition-colors hover:text-primary dark:text-foreground',
        ],
        resource_path('js/components/projects/project-ui.tsx') => [
            'border border-slate-200/85 bg-white/88 p-4 shadow-none sm:p-5 dark:border-white/10 dark:bg-card/60 dark:shadow-none',
            'text-slate-950 dark:text-foreground',
            'text-slate-600 dark:text-muted-foreground',
        ],
        resource_path('js/components/public/public-profile-actions.tsx') => [
            'border-primary/35 bg-white text-primary shadow-[0_10px_24px_rgba(15,23,42,0.05)]',
            'hover:border-primary/50 hover:bg-primary/10 hover:text-primary',
        ],
        resource_path('js/components/nav-user.tsx') => [
            'group rounded-2xl border border-primary/20 bg-white text-slate-900 shadow-none hover:border-primary/35 hover:bg-white data-[state=open]:border-primary/35 data-[state=open]:bg-white dark:border-transparent dark:bg-transparent dark:text-sidebar-accent-foreground dark:shadow-none dark:hover:bg-sidebar-accent dark:data-[state=open]:bg-sidebar-accent',
        ],
        resource_path('js/components/public/save-project-button.tsx') => [
            'rounded-full border-primary/35 text-primary shadow-none hover:border-primary/50 hover:bg-primary/10 hover:text-primary dark:border-white/10 dark:bg-background/60 dark:text-foreground dark:hover:bg-background/80 dark:hover:text-foreground',
        ],
        resource_path('js/components/app-sidebar-header.tsx') => [
            'rounded-full border border-primary/20 bg-primary text-primary-foreground capitalize shadow-none',
            'rounded-full border-primary/35 bg-white text-primary shadow-none hover:border-primary/50 hover:bg-primary/10 hover:text-primary dark:border-white/10 dark:bg-background/60 dark:text-foreground dark:shadow-none dark:hover:bg-background/80 dark:hover:text-foreground',
        ],
        resource_path('js/components/app-sidebar.tsx') => [
            'justify-start group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:px-0',
        ],
        resource_path('js/components/app-logo.tsx') => [
            'flex aspect-square size-11 items-center justify-center rounded-full border border-primary/25 bg-[linear-gradient(180deg,#ffffff,#eef2ff)] text-primary ring-1 ring-primary/18 transition-all group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:size-9 group-data-[collapsible=icon]:border-primary/20 group-data-[collapsible=icon]:bg-primary group-data-[collapsible=icon]:text-white dark:border-primary/20 dark:bg-[#151728] dark:bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.22),transparent_58%)] dark:text-white dark:ring-0 dark:group-data-[collapsible=icon]:bg-primary dark:group-data-[collapsible=icon]:text-white',
            'ml-2.5 grid flex-1 text-left leading-tight group-data-[collapsible=icon]:ml-0 group-data-[collapsible=icon]:hidden',
        ],
        resource_path('js/pages/projects/show.tsx') => [
            'bg-[linear-gradient(90deg,rgba(255,255,255,0.72),rgba(255,255,255,0.32),rgba(255,255,255,0.7))]',
            'text-slate-700 uppercase drop-shadow-sm dark:text-muted-foreground',
            'rounded-full border border-primary/20 bg-primary text-primary-foreground capitalize shadow-none',
            'border-amber-500/35 bg-amber-100 text-amber-900 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-200',
            'inline-block max-w-full whitespace-normal break-words align-bottom text-primary/90 sm:max-w-[min(100%,34rem)]',
            'text-sm leading-6 whitespace-normal break-words text-foreground/85',
            'overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-none dark:border-white/10 dark:bg-background/55 dark:shadow-none',
            'hidden overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-none md:block md:p-6 dark:border-white/10 dark:bg-card/50 dark:shadow-none',
            'overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-none sm:p-5 dark:border-white/10 dark:bg-card/60 dark:shadow-none',
            'w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm xl:min-w-56 shadow-none dark:border-white/10 dark:bg-background/70',
        ],
        resource_path('js/components/projects/project-upload-dropzone.tsx') => [
            'rounded-lg border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-background/50',
            'text-sm font-medium text-slate-950 dark:text-foreground',
            'h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-muted',
            'grid grid-cols-3 gap-3 border-t border-slate-200 pt-4 text-sm dark:border-white/10',
        ],
        resource_path('js/components/projects/project-upload-review.tsx') => [
            'bg-white dark:bg-card/60',
            'space-y-4 rounded-lg border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-background/70',
        ],
        resource_path('js/components/projects/project-share-panel.tsx') => [
            'overflow-hidden bg-white shadow-none dark:bg-card/60',
        ],
        resource_path('js/components/projects/project-ai-sidebar.tsx') => [
            'overflow-hidden bg-white shadow-none dark:bg-card/60',
        ],
        resource_path('js/components/projects/project-curator-presence.tsx') => [
            'absolute bottom-20 right-0 w-full rounded-[1.75rem] border border-white/10 bg-background/95 p-4 shadow-none backdrop-blur-xl',
            'group relative flex items-center gap-3 rounded-full border border-primary/20 bg-background/92 px-3 py-2 shadow-none backdrop-blur-xl transition hover:border-primary/35 hover:bg-background focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-none',
            'relative flex size-12 items-center justify-center rounded-full border border-primary/25 bg-primary text-primary-foreground shadow-none',
        ],
        resource_path('js/components/projects/project-asset-grid.tsx') => [
            'w-full overflow-hidden rounded-xl border bg-card/80 text-left shadow-none transition hover:bg-card focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none',
            'rounded-2xl border bg-card/45 shadow-none',
            'bg-[#f5f1ff] px-2 pt-3 pb-3 sm:px-4 sm:pt-4 sm:pb-4 dark:bg-background/50',
            'space-y-4 rounded-xl border bg-white p-3 shadow-none sm:p-4 dark:bg-background/70',
            'min-w-0 rounded-xl border bg-white p-3 shadow-none dark:bg-background/70',
            'space-y-3 rounded-lg border bg-white p-4 shadow-none dark:bg-background/70',
        ],
        resource_path('js/components/projects/project-asset-title-form.tsx') => [
            'bg-[#f5f1ff] shadow-none dark:bg-background/70',
        ],
        resource_path('js/components/client/client-favorites-panel.tsx') => [
            'border-slate-200 bg-white shadow-none backdrop-blur dark:border-white/10 dark:bg-card/60 dark:shadow-none',
            'rounded-xl border border-slate-200 bg-slate-50 p-3.5 sm:p-4 dark:border-white/10 dark:bg-background/45',
            'rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-sm text-muted-foreground sm:p-4 dark:border-white/10 dark:bg-background/40',
        ],
        resource_path('js/pages/public/profile.tsx') => [
            'bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.08),transparent_28%),radial-gradient(circle_at_top_right,rgba(244,114,182,0.08),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(250,204,21,0.08),transparent_34%),#ffffff] px-4 py-10 text-foreground sm:px-6 lg:px-8 dark:bg-[radial-gradient(circle_at_top_left,rgba(244,114,182,0.16),transparent_28%),radial-gradient(circle_at_top_right,rgba(250,204,21,0.1),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.18),transparent_34%),rgba(255,255,255,0.03)]',
            'overflow-hidden rounded-[2.2rem] border border-slate-200/80 bg-white/95 shadow-none backdrop-blur dark:border-white/10 dark:bg-card/85 dark:shadow-sm',
            'size-28 -mt-20 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-none sm:size-32 sm:-mt-24 dark:border-white/10 dark:bg-card',
            'text-[11px] uppercase tracking-[0.34em] text-primary/70',
            'rounded-[1.35rem] border border-slate-200 bg-white py-0 shadow-none dark:border-white/10 dark:bg-background/55',
        ],
        resource_path('js/pages/projects/client.tsx') => [
            'rounded-[1.75rem] border border-primary/18 bg-[#faf7ff] p-0 shadow-none sm:rounded-[2rem] sm:p-10 dark:border-white/10 dark:bg-white/[0.03]',
            'bg-[linear-gradient(110deg,rgba(250,247,255,0.82)_0%,rgba(250,247,255,0.72)_28%,rgba(250,247,255,0.36)_54%,rgba(250,247,255,0.18)_74%,rgba(250,247,255,0.12)_100%)] dark:bg-[linear-gradient(110deg,rgba(7,9,20,0.92)_0%,rgba(7,9,20,0.82)_38%,rgba(7,9,20,0.72)_58%,rgba(7,9,20,0.82)_100%)]',
            'rounded-[1.5rem] border border-white/55 bg-white/82 p-5 shadow-none backdrop-blur-md sm:p-6 dark:border-white/10 dark:bg-background/55',
            'bg-primary text-primary-foreground',
            'rounded-xl border border-slate-200 bg-white/85 p-3 shadow-none backdrop-blur-md',
            'rounded-[1.5rem] border border-white/55 bg-white/82 p-5 shadow-none backdrop-blur-md sm:p-6 dark:border-white/10 dark:bg-background/55',
            'rounded-xl border border-slate-200 bg-white p-3 shadow-none sm:p-4 dark:border-white/10 dark:bg-background/55',
            'fill-current text-rose-500',
        ],
        resource_path('js/pages/public/project.tsx') => [
            'bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.08),transparent_28%),radial-gradient(circle_at_top_right,rgba(244,114,182,0.08),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(250,204,21,0.08),transparent_34%),#ffffff] px-4 py-10 text-foreground sm:px-6 lg:px-8 dark:bg-[radial-gradient(circle_at_top_left,rgba(244,114,182,0.16),transparent_28%),radial-gradient(circle_at_top_right,rgba(250,204,21,0.1),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.18),transparent_34%),rgba(255,255,255,0.03)]',
            'bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.15),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(244,114,182,0.08),transparent_34%),linear-gradient(90deg,rgba(255,255,255,0.08),transparent_30%,transparent_70%,rgba(255,255,255,0.06))] dark:bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.22),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(244,114,182,0.16),transparent_34%)]',
            'relative rounded-xl border border-slate-200/80 bg-white/95 p-8 shadow-none backdrop-blur dark:border-white/10 dark:bg-card/85 dark:shadow-sm',
            'flex flex-wrap items-center gap-3',
            'flex flex-col items-start gap-3 lg:absolute lg:top-8 lg:right-8 lg:items-end',
            'border-primary/35 text-primary',
            'block w-full overflow-hidden rounded-xl border border-slate-200/80 bg-white text-left shadow-none transition hover:border-primary/25 hover:bg-white focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none dark:border-white/10 dark:bg-card/85 dark:shadow-sm dark:hover:border-primary/20 dark:hover:bg-card',
            'top-0 right-0 bottom-0 left-0 z-[60] h-dvh w-screen max-w-none translate-x-0 translate-y-0 gap-0 overflow-hidden rounded-none border-0 bg-background p-0 sm:top-[50%] sm:left-[50%] sm:h-[96vh] sm:max-h-[96vh] sm:w-full sm:max-w-[min(84vw,78rem)] sm:translate-x-[-50%] sm:translate-y-[-50%] sm:rounded-lg sm:border sm:border-white/10',
            'flex h-full min-h-0 flex-col lg:grid lg:h-full lg:max-h-[96vh] lg:grid-cols-[minmax(0,1fr)_27rem] xl:grid-cols-[minmax(0,1.02fr)_31rem]',
            'relative h-[42svh] shrink-0 items-center justify-center overflow-hidden bg-black/95 px-3 pt-12 pb-3 sm:min-h-[18rem] sm:h-auto sm:p-6 lg:flex lg:min-h-[88vh] lg:flex-1 lg:px-5 lg:py-4 xl:min-h-[90vh] xl:px-6 xl:py-5',
            'pointer-events-none max-h-[min(46svh,30rem)] w-auto max-w-full rounded-[1.15rem] object-contain transition duration-300 will-change-transform select-none sm:max-h-[82vh] lg:max-h-[88vh] sm:rounded-lg xl:max-h-[90vh]',
            'bg-[#f5f1ff] px-2 pt-3 pb-3 sm:px-4 sm:pt-4 sm:pb-4 dark:bg-background/50',
            'rounded-xl border bg-white p-4 shadow-none dark:border-white/10 dark:bg-background/70',
            'text-sm text-slate-700 dark:text-muted-foreground',
            'block w-full overflow-hidden rounded-xl border border-slate-200/80 bg-white text-left shadow-none transition hover:border-primary/25 hover:bg-white focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none dark:border-white/10 dark:bg-card/85 dark:shadow-sm dark:hover:border-primary/20 dark:hover:bg-card',
        ],
        resource_path('js/pages/public/profile.tsx') => [
            'bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.08),transparent_28%),radial-gradient(circle_at_top_right,rgba(244,114,182,0.08),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(250,204,21,0.08),transparent_34%),#ffffff] px-4 py-10 text-foreground sm:px-6 lg:px-8 dark:bg-[radial-gradient(circle_at_top_left,rgba(244,114,182,0.16),transparent_28%),radial-gradient(circle_at_top_right,rgba(250,204,21,0.1),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.18),transparent_34%),rgba(255,255,255,0.03)]',
            'overflow-hidden rounded-[2.2rem] border border-slate-200/80 bg-white shadow-none backdrop-blur dark:border-white/10 dark:bg-card/85 dark:shadow-sm',
            'size-28 -mt-20 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-none sm:size-32 sm:-mt-24 dark:border-white/10 dark:bg-card',
            'text-[11px] uppercase tracking-[0.34em] text-primary/70',
            'rounded-[1.35rem] border border-primary/18 bg-[#f5f1ff] py-0 shadow-none dark:border-white/10 dark:bg-background/55',
        ],
        resource_path('js/pages/explore/index.tsx') => [
            'h-11 rounded-full border-primary/20 bg-[#f5f1ff] pr-4 pl-11 text-slate-900 shadow-none placeholder:text-slate-400 focus-visible:border-primary/50 dark:border-white/10 dark:bg-background/60 dark:text-inherit dark:placeholder:text-muted-foreground dark:focus-visible:border-ring',
            'relative overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white px-4 py-4 shadow-none sm:px-5 sm:py-5 dark:border-white/10 dark:bg-white/[0.03] dark:shadow-none',
            'flex min-h-[6.4rem] flex-col rounded-[1.05rem] border border-primary/16 bg-[#f5f1ff] px-3 py-2.5 shadow-none sm:min-h-[6.8rem] sm:rounded-[1.1rem] sm:py-3 dark:border-primary/18 dark:bg-black/[0.16] dark:shadow-none',
            'h-10 min-w-[11rem] rounded-full border-primary/35 bg-white text-primary shadow-none hover:border-primary/50 hover:bg-primary/10 hover:text-primary focus-visible:border-primary/50 dark:border-white/10 dark:bg-background/60 dark:text-foreground dark:shadow-none dark:hover:bg-background/80 dark:hover:text-foreground dark:focus-visible:border-ring',
            'space-y-4 rounded-[1.75rem] border-primary/16 bg-white/88 px-4 py-5 shadow-[0_18px_54px_rgba(99,102,241,0.05)] dark:border-white/10 dark:bg-card/60 dark:px-4 dark:py-5 dark:shadow-none',
        ],
    ];

    foreach ($files as $path => $expectedClasses) {
        $content = file_get_contents($path);

        foreach ($expectedClasses as $expectedClass) {
            expect($content)->toContain($expectedClass);
        }
    }
});
