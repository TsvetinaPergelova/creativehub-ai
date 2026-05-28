<?php

use Inertia\Testing\AssertableInertia as Assert;

test('the landing page renders the welcome experience', function () {
    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('welcome')
            ->has('canRegister')
            ->has('landingPreviewFrames')
        );
});
