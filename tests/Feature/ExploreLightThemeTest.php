<?php

test('explore page uses the same light theme accent language as the dashboard', function () {
    $files = [
        resource_path('js/pages/explore/index.tsx') => [
            'border-primary/18 bg-[#faf7ff]',
            'border-primary/20 bg-white',
            'xl:grid-cols-[minmax(0,1.35fr)_repeat(3,minmax(0,0.72fr))]',
            'shadow-[0_18px_54px_rgba(99,102,241,0.05)]',
        ],
        resource_path('js/components/public/public-project-grid.tsx') => [
            'border border-primary/18 bg-white py-0 shadow-[0_18px_36px_rgba(15,23,42,0.07)]',
            'border-t border-primary/16 pt-3 text-sm font-medium',
            'text-slate-900 transition hover:text-primary',
        ],
    ];

    foreach ($files as $path => $expectedClasses) {
        $content = file_get_contents($path);

        foreach ($expectedClasses as $expectedClass) {
            expect($content)->toContain($expectedClass);
        }
    }
});
