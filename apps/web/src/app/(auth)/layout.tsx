
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { AuthGuard } from "@/components/auth-guard";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthGuard>
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <header className="flex h-14 shrink-0 items-center gap-2">
                        <div className="flex flex-1 items-center gap-2 px-3">
                            <SidebarTrigger />
                            <Separator
                                orientation="vertical"
                                className="mr-2 data-[orientation=vertical]:h-4"
                            />
                        </div>
                    </header>
                    <main className="px-10 py-4">
                        {children}
                    </main>
                </SidebarInset>
            </SidebarProvider>
        </AuthGuard>
    );
}