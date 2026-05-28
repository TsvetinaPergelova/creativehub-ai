import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-11 items-center justify-center rounded-full border border-primary/28 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015)),radial-gradient(circle_at_top_left,rgba(99,102,241,0.28),transparent_58%),#151728] text-white shadow-[0_12px_32px_rgba(79,70,229,0.16)] ring-1 ring-primary/14">
                <AppLogoIcon className="size-5 text-white" />
            </div>
            <div className="ml-2.5 grid flex-1 text-left leading-tight">
                <span className="truncate text-[15px] font-semibold text-sidebar-foreground">
                    CreativeHub
                </span>
                <span className="truncate text-xs text-muted-foreground">
                    Curate. Present. Share.
                </span>
            </div>
        </>
    );
}
