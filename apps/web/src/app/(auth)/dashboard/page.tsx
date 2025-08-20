"use client";

import { trpc } from "@/utils/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Dashboard() {
  const { data: session, isLoading } = trpc.auth.getSession.useQuery();

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  const metadata = session?.user.metadata;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome back, {session?.user.name}!
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Name</p>
              <p className="text-lg">{metadata?.name || session?.user.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Role</p>
              <p className="text-lg capitalize">{session?.user.role}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="text-lg">{session?.user.email}</p>
            </div>
            {metadata?.dateOfBirth && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
                <p className="text-lg">{new Date(metadata.dateOfBirth).toLocaleDateString()}</p>
              </div>
            )}
            {metadata?.sex && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Sex</p>
                <p className="text-lg capitalize">{metadata.sex}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {session?.user.role === "doctor" && metadata && (
          <Card>
            <CardHeader>
              <CardTitle>Professional Information</CardTitle>
              <CardDescription>Your medical practice details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {'specialization' in metadata && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Specialization</p>
                  <p className="text-lg">{metadata.specialization}</p>
                </div>
              )}
              {'licenseNumber' in metadata && metadata.licenseNumber && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">License Number</p>
                  <p className="text-lg">{metadata.licenseNumber}</p>
                </div>
              )}
              {'experience' in metadata && metadata.experience && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Experience</p>
                  <p className="text-lg">{metadata.experience} years</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Get started with Better Care</CardDescription>
          </CardHeader>
          <CardContent>
            {session?.user.role === "patient" ? (
              <p className="text-muted-foreground">
                Create a new health issue channel to connect with doctors.
              </p>
            ) : (
              <p className="text-muted-foreground">
                Browse available patient channels to provide consultations.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
