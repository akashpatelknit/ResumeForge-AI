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
      className="fixed bottom-6 right-6 z-50 bg-linear-to-r from-purple-600 via-blue-600 to-pink-600 text-white shadow-2xl hover:shadow-purple-500/50 hover:scale-105 transition-all duration-200 rounded-full px-6 py-6 group cursor-pointer"
    >
      <Sparkles className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform" />
      <span className="font-semibold">Optimize with AI</span>
      <Badge className="ml-2 bg-white text-purple-600 text-xs">Beta</Badge>
    </Button>
  );
}
