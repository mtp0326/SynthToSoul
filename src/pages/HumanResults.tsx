import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Share2, CheckCircle2, Music2, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import VinylRecord from "@/components/VinylRecord";
import SongCard, { Song } from "@/components/SongCard";

const HumanResults = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const filename = location.state?.filename;

  const [detectedSong, setDetectedSong] = useState<Song | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!filename) {
      console.warn("No filename provided for HumanResults");
      setLoading(false);
      return;
    }

    const fetchSongDetails = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/song-details?filename=${encodeURIComponent(filename)}`);
        if (!res.ok) throw new Error("Failed to fetch song details");
        const data = await res.json();
        
        // Use a high confidence/similarity
        const probability = data.probability || 0; 
        const humanConfidence = (1 - probability) * 100;

        setDetectedSong({
          id: 0,
          title: data.title || "Unknown Title",
          artist: data.artist || "Unknown Artist",
          album: "Uploaded Track",
          similarity: Math.round(humanConfidence),
          genre: data.genre || "Unknown"
        });
      } catch (e) {
        console.error("Error fetching song details:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchSongDetails();
  }, [filename]);

  return (
    <div className="min-h-screen py-12 px-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-secondary/5 rounded-full blur-3xl -z-10" />

      {/* Floating vinyl decorations */}
      <div className="absolute top-20 left-10 opacity-20 hidden lg:block">
        <VinylRecord size="lg" isPlaying className="animate-float" />
      </div>
      <div className="absolute bottom-40 right-10 opacity-15 hidden lg:block">
        <VinylRecord size="md" isPlaying className="animate-float delay-500" />
      </div>

      <header className="max-w-2xl mx-auto mb-12 relative z-10">
        <div className="flex justify-between items-center mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Upload
          </Button>
          
          {filename && (
            <div className="text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded-full border border-border/50 max-w-full overflow-hidden text-ellipsis whitespace-nowrap">
              File: {filename}
            </div>
          )}
        </div>

        {/* Human Detection Success */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-success/10 mb-6 relative group">
            <div className="absolute inset-0 bg-success/20 rounded-full animate-ping opacity-20" />
            <CheckCircle2 className="w-10 h-10 text-success relative z-10" />
          </div>
          <h1 className="font-display text-4xl font-bold text-foreground mb-4">
            Human Creativity Confirmed!
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Our algorithms have analyzed the audio patterns and confirmed this track exhibits human-made music characteristics.
          </p>
        </div>
      </header>

      <main className="max-w-xl mx-auto relative z-10">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : detectedSong ? (
          <div className="animate-slide-up">
            <div className="bg-card rounded-xl p-5 shadow-card hover:shadow-vinyl transition-all duration-300 hover:-translate-y-1">
              <div className="flex gap-5">
                {/* Mini vinyl */}
                <div className="relative flex-shrink-0">
                  <VinylRecord size="sm" className="group-hover:animate-spin-slow" />
                </div>

                {/* Song info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-lg font-semibold text-foreground truncate">
                    {detectedSong.title}
                  </h3>
                  <p className="text-muted-foreground text-sm truncate">{detectedSong.artist}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span>{detectedSong.album}</span>
                  </div>
                </div>

                {/* Genre (removed similarity score) */}
                <div className="flex flex-col items-end justify-start">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
                    <Music2 className="w-3 h-3" />
                    <span>{detectedSong.genre}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex gap-4 justify-center">
              <Button className="w-full sm:w-auto gap-2">
                <Download className="w-4 h-4" />
                Download Metadata
              </Button>
              <Button variant="outline" className="w-full sm:w-auto gap-2">
                <Share2 className="w-4 h-4" />
                Share Result
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center text-muted-foreground">
             Could not load song details.
          </div>
        )}
      </main>

      <footer className="mt-20 text-center relative z-10">
        <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
          <VinylRecord size="sm" isPlaying />
          <span className="font-display">SynthToSoul</span>
          <span className="opacity-50">•</span>
          <span>Support human artists</span>
        </div>
      </footer>
    </div>
  );
};

export default HumanResults;
