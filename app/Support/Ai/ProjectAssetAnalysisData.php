<?php

namespace App\Support\Ai;

/**
 * @phpstan-type ProjectAssetAnalysisPayload array{
 *     tags: array<int, string>,
 *     alt_text: string,
 *     composition_score: int,
 *     focus_score: int,
 *     lighting_score: int,
 *     critique: string,
 *     mood: string|null,
 *     is_highlight: bool,
 *     is_near_duplicate: bool
 * }
 */
class ProjectAssetAnalysisData
{
    /**
     * @param  array<int, string>  $tags
     */
    public function __construct(
        public array $tags,
        public string $altText,
        public int $compositionScore,
        public int $focusScore,
        public int $lightingScore,
        public string $critique,
        public ?string $mood,
        public bool $isHighlight,
        public bool $isNearDuplicate,
    ) {}

    /**
     * @param  array{
     *     tags: array<int, string>,
     *     alt_text: string,
     *     composition_score: int,
     *     focus_score: int,
     *     lighting_score: int,
     *     critique: string,
     *     mood: string|null,
     *     is_highlight: bool,
     *     is_near_duplicate: bool
     * }  $payload
     */
    public static function fromArray(array $payload): self
    {
        return new self(
            tags: array_slice(array_values($payload['tags']), 0, 10),
            altText: $payload['alt_text'],
            compositionScore: $payload['composition_score'],
            focusScore: $payload['focus_score'],
            lightingScore: $payload['lighting_score'],
            critique: $payload['critique'],
            mood: $payload['mood'],
            isHighlight: $payload['is_highlight'],
            isNearDuplicate: $payload['is_near_duplicate'],
        );
    }
}
