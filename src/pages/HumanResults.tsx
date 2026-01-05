import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Share2, CheckCircle2, Music2, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import VinylRecord from "@/components/VinylRecord";
import SongCard from "@/components/SongCard";
import { Song } from "@/data/mockSongs";

const HumanResults = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const filename = location.state?.filename;

  const [detectedSong, setDetectedSong] = useState<Song | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If we don't have a filename, we can't fetch details. 
    // Ideally we handle this gracefully or show error.
    if (!filename) {
      console.warn("No filename provided for HumanResults");
      // Fallback or just stop loading (result will be null)
      setLoading(false);
      return;
    }

    const fetchSongDetails = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/song-details?filename=${encodeURIComponent(filename)}`);
        if (!res.ok) throw new Error("Failed to fetch song details");
        const data = await res.json();
        
        // Transform API response to match Song interface if needed
        // API returns: { filename, artist, title, genre, probability, result }
        // We need: { id, title, artist, album, year, similarity, genre }
        
        // Use a high confidence/similarity since it's human-made
        const probability = data.probability || 0; 
        const humanConfidence = (1 - probability) * 100;

        setDetectedSong({
          id: 0, // Placeholder ID
          title: data.title || "Unknown Title",
          artist: data.artist || "Unknown Artist",
          album: "Uploaded Track", // Not available from simple filename mapping usually
          similarity: Math.round(humanConfidence), // Using confidence as similarity/score
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
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Upload
        </Button>

        {/* Human Detection Success */}
        <div className="bg-success/10 border border-success/30 rounded-xl p-6 mb-8 animate-fade-in">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-6 h-6 text-success" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-success mb-2">
                Human Creativity Confirmed!
              </h2>
              <p className="text-muted-foreground text-sm">
                Our algorithms have analyzed the audio patterns and confirmed this track exhibits
                the nuances and imperfections characteristic of human-made music.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">
            Track Analysis
          </h1>
          <p className="text-muted-foreground">
            Detailed breakdown of your uploaded track
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
                Download Certificate
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
