"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LayoutDashboard, Users, DatabaseZap } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import HeartPulseIcon from "@/components/ui/HeartPulseIcon";
import ThemeToggle from "./ThemeToggle";
import TwinViewSwitch from "./TwinViewSwitch";

const NAV = [
  { href: "/",        label: "Dashboard",        Icon: LayoutDashboard },
  { href: "/patients",label: "Patient Registry", Icon: Users           },
  { href: "/data",    label: "Data & Model",     Icon: DatabaseZap     },
];

export default function TopHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 640) setMobileOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>
      <header className="sticky top-0 z-50 shrink-0 border-b border-line bg-bg/95 backdrop-blur-sm min-h-[65px]">
        <div className="mx-auto flex items-center justify-between gap-x-3 px-4 py-3 max-w-[1760px]">
          <Link
            href="/"
            title="Happiest Health Digital Twin"
            className="flex items-center gap-3 group shrink-0"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-line border-b-2 bg-surface shadow-xs group-hover:border-cyan/40 group-hover:scale-105 transition duration-200 text-cyan">
              <HeartPulseIcon className="h-5 w-5" />
            </span>
            <span className="leading-none">
              <span className="block text-[11px] font-bold text-text/40 font-mono uppercase tracking-widest">Happiest Health</span>
              <span className="block text-lg font-extrabold tracking-tight text-text group-hover:text-cyan transition-colors duration-200">Digital Twin</span>
            </span>
          </Link>

          {/* Navigation & Controls */}
          <div className="hidden sm:flex items-center gap-3">
            <nav aria-label="Primary navigation" className="flex items-center gap-1 text-xs">
              {NAV.map(({ href, label }) => {
                const active = isActive(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`rounded-xl px-3 py-2 transition font-bold tactile-press ${
                      active
                        ? "bg-cyan/15 font-bold text-cyan ring-1 ring-cyan/30 shadow-xs"
                        : "text-text/60 font-semibold hover:bg-surface hover:text-text"
                    }`}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-2 border-l border-line pl-3">
              <TwinViewSwitch compact />
              <ThemeToggle compact />
            </div>
          </div>

          {/* Mobile Right Action Bar */}
          <div className="flex sm:hidden items-center gap-2">
            <TwinViewSwitch compact />
            <ThemeToggle compact />
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              title="Toggle navigation"
              aria-label="Toggle navigation"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-surface text-text hover:border-cyan/40 hover:text-cyan tactile-press transition-colors shadow-xs"
            >
              <AnimatePresence mode="wait" initial={false}>
                {mobileOpen ? (
                  <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <X className="h-4.5 w-4.5" />
                  </motion.div>
                ) : (
                  <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <Menu className="h-4.5 w-4.5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </header>

      {mounted && createPortal(
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
              className="fixed top-[65px] left-0 right-0 bottom-0 z-[9999] flex flex-col bg-bg px-4 py-6 overflow-y-auto sm:hidden"
            >
              <nav aria-label="Mobile navigation" className="space-y-1.5 flex-1">
                {NAV.map(({ href, label, Icon }) => {
                  const active = isActive(href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm transition duration-150 ${
                        active ? "bg-cyan/15 font-bold text-cyan ring-1 ring-cyan/30 shadow-xs" : "text-text/60 font-semibold hover:bg-surface hover:text-text"
                      }`}
                    >
                      <Icon className="h-4.5 w-4.5" />
                      {label}
                    </Link>
                  );
                })}
              </nav>
              <div className="mt-auto pt-4 border-t border-line space-y-2.5">
                <TwinViewSwitch />
                <ThemeToggle />
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}

