"use client";

import { AuthGuard } from "@/components/auth-guard";
import { trpc } from "@/utils/trpc";

export default function Dashboard() {
  return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <p className="text-lg">Welcome, {session?.user.name}!</p>
        <p className="text-sm text-gray-600 mt-2">
          Role: {session?.user.role ? session.user.role : "Not set"}
        </p>
      </div>
  );
}
