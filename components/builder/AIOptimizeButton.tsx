"use client";

import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function AIOptimizeButton() {
  return (
    <Button
      onClick={() => {
        /* Open AI modal */
      }}
      size="lg"
      aria-label="Optimize with AI"
      className="fixed bottom-6 right-6 z-50 bg-linear-to-r from-purple-600 via-blue-600 to-pink-600 text-white shadow-2xl hover:shadow-purple-500/50 hover:scale-105 transition-all duration-200 rounded-full p-4 sm:px-6 sm:py-6 group cursor-pointer"
    >
      <Sparkles className="h-5 w-5 sm:mr-2 group-hover:rotate-12 transition-transform" />
      <span className="hidden font-semibold sm:inline">Optimize with AI</span>
      <Badge className="ml-2 hidden bg-white text-xs text-purple-600 sm:inline-flex">Beta</Badge>
    </Button>
  );
}
