<?php

test('settings sidebar and danger panel use the purple light theme treatment', function () {
    $layout = file_get_contents(resource_path('js/layouts/settings/layout.tsx'));
    $deleteUser = file_get_contents(resource_path('js/components/delete-user.tsx'));
    $profile = file_get_contents(resource_path('js/pages/settings/profile.tsx'));

    expect($layout)->toContain('border border-transparent px-5 text-base shadow-none transition-colors');
    expect($layout)->toContain('hover:border-primary/25 hover:bg-primary/10 hover:text-primary');
    expect($layout)->toContain('border-primary/35 bg-primary/10 text-primary');

    expect($deleteUser)->toContain('border-rose-500/25 bg-rose-500/[0.06]');
    expect($deleteUser)->toContain('text-rose-700 dark:text-rose-100');
    expect($deleteUser)->toContain('text-rose-700/85 dark:text-rose-100/80');

    expect($profile)->toContain('<ProjectInsetPanel className="space-y-3 border-primary/18 shadow-none">');
    expect($profile)->toContain('<ProjectInsetPanel className="space-y-2 shadow-none">');
    expect($profile)->toContain('border-primary/18 bg-background/40 hover:border-primary/35');
    expect($profile)->toContain('className="border-primary/18 shadow-none focus-visible:border-primary/60 focus-visible:ring-primary/20"');
    expect($profile)->toContain('min-h-44 rounded-[1.6rem] border-primary/18 bg-background/75 px-5 py-4 text-base leading-7 shadow-none placeholder:text-muted-foreground/75 focus-visible:border-primary/60 focus-visible:ring-primary/20 md:text-base');
});
