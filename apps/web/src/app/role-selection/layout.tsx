import { AuthGuard } from "@/components/auth-guard";

export default function RoleSelectionLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthGuard>
            {children}
        </AuthGuard>
    );
}