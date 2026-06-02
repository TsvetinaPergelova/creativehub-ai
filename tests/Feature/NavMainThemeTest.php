<?php

test('main sidebar navigation uses the purple active and hover treatment', function () {
    $content = file_get_contents(resource_path('js/components/nav-main.tsx'));

    expect($content)->toContain('border border-transparent px-3 text-[15px] font-medium text-slate-700 shadow-none transition-colors');
    expect($content)->toContain('hover:border-primary/25 hover:bg-primary/10 hover:text-primary');
    expect($content)->toContain('data-[active=true]:border-primary/35 data-[active=true]:bg-primary/10 data-[active=true]:text-primary');
    expect($content)->not->toContain('data-[active=true]:shadow-[0_10px_24px_rgba(15,23,42,0.06)]');
});
