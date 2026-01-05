export interface Song {
  id: number;
  title: string;
  artist: string;
  album: string;
  year?: number;
  similarity: number;
  genre: string;
}

export const mockSimilarSongs: Song[] = [
  {
    id: 1,
    title: "Midnight Drive",
    artist: "The Velvet Underground",
    album: "After Dark Sessions",
    year: 1987,
    similarity: 94,
    genre: "Indie Rock",
  },
  {
    id: 2,
    title: "Summer Haze",
    artist: "Fleetwood Dreams",
    album: "California Gold",
    year: 1979,
    similarity: 87,
    genre: "Soft Rock",
  },
  {
    id: 3,
    title: "Electric Soul",
    artist: "Stevie Wonder Jr.",
    album: "Groove Machine",
    year: 1983,
    similarity: 82,
    genre: "R&B",
  },
  {
    id: 4,
    title: "Neon Nights",
    artist: "Synthesizer Dreams",
    album: "Retro Future",
    year: 1985,
    similarity: 76,
    genre: "Synth-pop",
  },
  {
    id: 5,
    title: "Autumn Leaves",
    artist: "Jazz Collective",
    album: "Seasons of Sound",
    year: 1991,
    similarity: 71,
    genre: "Jazz Fusion",
  },
];
