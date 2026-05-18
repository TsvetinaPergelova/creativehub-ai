<?php

use App\Ai\Agents\GenerateProjectBriefAgent;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Ai\Prompts\AgentPrompt;

uses(RefreshDatabase::class);

test('authenticated users can generate ai project brief suggestions', function () {
    GenerateProjectBriefAgent::fake([
        [
            'suggested_title' => 'Quiet Spring Wedding',
            'suggested_description' => 'A soft wedding story shaped around natural light, intimate gestures, and a calm visual rhythm. The set keeps the focus on atmosphere and connection while staying polished enough for a public portfolio.',
            'framing_note' => 'The copy leans into cohesion and warmth, which fits a photography project well.',
        ],
    ])->preventStrayPrompts();

    $user = User::factory()->create();

    $this->actingAs($user)
        ->postJson(route('projects.assistant.store'), [
            'name' => 'Spring Wedding',
            'category' => 'Weddings',
            'mode' => 'photography',
            'description' => '',
            'project_intent' => 'Portfolio piece',
            'target_audience' => 'Couples and planners',
            'creative_direction' => 'Warm, elegant, documentary',
        ])
        ->assertOk()
        ->assertJson([
            'suggestion' => [
                'suggested_title' => 'Quiet Spring Wedding',
                'framing_note' => 'The copy leans into cohesion and warmth, which fits a photography project well.',
            ],
        ])
        ->assertJsonPath(
            'suggestion.suggested_description',
            'A soft wedding story shaped around natural light, intimate gestures, and a calm visual rhythm. The set keeps the focus on atmosphere and connection while staying polished enough for a public portfolio.',
        );

    GenerateProjectBriefAgent::assertPrompted(
        fn (AgentPrompt $prompt) => str($prompt->prompt)->containsAll([
            'Project mode: Photography',
            'Category: Weddings',
            'Project intent: Portfolio piece',
            'Audience: Couples and planners',
            'Creative direction: Warm, elegant, documentary',
        ]),
    );
});

test('project brief assistant validates the required project context', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->postJson(route('projects.assistant.store'), [
            'name' => 'Untitled',
            'mode' => 'photography',
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['category']);
});
