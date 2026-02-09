"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FlaskConical, Bot, Settings } from "lucide-react";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/tests", icon: FlaskConical, label: "Tests" },
  { href: "/dashboard/agents", icon: Bot, label: "Agents" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="flex-1 px-4 space-y-1">
      {navItems.map(({ href, icon: Icon, label }) => {
        const isActive = href === "/dashboard"
          ? pathname === "/dashboard"
          : pathname.startsWith(href);

        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              isActive
                ? "text-white bg-neutral-800"
                : "text-neutral-400 hover:text-white hover:bg-neutral-800"
            }`}
          >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
