'use client';

// V8: Root error boundary for public pages (dashboard already has its own)
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold text-white mb-4 font-mono">Something went wrong</h1>
        <p className="text-neutral-400 mb-8">
          An unexpected error occurred. Please try again.
        </p>
        <button
          onClick={reset}
          className="bg-green-500 hover:bg-green-600 text-black font-semibold px-6 py-2.5 rounded-md transition"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
