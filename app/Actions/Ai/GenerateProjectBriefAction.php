<?php

namespace App\Actions\Ai;

use App\Ai\Agents\GenerateProjectBriefAgent;
use App\Enums\ProjectMode;

class GenerateProjectBriefAction
{
    /**
     * Generate a concise project title and description suggestion.
     *
     * @param  array{
     *     name?: string|null,
     *     category: string,
     *     mode: string,
     *     description?: string|null,
     *     project_intent?: string|null,
     *     target_audience?: string|null,
     *     creative_direction?: string|null
     * }  $input
     * @return array{
     *     suggested_title: string,
     *     suggested_description: string,
     *     framing_note: string
     * }
     */
    public function handle(array $input): array
    {
        $mode = ProjectMode::from($input['mode']);

        $response = (new GenerateProjectBriefAgent)->prompt(implode("\n", array_filter([
            'Generate project setup copy for a creator workspace.',
            sprintf('Project mode: %s', $mode->label()),
            sprintf('Mode focus: %s', $this->modeFocus($mode)),
            sprintf('Current title: %s', filled($input['name'] ?? null) ? trim((string) $input['name']) : 'None yet'),
            sprintf('Category: %s', trim($input['category'])),
            sprintf(
                'Existing description: %s',
                filled($input['description'] ?? null)
                    ? trim((string) $input['description'])
                    : 'None yet'
            ),
            filled($input['project_intent'] ?? null)
                ? sprintf('Project intent: %s', trim((string) $input['project_intent']))
                : null,
            filled($input['target_audience'] ?? null)
                ? sprintf('Audience: %s', trim((string) $input['target_audience']))
                : null,
            filled($input['creative_direction'] ?? null)
                ? sprintf('Creative direction: %s', trim((string) $input['creative_direction']))
                : null,
            'Keep the description readable for clients, collaborators, or portfolio visitors.',
            'If the current title already works, keep the suggestion close rather than reinventing it.',
        ])));

        return [
            'suggested_title' => trim((string) $response['suggested_title']),
            'suggested_description' => trim((string) $response['suggested_description']),
            'framing_note' => trim((string) $response['framing_note']),
        ];
    }

    private function modeFocus(ProjectMode $mode): string
    {
        return match ($mode) {
            ProjectMode::Photography => 'selection strength, atmosphere, and a cohesive set',
            ProjectMode::DesignCaseStudy => 'a clear hero image, supporting story, and outcome framing',
            ProjectMode::ArtSeries => 'concept clarity, tone, and intentional sequencing',
            ProjectMode::MixedExperimental => 'balanced framing without forcing one template too early',
        };
    }
}
