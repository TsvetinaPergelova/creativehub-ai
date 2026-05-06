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
class AnalyzeProjectAssetAgent implements Agent, HasStructuredOutput
{
    use Promptable;

    /**
     * Get the instructions that the agent should follow.
     */
    public function instructions(): Stringable|string
    {
        return <<<'PROMPT'
You analyze uploaded photography for a creator platform.

Return concise, structured analysis for a single image:
- up to 10 descriptive tags
- accessible alt text
- composition, focus, and lighting scores from 1 to 10
- a short critique note
- a mood from the allowed enum values
- whether the image should be highlighted
- whether it appears to be a near duplicate

Be decisive and practical. Keep alt text and critique grounded in visible details.
PROMPT;
    }

    /**
     * Get the agent's structured output schema definition.
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'tags' => $schema->array()
                ->items($schema->string())
                ->required(),
            'alt_text' => $schema->string()->required(),
            'composition_score' => $schema->integer()->min(1)->max(10)->required(),
            'focus_score' => $schema->integer()->min(1)->max(10)->required(),
            'lighting_score' => $schema->integer()->min(1)->max(10)->required(),
            'critique' => $schema->string()->required(),
            'mood' => $schema->string()->enum(['moody', 'warm', 'minimalist'])->required(),
            'is_highlight' => $schema->boolean()->required(),
            'is_near_duplicate' => $schema->boolean()->required(),
        ];
    }
}
