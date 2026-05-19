export type ProfileCoverStyle =
    | 'studio'
    | 'editorial'
    | 'aurora'
    | 'monochrome';

type ProfileCoverOption = {
    value: ProfileCoverStyle;
    label: string;
    description: string;
    coverClass: string;
    swatchClass: string;
};

export const profileCoverOptions: ProfileCoverOption[] = [
    {
        value: 'studio',
        label: 'Studio',
        description: 'Deep violet glow with a polished portfolio feel.',
        coverClass:
            'bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.34),transparent_28%),linear-gradient(135deg,rgba(34,16,74,0.98),rgba(58,28,54,0.96))]',
        swatchClass:
            'bg-[linear-gradient(135deg,rgba(67,56,202,1),rgba(168,85,247,0.86),rgba(244,114,182,0.55))]',
    },
    {
        value: 'editorial',
        label: 'Editorial',
        description: 'Warmer plum and bronze tones for a softer header.',
        coverClass:
            'bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.18),transparent_25%),linear-gradient(135deg,rgba(31,30,38,0.98),rgba(84,42,56,0.95),rgba(121,72,38,0.88))]',
        swatchClass:
            'bg-[linear-gradient(135deg,rgba(52,48,65,1),rgba(122,66,89,0.92),rgba(180,117,52,0.9))]',
    },
    {
        value: 'aurora',
        label: 'Aurora',
        description: 'Cool teal and indigo for a cleaner contemporary look.',
        coverClass:
            'bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.24),transparent_24%),linear-gradient(135deg,rgba(10,23,39,0.98),rgba(25,58,92,0.94),rgba(36,84,112,0.9))]',
        swatchClass:
            'bg-[linear-gradient(135deg,rgba(15,118,110,1),rgba(37,99,235,0.92),rgba(56,189,248,0.82))]',
    },
    {
        value: 'monochrome',
        label: 'Monochrome',
        description: 'Graphite neutrals for a quieter, more minimal header.',
        coverClass:
            'bg-[linear-gradient(135deg,rgba(20,20,27,0.98),rgba(36,36,45,0.95),rgba(58,58,66,0.88))]',
        swatchClass:
            'bg-[linear-gradient(135deg,rgba(17,24,39,1),rgba(55,65,81,0.9),rgba(107,114,128,0.78))]',
    },
];

export function resolveProfileCoverStyle(
    value: string | null | undefined,
): ProfileCoverOption {
    return (
        profileCoverOptions.find((option) => option.value === value) ??
        profileCoverOptions[0]
    );
}
