import { useState, useCallback } from "react";
import { Disc3 } from "lucide-react";
import DropZone from "@/components/DropZone";
import ResultsList from "@/components/ResultsList";
import VinylRecord from "@/components/VinylRecord";
import { mockSimilarSongs, Song } from "@/data/mockSongs";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<Song[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleFileSelect = useCallback(async (file: File) => {
    setUploadedFile(file);
    setIsProcessing(true);
    setResults([]);

    toast({
      title: "Analyzing your track",
      description: "Please wait while we classify your song...",
    });

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Create a promise that resolves after 5 seconds
      const minDelay = new Promise(resolve => setTimeout(resolve, 5000));

      const [response] = await Promise.all([
        fetch("http://localhost:8000/api/predict", {
          method: "POST",
          body: formData,
        }),
        minDelay
      ]);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server error response:", errorText);
        throw new Error(`Analysis failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();

      setIsProcessing(false);

      toast({
        title: "Analysis complete!",
        description: `Result: ${data.result}`,
      });

      if (data.result === "Human-Made Classified") {
        navigate("/human-results", { state: { filename: data.filename } });
      } else if (data.result === "AI Classified") {
        navigate("/ai-results", { state: { filename: data.filename } });
      } else {
        console.warn("Unknown result type:", data.result);
      }

    } catch (error) {
      console.error("Error during analysis:", error);
      setIsProcessing(false);
      toast({
        variant: "destructive",
        title: "Analysis failed",
        description: "There was an error processing your file. Please try again.",
      });
    }
  }, [toast, navigate]);

  return (
    <div className="min-h-screen py-12 px-4">
      {/* Header */}
      <header className="text-center mb-16 relative">
        {/* Floating vinyl decorations */}
        <div className="absolute top-0 left-10 opacity-20 hidden lg:block">
          <VinylRecord size="lg" isPlaying className="animate-float" />
        </div>
        <div className="absolute top-20 right-10 opacity-15 hidden lg:block">
          <VinylRecord size="md" isPlaying className="animate-float delay-500" />
        </div>

        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-14 h-14 rounded-full bg-gradient-warm flex items-center justify-center shadow-glow">
            <Disc3 className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground">
            Vinyl<span className="text-gradient">Match</span>
          </h1>
        </div>

        <p className="text-lg text-muted-foreground max-w-md mx-auto">
          Drop your audio file to detect if it was made by a human or AI.
        </p>

        {/* Decorative line */}
        <div className="flex items-center justify-center gap-3 mt-8">
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-border" />
          <div className="w-2 h-2 rounded-full bg-primary" />
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-border" />
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto">
        <DropZone
          onFileSelect={handleFileSelect}
          isProcessing={isProcessing}
          uploadedFile={uploadedFile}
        />

        <ResultsList songs={results} />

        {/* Empty state hint */}
        {!uploadedFile && (
          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground">
              Supported formats: <span className="font-semibold">.wav, .mp3, .flac, .ogg</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1 opacity-70">
              Audio fingerprinting powered by retro algorithms
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-20 text-center">
        <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
          <VinylRecord size="sm" isPlaying />
          <span className="font-display">SynthToSoul</span>
          <span className="opacity-50">•</span>
          <span>Support human artists</span>
          <span className="opacity-50">•</span>
          <a 
            href="/research_paper.pdf" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hover:text-foreground transition-colors underline decoration-dotted underline-offset-4"
          >
            Research Paper
          </a>
        </div>
      </footer>
    </div>
  );
};

export default Index;
