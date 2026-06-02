<?php

test('landing and auth surfaces keep dark theme background variants', function () {
    $files = [
        resource_path('js/pages/welcome.tsx') => 'dark:bg-[linear-gradient(180deg,#09090b_0%,#111827_55%,#09090b_100%)]',
        resource_path('js/layouts/auth/auth-simple-layout.tsx') => 'dark:bg-[linear-gradient(180deg,#09090b_0%,#111827_55%,#09090b_100%)]',
        resource_path('js/pages/auth/login.tsx') => 'dark:text-emerald-400',
    ];

    foreach ($files as $path => $expected) {
        expect(file_get_contents($path))->toContain($expected);
    }
});
