export type ProjectModeValue =
    | 'photography'
    | 'design_case_study'
    | 'art_series'
    | 'mixed_experimental';

const projectModeLabels: Record<ProjectModeValue, string> = {
    photography: 'Photography',
    design_case_study: 'Design / Case Study',
    art_series: 'Art Series',
    mixed_experimental: 'Mixed / Experimental',
};

export function normalizeProjectMode(mode?: string | null): ProjectModeValue {
    if (mode === 'design_case_study') {
        return 'design_case_study';
    }

    if (mode === 'design-case-study') {
        return 'design_case_study';
    }

    if (mode === 'art_series') {
        return 'art_series';
    }

    if (mode === 'art-series') {
        return 'art_series';
    }

    if (mode === 'mixed_experimental') {
        return 'mixed_experimental';
    }

    if (mode === 'mixed-experimental') {
        return 'mixed_experimental';
    }

    if (mode === 'photography') {
        return 'photography';
    }

    return 'mixed_experimental';
}

export function getProjectModeLabel(mode?: string | null): string {
    return projectModeLabels[normalizeProjectMode(mode)];
}
