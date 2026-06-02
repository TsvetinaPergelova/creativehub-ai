<?php

test('workspace nav button uses the saturated purple outline style', function () {
    $content = file_get_contents(resource_path('js/components/app-sidebar-header.tsx'));

    expect($content)->toContain('border-primary/35 bg-white text-primary shadow-[0_10px_24px_rgba(15,23,42,0.05)]');
    expect($content)->toContain('hover:border-primary/50 hover:bg-primary/10 hover:text-primary');
});
