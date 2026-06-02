<?php

test('projects pages use dashboard-like light theme surfaces', function () {
    $files = [
        resource_path('js/pages/projects/index.tsx') => [
            'border-primary/20 bg-white',
            'text-slate-950 dark:text-foreground',
            'dark:bg-card/60 dark:shadow-none',
        ],
        resource_path('js/components/projects/project-card.tsx') => [
            'border border-slate-200 bg-white py-0 shadow-[0_18px_40px_rgba(15,23,42,0.05)]',
            'border-slate-200 bg-slate-50 px-2.5',
            'text-slate-700 uppercase',
            'text-slate-950 transition-colors hover:text-primary dark:text-foreground',
        ],
        resource_path('js/components/projects/project-ui.tsx') => [
            'border border-slate-200/85 bg-white/88',
            'text-slate-950 dark:text-foreground',
            'text-slate-600 dark:text-muted-foreground',
        ],
        resource_path('js/components/public/public-profile-actions.tsx') => [
            'border-primary/35 bg-white text-primary shadow-[0_10px_24px_rgba(15,23,42,0.05)]',
            'hover:border-primary/50 hover:bg-primary/10 hover:text-primary',
        ],
    ];

    foreach ($files as $path => $expectedClasses) {
        $content = file_get_contents($path);

        foreach ($expectedClasses as $expectedClass) {
            expect($content)->toContain($expectedClass);
        }
    }
});
