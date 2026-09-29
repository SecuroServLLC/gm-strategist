import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { LayoutDashboard, ScrollText, Workflow, Users, Map as MapIcon, Dices, BookOpen, Backpack, Printer, Swords, Library, UserPlus, Cog, Bot, LayoutGrid, FlaskConical, Tablet } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Campaigns", icon: Library, end: true },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/campaign", label: "Red Thread", icon: ScrollText },
  { to: "/story", label: "Story Flow", icon: Workflow },
  { to: "/characters", label: "Characters", icon: Users },
  { to: "/maps", label: "Maps", icon: MapIcon },
  { to: "/sessions", label: "Sessions", icon: BookOpen },
  { to: "/group", label: "The Party", icon: Backpack },
  { to: "/players", label: "Players", icon: UserPlus },
  { to: "/play", label: "Play", icon: Swords },
  { to: "/board", label: "Board", icon: LayoutGrid },
  { to: "/co-dm", label: "Co-DM", icon: Bot },
  { to: "/system", label: "System", icon: Cog },
  { to: "/print", label: "Print", icon: Printer },
  { to: "/lab", label: "Lab", icon: FlaskConical },
  { to: "/sys", label: "Devices", icon: Tablet },
];

export default function Layout() {
  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <aside className="no-print w-64 shrink-0 border-r border-sidebar-border bg-sidebar-background flex flex-col">
        <div className="px-6 py-7 border-b border-sidebar-border">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-amber-700 flex items-center justify-center shadow-lg shadow-primary/20">
              <Dices className="w-5 h-5 text-sidebar-background" strokeWidth={2.2} />
            </div>
            <div>
              <h1 className="font-heading text-lg leading-none text-sidebar-foreground">GM Headquarters</h1>
              <p className="text-[11px] text-muted-foreground mt-1 tracking-wide uppercase">Planning Workshop</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1">
          {NAV.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all",
                    isActive
                      ? "bg-sidebar-accent text-primary border border-primary/30 shadow-sm"
                      : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/60 border border-transparent"
                  )
                }
              >
                <Icon className="w-4.5 h-4.5 shrink-0" strokeWidth={1.8} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="px-5 py-4 border-t border-sidebar-border">
          <p className="text-[11px] text-muted-foreground leading-relaxed font-heading italic">
            "Anything goes. The rest you plan here."
          </p>
        </div>
      </aside>

      <main className="flex-1 min-w-0 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}