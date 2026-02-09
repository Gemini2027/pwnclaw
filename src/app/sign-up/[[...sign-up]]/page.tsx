import { SignUp } from "@clerk/nextjs";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black">
      {/* Logo */}
      <Link href="/" className="mb-8 flex items-center gap-2">
        <span className="text-2xl font-bold text-green-500 font-mono">PWN</span>
        <span className="text-2xl font-bold text-white font-mono">CLAW</span>
      </Link>
      
      <SignUp 
        fallbackRedirectUrl="/dashboard"
        signInFallbackRedirectUrl="/dashboard"
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "bg-neutral-900 border border-neutral-800 shadow-2xl",
            headerTitle: "text-white",
            headerSubtitle: "text-neutral-400",
            socialButtonsBlockButton: "bg-neutral-800 border-neutral-700 text-white hover:bg-neutral-700",
            socialButtonsBlockButtonText: "text-white",
            formFieldLabel: "text-neutral-300",
            formFieldInput: "bg-neutral-800 border-neutral-700 text-white",
            footerActionLink: "text-green-500 hover:text-green-400",
            formButtonPrimary: "bg-green-500 hover:bg-green-600 text-black font-semibold",
            dividerLine: "bg-neutral-700",
            dividerText: "text-neutral-500",
          }
        }}
      />
      
      <p className="mt-8 text-neutral-500 text-sm">
        Start with 3 free security scans
      </p>
    </div>
  );
}
