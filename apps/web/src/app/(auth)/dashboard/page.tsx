"use client";

import { trpc } from "@/utils/trpc";

export default function Dashboard() {
  const { data: session, isLoading } = trpc.auth.getSession.useQuery();

  if (isLoading) {
    return <div>Loading...</div>;
  }

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
