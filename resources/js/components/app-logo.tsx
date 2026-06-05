import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-11 items-center justify-center rounded-full border border-primary/25 bg-[linear-gradient(180deg,#ffffff,#eef2ff)] text-primary ring-1 ring-primary/18 transition-all group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:size-9 group-data-[collapsible=icon]:border-primary/20 group-data-[collapsible=icon]:bg-primary group-data-[collapsible=icon]:text-white dark:border-primary/20 dark:bg-[#151728] dark:bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.22),transparent_58%)] dark:text-white dark:ring-0 dark:group-data-[collapsible=icon]:bg-primary dark:group-data-[collapsible=icon]:text-white">
                <AppLogoIcon className="size-5 text-primary dark:text-white" />
            </div>
            <div className="ml-2.5 grid flex-1 text-left leading-tight group-data-[collapsible=icon]:ml-0 group-data-[collapsible=icon]:hidden">
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
