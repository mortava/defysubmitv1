"use client";

import { Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import XMLUploader from "@/components/XMLUploader";

export default function Home() {
  return (
    <main className="min-h-screen bg-black grid-bg relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] bg-[rgb(0,245,255)] rounded-full opacity-[0.03] blur-[100px]" />
        <div className="absolute bottom-1/4 -right-1/4 w-[600px] h-[600px] bg-[rgb(0,245,255)] rounded-full opacity-[0.03] blur-[100px]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[rgb(0,245,255)] flex items-center justify-center">
              <Upload className="w-4 h-4 text-black" />
            </div>
            <span className="text-xl font-bold text-white">
              SUBMIT<span className="text-[rgb(0,245,255)]">NOW</span>
            </span>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-16 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Blitz <span className="gradient-text">Submit</span>
            </h1>
          </div>

          {/* Main Card */}
          <Card className="max-w-2xl mx-auto animate-pulse-glow">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl">Start New Loan File</CardTitle>
            </CardHeader>
            <CardContent>
              <XMLUploader />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-[rgb(0,245,255)] flex items-center justify-center">
                <Upload className="w-3 h-3 text-black" />
              </div>
              <span className="text-sm font-semibold text-white">SUBMITNOW</span>
            </div>
            <p className="text-white/30 text-xs">
              © {new Date().getFullYear()} TRACE AOS
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
