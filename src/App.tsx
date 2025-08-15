import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { AudioPlayer } from './components/AudioPlayer';
import { RefreshCw, Sun, Music } from 'lucide-react';

interface VoteCount {
  track_number: number;
  count: number;
}

function App() {
  const [currentlyPlaying, setCurrentlyPlaying] = useState<number | null>(null);
  const [voteCounts, setVoteCounts] = useState<Record<number, number>>({
    1: 0,
    2: 0,
    3: 0
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const tracks = [
    { number: 1, title: 'Summer Track 1', src: '/audio/track1.mp3' },
    { number: 2, title: 'Summer Track 2', src: '/audio/track2.mp3' },
    { number: 3, title: 'Summer Track 3', src: '/audio/track3.mp3' }
  ];

  const fetchVotes = async () => {
    setIsRefreshing(true);
    try {
      const { data, error } = await supabase
        .from('music_votes')
        .select('track_number');

      if (error) {
        console.error('Error fetching votes:', error);
        return;
      }

      // Count votes for each track
      const counts = { 1: 0, 2: 0, 3: 0 };
      data?.forEach(vote => {
        if (counts[vote.track_number as keyof typeof counts] !== undefined) {
          counts[vote.track_number as keyof typeof counts]++;
        }
      });

      setVoteCounts(counts);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error fetching votes:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleVote = async (trackNumber: number) => {
    try {
      const { error } = await supabase
        .from('music_votes')
        .insert([{ track_number: trackNumber }]);

      if (error) {
        console.error('Error voting:', error);
        alert('There was an error recording your vote. Please try again.');
        return;
      }

      // Immediately update local count for instant feedback
      setVoteCounts(prev => ({
        ...prev,
        [trackNumber]: prev[trackNumber] + 1
      }));
      
      // Then fetch fresh data
      setTimeout(fetchVotes, 500);
    } catch (error) {
      console.error('Error voting:', error);
      alert('There was an error recording your vote. Please try again.');
    }
  };

  const handlePlayToggle = (trackNumber: number) => {
    if (currentlyPlaying === trackNumber) {
      setCurrentlyPlaying(null);
    } else {
      setCurrentlyPlaying(trackNumber);
    }
  };

  useEffect(() => {
    fetchVotes();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchVotes, 30000);
    return () => clearInterval(interval);
  }, []);

  const totalVotes = Object.values(voteCounts).reduce((sum, count) => sum + count, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-yellow-100 to-amber-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center space-x-3">
            <Sun className="text-white" size={40} />
            <h1 className="text-4xl font-bold text-white text-center">
              Summer Music Voting
            </h1>
            <Music className="text-white" size={40} />
          </div>
          <p className="text-center text-yellow-100 text-lg mt-2 font-medium">
            Listen to our summer tracks and vote for your favorites!
          </p>
        </div>
      </div>

      {/* Vote Summary */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg border-2 border-yellow-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0">
            <div className="text-center lg:text-left">
              <h2 className="text-2xl font-bold text-yellow-900 mb-2">Vote Summary</h2>
              <p className="text-yellow-700 text-lg">
                Total votes cast: <span className="font-bold text-2xl text-yellow-800">{totalVotes}</span>
              </p>
              <p className="text-yellow-600 text-sm mt-1">
                Last updated: {lastRefresh.toLocaleTimeString()}
              </p>
            </div>
            <button
              onClick={fetchVotes}
              disabled={isRefreshing}
              className="flex items-center space-x-2 bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-300 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:transform-none text-lg"
            >
              <RefreshCw className={`${isRefreshing ? 'animate-spin' : ''}`} size={20} />
              <span>{isRefreshing ? 'Refreshing...' : 'Refresh Votes'}</span>
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6 mb-8">
          <h3 className="text-xl font-bold text-amber-900 mb-3 text-center">How to Vote</h3>
          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div className="flex flex-col items-center space-y-2">
              <div className="w-12 h-12 bg-amber-200 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-amber-800">1</span>
              </div>
              <p className="text-amber-800 font-medium">Listen to each track by clicking the play button</p>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <div className="w-12 h-12 bg-amber-200 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-amber-800">2</span>
              </div>
              <p className="text-amber-800 font-medium">Click "Vote for this track!" for your favorites</p>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <div className="w-12 h-12 bg-amber-200 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-amber-800">3</span>
              </div>
              <p className="text-amber-800 font-medium">Vote as many times as you like!</p>
            </div>
          </div>
        </div>

        {/* Audio Players */}
        <div className="grid lg:grid-cols-3 gap-8">
          {tracks.map((track) => (
            <AudioPlayer
              key={track.number}
              src={track.src}
              trackNumber={track.number}
              title={track.title}
              isPlaying={currentlyPlaying === track.number}
              onPlayToggle={handlePlayToggle}
              onVote={handleVote}
              votes={voteCounts[track.number]}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 py-8">
          <p className="text-yellow-700 text-lg font-medium">
            Enjoy the music and happy voting! 🎵☀️
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;