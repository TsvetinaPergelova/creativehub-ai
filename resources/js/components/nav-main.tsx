import { Link } from '@inertiajs/react';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import type { NavItem } from '@/types';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const { isCurrentUrl } = useCurrentUrl();

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel className="px-3 text-[13px] font-medium text-slate-500 dark:text-sidebar-foreground/70">
                Platform
            </SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                            asChild
                            isActive={isCurrentUrl(item.href)}
                            tooltip={{ children: item.title }}
                            className="h-11 rounded-2xl border border-transparent px-3 text-[15px] font-medium text-slate-700 shadow-none transition-colors hover:border-primary/25 hover:bg-primary/10 hover:text-primary data-[active=true]:border-primary/35 data-[active=true]:bg-primary/10 data-[active=true]:text-primary dark:text-sidebar-foreground dark:hover:border-primary/20 dark:hover:bg-primary/10 dark:hover:text-primary dark:data-[active=true]:border-primary/25 dark:data-[active=true]:bg-primary/12 dark:data-[active=true]:text-primary"
                        >
                            <Link href={item.href} prefetch>
                                {item.icon && <item.icon />}
                                <span>{item.title}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
