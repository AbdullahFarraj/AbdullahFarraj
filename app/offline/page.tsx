export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-100 px-4 text-center">
      <h1 className="text-2xl font-semibold">You are offline</h1>
      <p className="mt-2 text-sm text-slate-600">
        The app is unavailable without a connection. Please reconnect to continue.
      </p>
    </div>
  );
}
