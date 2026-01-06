import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Play, Pause, Music2, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import VinylRecord from "@/components/VinylRecord";
import { Song } from "@/components/SongCard";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const AIResults = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const filename = location.state?.filename;
  
  const [playingId, setPlayingId] = useState<number | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!filename) {
      console.warn("No filename provided for AIResults");
      setIsLoading(false);
      return;
    }

    const fetchTopKSongs = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/topkrealsongs?k=5&filename=${encodeURIComponent(filename)}`);
        if (!response.ok) {
          throw new Error("Failed to fetch songs");
        }
        const data = await response.json();
        setSongs(data);
      } catch (error) {
        console.error("Error fetching songs:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load similar songs. Please try again.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopKSongs();
  }, [filename, toast]);

  const handlePreview = (songId: number) => {
    if (playingId === songId) {
      setPlayingId(null);
    } else {
      setPlayingId(songId);
      // Auto-stop after 1 minute (simulated)
      setTimeout(() => setPlayingId(null), 60000);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 relative">
      {/* Floating vinyl decorations */}
      <div className="absolute top-10 left-10 opacity-20 hidden lg:block">
        <VinylRecord size="lg" isPlaying className="animate-float" />
      </div>
      <div className="absolute top-32 right-10 opacity-15 hidden lg:block">
        <VinylRecord size="md" isPlaying className="animate-float delay-500" />
      </div>
      <div className="absolute bottom-20 left-20 opacity-10 hidden lg:block">
        <VinylRecord size="sm" isPlaying className="animate-float delay-300" />
      </div>

      {/* Header */}
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

        {/* Header Section */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-destructive/10 mb-6 relative group">
            <div className="absolute inset-0 bg-destructive/20 rounded-full animate-ping opacity-20" />
            <AlertTriangle className="w-10 h-10 text-destructive relative z-10" />
          </div>
          <h1 className="font-display text-4xl font-bold text-foreground mb-4">
            AI-Generated Content Detected
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Our analysis indicates with high confidence that this track was generated using artificial intelligence.
          </p>
        </div>

        <div className="text-center mt-12 mb-2">
          <h2 className="font-display text-xl font-bold text-foreground">
            Here are Top 5 most similar Human-Made tracks from the GTZAN dataset.
          </h2>
        </div>
      </header>

      {/* Song List */}
      <main className="max-w-2xl mx-auto">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            {songs.map((song, index) => (
              <SongPreviewCard
                key={song.id}
                song={song}
                rank={index + 1}
                isPlaying={playingId === song.id}
                onPreview={() => handlePreview(song.id)}
                delay={index * 100}
              />
            ))}
            {songs.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                No songs found.
              </div>
            )}
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
        </div>
      </footer>
    </div>
  );
};

interface SongPreviewCardProps {
  song: Song;
  rank: number;
  isPlaying: boolean;
  onPreview: () => void;
  delay?: number;
}

const SongPreviewCard = ({ song, rank, isPlaying, onPreview, delay = 0 }: SongPreviewCardProps) => {
  return (
    <div
      className={cn(
        "group relative bg-card rounded-xl p-5 shadow-card hover:shadow-vinyl transition-all duration-300 hover:-translate-y-1 opacity-0 animate-slide-up",
        isPlaying && "ring-2 ring-primary shadow-glow"
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Rank badge */}
      <div className="absolute -top-3 -left-3 w-10 h-10 rounded-full bg-gradient-warm text-primary-foreground font-display font-bold text-lg flex items-center justify-center shadow-lg">
        {rank}
      </div>

      <div className="flex gap-5">
        {/* Mini vinyl */}
        <div className="flex-shrink-0">
          <VinylRecord size="sm" className={cn(isPlaying && "animate-spin-slow")} />
        </div>

        {/* Song info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-lg font-semibold text-foreground truncate">
            {song.title}
          </h3>
          <p className="text-muted-foreground text-sm truncate">{song.artist}</p>
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            <span>{song.album}</span>
          </div>
        </div>

        {/* Genre and preview button */}
        <div className="flex flex-col items-end justify-between">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Music2 className="w-3 h-3" />
            <span>{song.genre}</span>
          </div>
          
          <Button
            size="sm"
            variant={isPlaying ? "default" : "outline"}
            onClick={onPreview}
            className={cn(
              "text-xs",
              isPlaying && "bg-gradient-warm border-0"
            )}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3 h-3 mr-1" />
                Playing
              </>
            ) : (
              <>
                <Play className="w-3 h-3 mr-1" />
                1 min preview
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Playing indicator bar */}
      {isPlaying && (
        <div className="mt-4 h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-warm rounded-full animate-pulse"
            style={{ width: "100%" }}
          />
        </div>
      )}

      {/* Similarity score */}
      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
        <span>Similarity match</span>
        <span className="font-display font-bold text-gradient text-lg">{song.similarity.toFixed(3)}%</span>
      </div>
    </div>
  );
};

export default AIResults;
