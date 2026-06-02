import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-11 items-center justify-center rounded-full border border-primary/25 bg-[linear-gradient(180deg,#ffffff,#eef2ff)] text-primary ring-1 ring-primary/18 dark:border-primary/28 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015)),radial-gradient(circle_at_top_left,rgba(99,102,241,0.28),transparent_58%),#151728] dark:text-white dark:ring-primary/14">
                <AppLogoIcon className="size-5 text-primary dark:text-white" />
            </div>
            <div className="ml-2.5 grid flex-1 text-left leading-tight">
                <span className="truncate text-[15px] font-semibold text-slate-950 dark:text-sidebar-foreground">
                    CreativeHub
                </span>
                <span className="truncate text-xs text-slate-600 dark:text-muted-foreground">
                    Curate. Present. Share.
                </span>
            </div>
        </>
    );
}
