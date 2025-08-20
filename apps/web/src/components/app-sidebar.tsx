'use client'

import * as React from "react"
import {
  Command,
  Home,
  Images,
  Leaf,
  Search,
  Sparkles,
  SquarePen,
} from "lucide-react"

import { NavChat } from "@/components/nav-chat"
import { NavMain } from "@/components/nav-main"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import UserMenu from "./user-menu"
import Logo from "./logo"

// This is sample data.
const data = {
  navMain: [
    {
      title: "New Chat",
      url: "/ai",
      icon: SquarePen,
    },
    {
      title: "Doctors",
      url: "/doctors",
      icon: Search,
    },
    {
      title: "Documents",
      url: "/documents",
      icon: Images,
    },
  ],
  chats: [
    {
      name: "Knee pain consultation",
      url: "#",
    },
    {
      name: "Tfcc injury",
      url: "#",
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar className="border-r-0" {...props}>
      <SidebarHeader>
        <SidebarMenuButton className="w-full mb-4">
          <Logo />
        </SidebarMenuButton>
        <NavMain items={data.navMain} />
      </SidebarHeader>
      <SidebarContent>
        <NavChat chats={data.chats} />
      </SidebarContent>
      <SidebarRail />
      <SidebarFooter>
      <UserMenu />
      </SidebarFooter>
    </Sidebar>
  )
}
