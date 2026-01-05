import SongCard from "./SongCard";
import { Song } from "@/data/mockSongs";

interface ResultsListProps {
  songs: Song[];
}

const ResultsList = ({ songs }: ResultsListProps) => {
  if (songs.length === 0) return null;

  return (
    <div className="w-full max-w-2xl mx-auto mt-12">
      <div className="text-center mb-8">
        <h2 className="font-display text-3xl font-bold text-foreground mb-2">
          Similar Tracks Found
        </h2>
        <p className="text-muted-foreground">
          Based on audio analysis and musical characteristics
        </p>
      </div>

      <div className="space-y-5">
        {songs.map((song, index) => (
          <SongCard
            key={song.id}
            song={song}
            rank={index + 1}
            delay={index * 100}
          />
        ))}
      </div>
    </div>
  );
};

export default ResultsList;
