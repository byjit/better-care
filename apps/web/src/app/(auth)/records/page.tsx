export default function RecordsPage() {
  return (
    <div className="flex flex-col gap-4 h-full space-y-8">
      <h1 className="text-2xl font-bold">Medical Records</h1>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <p>No documents uploaded yet</p>
        </div>
        <p className="text-sm text-muted-foreground">
          This is where you will be able to see all your medical records.
        </p>
      </div>
    </div>
  );
}