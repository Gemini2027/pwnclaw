import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      <div className="text-center">
        <div className="mb-6">
          <span className="text-2xl font-bold text-green-500 font-mono">PWN</span>
          <span className="text-2xl font-bold text-white font-mono">CLAW</span>
        </div>
        <h1 className="text-6xl font-bold text-white mb-4 font-mono">404</h1>
        <p className="text-xl text-neutral-400 mb-8">Page not found</p>
        <p className="text-neutral-500 mb-8 max-w-md mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link href="/">
          <Button className="bg-green-500 hover:bg-green-600 text-black font-semibold cursor-pointer">
            ← Back to AI Agent Security Testing
          </Button>
        </Link>
      </div>
    </div>
  );
}
