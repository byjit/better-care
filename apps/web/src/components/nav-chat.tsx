import {
  ArrowUpRight,
  MoreHorizontal,
  StarOff,
  Trash2,
  MessageCircle,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import Link from "next/link"

export function NavChat({
  chats,
}: {
  chats: {
    name: string
    url: string
    status?: string
    id?: string
  }[]
}) {
  const { isMobile } = useSidebar()

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'inactive':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <MessageCircle className="h-4 w-4" />
    }
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600'
      case 'active':
        return 'text-green-600'
      case 'inactive':
        return 'text-red-600'
      default:
        return ''
    }
  }

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden mt-4">
      <SidebarGroupLabel>Consultations</SidebarGroupLabel>
      <SidebarMenu>
        {chats.length === 0 ? (
          <SidebarMenuItem>
            <SidebarMenuButton disabled className="text-sidebar-foreground/50">
              <MessageCircle className="h-4 w-4" />
              <span>No consultations yet</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ) : (
          chats.map((item) => (
            <SidebarMenuItem key={item.id || item.name}>
              <SidebarMenuButton asChild className={getStatusColor(item.status)}>
                <Link href={item.url} title={item.name}>
                  {getStatusIcon(item.status)}
                  <span className="truncate">{item.name}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))
        )}
      </SidebarMenu>
    </SidebarGroup>
  )
}
