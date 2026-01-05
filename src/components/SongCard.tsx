import { Play, Music2 } from "lucide-react";
import VinylRecord from "./VinylRecord";
import { cn } from "@/lib/utils";

interface Song {
  id: number;
  title: string;
  artist: string;
  album: string;
  similarity: number;
  genre: string;
}

interface SongCardProps {
  song: Song;
  rank?: number;
  delay?: number;
  detailed?: boolean; // Add this new prop
}

const SongCard = ({ song, rank, delay = 0, detailed = false }: SongCardProps) => {
  return (
    <div
      className={cn(
        "group relative bg-card rounded-xl p-5 shadow-card hover:shadow-vinyl transition-all duration-300 hover:-translate-y-1 opacity-0 animate-slide-up"
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Rank badge - only show if rank is provided */}
      {rank && (
        <div className="absolute -top-3 -left-3 w-10 h-10 rounded-full bg-gradient-warm text-primary-foreground font-display font-bold text-lg flex items-center justify-center shadow-lg">
          {rank}
        </div>
      )}

      <div className="flex gap-5">
        {/* Mini vinyl */}
        <div className="relative flex-shrink-0">
          <VinylRecord size="sm" className="group-hover:animate-spin-slow" />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Play className="w-6 h-6 text-primary-foreground fill-current" />
          </div>
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

        {/* Similarity score */}
        <div className="flex flex-col items-end justify-between">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Music2 className="w-3 h-3" />
            <span>{song.genre}</span>
          </div>
          <div className="text-right">
            <p className="text-2xl font-display font-bold text-gradient">
              {song.similarity.toFixed(3)}%
            </p>
            <p className="text-xs text-muted-foreground">match</p>
          </div>
        </div>
      </div>

      {/* Similarity bar */}
      <div className="mt-4 h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-warm rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${song.similarity}%` }}
        />
      </div>
    </div>
  );
};

export default SongCard;
