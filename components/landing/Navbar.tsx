"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, ArrowRight, Wand2, Heart, Zap, Menu, X, Sparkles, HelpCircle, Layers, Eye } from "lucide-react";

interface NavbarProps {
  activeAct?: 1 | 2 | 3;
}

export function Navbar({ activeAct = 1 }: NavbarProps) {
  const [scrolled, setScrolled] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const pathname = usePathname();

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Theme-specific styles
  const actThemeConfig = {
    1: {
      navBg: scrolled
        ? "bg-[#FAF6F0]/98 border-[#E6D7C3] text-[#3D2C2E] shadow-sm"
        : "bg-[#FAF6F0]/90 border-b border-[#E6D7C3]/50 text-[#3D2C2E]",
      logoGlow: "text-[#5C3317]",
      badgeBg: "bg-[#8A5A36]/15 text-[#5C3317] border-[#8A5A36]/40",
      badgeIcon: Wand2,
      badgeLabel: "Vintage Grimoire",
      ctaBg: "bg-[#5C3317] hover:bg-[#43220F] text-[#FAF6F0] shadow-md shadow-[#5C331730]",
      linkNormal: "text-[#3D2C2E] hover:text-[#5C3317] hover:underline decoration-2 underline-offset-4",
      linkActive: "text-[#5C3317] font-extrabold border-b-2 border-[#5C3317] pb-1",
      loginText: "text-[#3D2C2E] hover:text-[#5C3317] font-bold",
    },
    2: {
      navBg: scrolled
        ? "bg-[#FAF5FF]/98 border-[#F0ABFC]/60 text-[#3B0764] shadow-sm"
        : "bg-[#FAF5FF]/90 border-b border-[#F0ABFC]/40 text-[#3B0764]",
      logoGlow: "text-[#EC4899]",
      badgeBg: "bg-[#EC4899]/15 text-[#BE185D] border-[#F0ABFC]/60",
      badgeIcon: Heart,
      badgeLabel: "Fairy Tale",
      ctaBg: "bg-gradient-to-r from-[#EC4899] to-[#9333EA] hover:from-[#DB2777] hover:to-[#7E22CE] text-white shadow-md shadow-[#EC489930]",
      linkNormal: "text-[#3B0764] hover:text-[#BE185D] hover:underline decoration-2 underline-offset-4",
      linkActive: "text-[#BE185D] font-extrabold border-b-2 border-[#EC4899] pb-1",
      loginText: "text-[#3B0764] hover:text-[#BE185D] font-bold",
    },
    3: {
      navBg: scrolled
        ? "bg-[#090D16]/98 border-[#1E293B] text-[#F8FAFC] shadow-sm"
        : "bg-[#090D16]/90 border-b border-[#1E293B] text-[#F8FAFC]",
      logoGlow: "text-[#38BDF8]",
      badgeBg: "bg-[#0284C7]/20 text-[#38BDF8] border-[#0284C7]/50",
      badgeIcon: Zap,
      badgeLabel: "Kinetic Cyber",
      ctaBg: "bg-gradient-to-r from-[#0284C7] to-[#DC2626] hover:from-[#0369A1] hover:to-[#B91C1C] text-white shadow-lg shadow-[#0284C740]",
      linkNormal: "text-[#F8FAFC] hover:text-[#38BDF8] hover:underline decoration-2 underline-offset-4",
      linkActive: "text-[#38BDF8] font-extrabold border-b-2 border-[#38BDF8] pb-1",
      loginText: "text-[#F8FAFC] hover:text-[#38BDF8] font-bold",
    },
  }[activeAct];

  const CurrentBadgeIcon = actThemeConfig.badgeIcon;

  const navLinks = [
    { label: "How It Works", href: "/how-it-works", icon: Sparkles },
    { label: "Features", href: "/features", icon: Layers },
    { label: "See an Example", href: "/example", icon: Eye },
    { label: "FAQ", href: "/faq", icon: HelpCircle },
  ];

  return (
    <header
      id="main-navigation-bar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 backdrop-blur-md border-b ${
        mobileMenuOpen ? "bg-[#FAF6F0] dark:bg-[#090D16]" : actThemeConfig.navBg
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo & Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-105 border ${
              activeAct === 1
                ? "bg-[#5C3317] text-[#FDF6E8] border-[#8A5A36]/40 shadow-sm"
                : activeAct === 2
                ? "bg-gradient-to-br from-[#EC4899] to-[#9333EA] text-white border-[#F0ABFC]/60 shadow-sm shadow-[#EC489930]"
                : "bg-[#0F172A] text-[#38BDF8] border-[#38BDF8]/40 shadow-lg shadow-[#38BDF820]"
            }`}
          >
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span
              className={`font-salted text-3xl sm:text-4xl leading-none transition-colors duration-500 ${actThemeConfig.logoGlow}`}
            >
              EchoTale
            </span>
            <span className="font-note text-xs sm:text-sm tracking-wide -mt-1 opacity-75">
              Living Grimoire
            </span>
          </div>
        </Link>

        {/* Center Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-6 xl:gap-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm sm:text-base font-semibold transition-all px-1 py-1 ${
                  isActive ? actThemeConfig.linkActive : actThemeConfig.linkNormal
                }`}
              >
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Dynamic Theme Indicator Pill (Hidden on smaller screens) */}
        <div className="hidden xl:flex items-center gap-2">
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border transition-all duration-500 ${actThemeConfig.badgeBg}`}
          >
            <CurrentBadgeIcon className="w-3 h-3 animate-pulse" />
            <span>{actThemeConfig.badgeLabel}</span>
          </div>
        </div>

        {/* Actions & Mobile Toggle */}
        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/login"
            id="nav-login-button"
            className={`hidden sm:flex px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm transition-all items-center gap-1.5 ${actThemeConfig.loginText}`}
          >
            <span>Log In</span>
          </Link>

          <Link
            href="/signup"
            id="nav-signup-button"
            className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-2xl font-serif-display font-semibold text-xs sm:text-sm tracking-wide flex items-center gap-1.5 transition-all duration-300 transform active:scale-95 ${actThemeConfig.ctaBg}`}
          >
            <span>Sign Up</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </Link>

          {/* Mobile Hamburger Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay Dropdown - Exactly like Image 1 */}
      {mobileMenuOpen && (
        <div className="md:hidden px-6 pt-4 pb-8 bg-[#090D16] text-[#F8FAFC] space-y-4 border-t border-slate-800 shadow-2xl animate-fadeIn">
          <div className="space-y-1 py-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-slate-800/80 text-sky-400 font-semibold"
                      : "text-slate-300 hover:bg-slate-900 hover:text-white opacity-85"
                  }`}
                >
                  <Icon className="w-4 h-4 text-slate-400" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-800/80">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full block text-center py-3 rounded-2xl text-sm font-semibold border border-slate-700/80 text-slate-200 hover:bg-slate-800/50 transition-all"
            >
              Log In
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
