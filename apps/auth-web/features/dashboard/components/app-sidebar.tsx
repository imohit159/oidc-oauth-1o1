"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/common/logo";
import { SIDEBAR_NAV } from "@/constants/navigation";
import { useAuthStore } from "@/store/auth.store";
import { NavUser } from "./nav-user";
import {
  KeyRound,
  ShieldCheck,
  BookOpen,
  Braces,
  Terminal,
  User,
  LayoutDashboard,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Dashboard: LayoutDashboard,
  Clients: KeyRound,
  "Authorized Apps": ShieldCheck,
  "OIDC Setup Guide": BookOpen,
  "OpenID Configuration": Braces,
  "API Reference": Terminal,
  "Profile & Sessions": User,
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { user } = useAuthStore();

  const userData = user
    ? {
        name: `${user.given_name} ${user.family_name}`,
        email: user.email,
        avatar: "",
      }
    : {
        name: "User",
        email: "user@example.com",
        avatar: "",
      };

  return (
    <Sidebar variant="floating" {...props}>
      <SidebarHeader className="border-sidebar-border flex items-start justify-start border-b p-4">
        <Logo showText={true} />
      </SidebarHeader>
      <SidebarContent className="gap-4 py-4">
        {SIDEBAR_NAV.map((group) => (
          <SidebarGroup key={group.title} className="py-0">
            <SidebarGroupLabel className="text-muted-foreground/60 px-3 text-xs font-semibold tracking-wider uppercase">
              {group.title}
            </SidebarGroupLabel>
            <SidebarGroupContent className="mt-1">
              <SidebarMenu className="gap-1">
                {group.items.map((item) => {
                  const Icon = iconMap[item.title];
                  const isActive =
                    pathname === item.url ||
                    (item.url !== "/" &&
                      item.url !== "/dashboard" &&
                      pathname.startsWith(item.url));
                  const isExternal =
                    item.url.startsWith("http") || item.url === "#";

                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        isActive={isActive}
                        render={
                          isExternal ? (
                            <a
                              href={item.url}
                              target={
                                item.url.startsWith("http")
                                  ? "_blank"
                                  : undefined
                              }
                              rel={
                                item.url.startsWith("http")
                                  ? "noopener noreferrer"
                                  : undefined
                              }
                            />
                          ) : (
                            <Link href={item.url} />
                          )
                        }
                      >
                        {Icon && <Icon className="size-4" />}
                        <span className="font-medium">{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="border-sidebar-border border-t p-2">
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  );
}
