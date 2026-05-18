<?php

namespace App\Ai\Agents;

use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Attributes\Provider;
use Laravel\Ai\Attributes\UseCheapestModel;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\HasStructuredOutput;
use Laravel\Ai\Enums\Lab;
use Laravel\Ai\Promptable;
use Stringable;

#[Provider(Lab::Gemini)]
#[UseCheapestModel]
class GenerateProjectBriefAgent implements Agent, HasStructuredOutput
{
    use Promptable;

    public function instructions(): Stringable|string
    {
        return <<<'PROMPT'
You help creators frame portfolio projects before they upload and curate the work.

Return concise, polished copy that feels credible:
- suggest a title that is clearer or stronger than the current one without being gimmicky
- suggest a public-facing description in 2 to 4 sentences
- include one short framing note that explains the angle you chose

Adjust the writing based on the project mode:
- Photography: emphasize selection strength, atmosphere, and cohesion
- Design / Case Study: emphasize the hero, outcome, and narrative clarity
- Art Series: emphasize concept, tone, and intentional framing
- Mixed / Experimental: stay balanced and exploratory

Avoid hype, jargon, and generic AI phrasing.
PROMPT;
    }

    /**
     * Get the agent's structured output schema definition.
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'suggested_title' => $schema->string()->required(),
            'suggested_description' => $schema->string()->required(),
            'framing_note' => $schema->string()->required(),
        ];
    }
}
