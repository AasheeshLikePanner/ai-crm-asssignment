import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    UsersRound,
    Handshake,
    MessageSquareText,
    FileText,
    FileUp,
} from 'lucide-react';
import {
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
} from '@/components/ui/sidebar';

export function Nav() {
    const location = useLocation();

    const links = [
        {
            title: 'Dashboard',
            icon: LayoutDashboard,
            href: '/',
        },
        {
            title: 'Customers',
            icon: UsersRound,
            href: '/customers',
        },
        {
            title: 'Deals',
            icon: Handshake,
            href: '/deals',
        },
        {
            title: 'Interactions',
            icon: MessageSquareText,
            href: '/interactions',
        },
        {
            title: 'Files',
            icon: FileText,
            href: '/files',
        },
        {
            title: 'Exports',
            icon: FileUp,
            href: '/exports',
        },
    ];

    return (
        <SidebarMenu className="space-y-2">
            {links.map((link, index) => (
                <SidebarMenuItem key={index}>
                    <Link to={link.href} className="w-full">
                        <SidebarMenuButton
                            isActive={location.pathname === link.href}
                            tooltip={link.title} 
                        >
                            <link.icon className="h-4 w-4" />
                            <span>{link.title}</span>
                        </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
            ))}
        </SidebarMenu>
    );
}