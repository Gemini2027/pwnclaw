export default function DashboardLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-950">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-neutral-800 border-t-green-500 rounded-full animate-spin" />
        <p className="text-neutral-500 text-sm">Loading...</p>
      </div>
    </div>
  );
}
