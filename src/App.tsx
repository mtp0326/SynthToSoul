import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Index from "./pages/Index";
import AIResults from "./pages/AIResults";
import HumanResults from "./pages/HumanResults";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const RedirectToPaper = () => {
  useEffect(() => {
    window.location.href = "/research_paper.pdf";
  }, []);
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/ai-results" element={<AIResults />} />
          <Route path="/human-results" element={<HumanResults />} />
          <Route path="/paper" element={<RedirectToPaper />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
