'use client'

import * as React from "react"
import {
  Images,
  LayoutPanelLeft,
  Search,
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
  SidebarRail,
} from "@/components/ui/sidebar"
import UserMenu from "./user-menu"
import Logo from "./logo"
import { trpc } from "@/utils/trpc"

// Base navigation items
const baseNavItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutPanelLeft,
  },
  {
    title: "Doctors",
    url: "/doctors",
    icon: Search,
  },
  {
    title: "Medical Records",
    url: "/records",
    icon: Images,
  },
]

const patientNavItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutPanelLeft,
  },
  {
    title: "New Chat",
    url: "/new-chat",
    icon: SquarePen,
  },
  {
    title: "Doctors",
    url: "/doctors",
    icon: Search,
  },
  {
    title: "Medical Records",
    url: "/records",
    icon: Images,
  },
]

// This is sample data.
const sampleChats = [
  {
    name: "Knee pain consultation",
    url: "#",
  },
  {
    name: "Tfcc injury",
    url: "#",
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = trpc.auth.getSession.useQuery()

  // Determine navigation items based on user role
  const navItems = session?.user.role === 'patient' ? patientNavItems : baseNavItems

  return (
    <Sidebar className="border-r-0" {...props}>
      <SidebarHeader>
        <SidebarMenuButton className="w-full mb-4">
          <Logo />
        </SidebarMenuButton>
        <NavMain items={navItems} />
      </SidebarHeader>
      <SidebarContent>
        <NavChat chats={sampleChats} />
      </SidebarContent>
      <SidebarRail />
      <SidebarFooter>
      <UserMenu />
      </SidebarFooter>
    </Sidebar>
  )
}
