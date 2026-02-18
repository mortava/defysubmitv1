"use client";

import { useState, useEffect } from "react";
import { Sun, Moon, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import XMLUploader from "@/components/XMLUploader";

export default function Home() {
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("defysubmit-theme");
    if (stored) {
      setDarkMode(stored === "dark");
    } else {
      setDarkMode(window.matchMedia("(prefers-color-scheme: dark)").matches);
    }

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem("defysubmit-theme")) {
        setDarkMode(e.matches);
      }
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? "dark" : "light";
  }, [darkMode]);

  const toggleTheme = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem("defysubmit-theme", next ? "dark" : "light");
  };

  return (
    <main className={`min-h-screen relative overflow-x-hidden transition-colors duration-300 ${
      darkMode ? "bg-[#0a0a0a] text-white grid-bg" : "bg-[#f8f9fa] text-gray-900"
    }`}>
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-1/4 -left-1/4 w-[600px] h-[600px] rounded-full blur-[100px] ${
          darkMode ? "bg-gray-400 opacity-[0.03]" : "bg-gray-500 opacity-[0.05]"
        }`} />
        <div className={`absolute bottom-1/4 -right-1/4 w-[600px] h-[600px] rounded-full blur-[100px] ${
          darkMode ? "bg-gray-400 opacity-[0.03]" : "bg-gray-500 opacity-[0.05]"
        }`} />
      </div>

      {/* Navigation */}
      <nav className={`relative z-10 border-b ${darkMode ? "border-white/5" : "border-gray-200"}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-xl font-bold tracking-wide">
            DEFY TPO CLOUD
          </span>
          <div className="flex items-center gap-3">
            <a
              href="mailto:setup@defywholesale.com?subject=Help%20uploading%20a%20new%20file"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                darkMode
                  ? "text-gray-300 hover:bg-white/5 hover:text-white"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <Mail className="w-4 h-4" />
              Need Help?
            </a>
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-all duration-200 ${
                darkMode
                  ? "text-gray-400 hover:bg-white/5 hover:text-white"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              }`}
              title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-16 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Blitz <span className="gradient-text">Submit</span>
            </h1>
          </div>

          {/* Main Card - wider for iframe */}
          <Card className={`max-w-4xl mx-auto animate-pulse-glow ${
            darkMode
              ? "bg-[#111111]/80 border-white/10"
              : "bg-white border-gray-200 shadow-lg"
          }`}>
            <CardHeader className="text-center pb-2">
              <CardTitle className={darkMode ? "" : "text-gray-900"}>
                Start New Loan File
              </CardTitle>
            </CardHeader>
            <CardContent>
              <XMLUploader darkMode={darkMode} />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className={`relative z-10 border-t mt-16 ${darkMode ? "border-white/5" : "border-gray-200"}`}>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <p className={`text-xs leading-relaxed text-center ${darkMode ? "text-white/30" : "text-gray-400"}`}>
            ©OpenBroker Labs & Qualr All rights reserved. We are a B2B technology platform, not a mortgage lender, broker, or loan originator. We do not make credit decisions or originate, arrange, negotiate, or fund loans. Nothing on this site is an offer or commitment to lend. By using this site, you agree to our policies. Use at your own risk. AI may be inaccurate. We are not liable for losses arising from use of this site
          </p>
        </div>
      </footer>
    </main>
  );
}
