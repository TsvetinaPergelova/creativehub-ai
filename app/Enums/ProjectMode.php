<?php

namespace App\Enums;

enum ProjectMode: string
{
    case Photography = 'photography';
    case DesignCaseStudy = 'design_case_study';
    case ArtSeries = 'art_series';
    case MixedExperimental = 'mixed_experimental';

    public function label(): string
    {
        return match ($this) {
            self::Photography => 'Photography',
            self::DesignCaseStudy => 'Design / Case Study',
            self::ArtSeries => 'Art Series',
            self::MixedExperimental => 'Mixed / Experimental',
        };
    }

    public function dashboardProjectLabel(): string
    {
        return match ($this) {
            self::Photography => 'set',
            self::DesignCaseStudy => 'case study',
            self::ArtSeries => 'series',
            self::MixedExperimental => 'project',
        };
    }

    public function readyAnalyzedAssetThreshold(): int
    {
        return match ($this) {
            self::Photography => 4,
            self::DesignCaseStudy => 2,
            self::ArtSeries => 2,
            self::MixedExperimental => 3,
        };
    }

    public function requiresDescriptionForReadiness(): bool
    {
        return match ($this) {
            self::DesignCaseStudy, self::ArtSeries => true,
            self::Photography, self::MixedExperimental => false,
        };
    }
}
