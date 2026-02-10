import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Agent Security Benchmarks — PwnClaw",
  description: "See how AI agents perform against 112 security attacks. Anonymous benchmarks from real PwnClaw scans.",
  alternates: { canonical: "https://www.pwnclaw.com/benchmarks" },
};

export default function BenchmarksLayout({ children }: { children: React.ReactNode }) {
  return children;
}
