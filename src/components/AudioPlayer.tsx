import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface AudioPlayerProps {
  src: string;
  trackNumber: number;
  isPlaying: boolean;
  onPlayToggle: (trackNumber: number) => void;
  onVote: (trackNumber: number) => void;
  votes: number;
  title: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  src,
  trackNumber,
  isPlaying,
  onPlayToggle,
  onVote,
  votes,
  title
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => {
      setDuration(audio.duration);
      setIsLoaded(true);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', () => onPlayToggle(trackNumber));

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', () => onPlayToggle(trackNumber));
    };
  }, [trackNumber, onPlayToggle]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch(console.error);
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const newTime = (parseFloat(e.target.value) / 100) * duration;
    audio.currentTime = newTime;
  };

  const formatTime = (time: number) => {
    if (!isFinite(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="bg-white rounded-2xl shadow-lg border-2 border-yellow-200 p-6 hover:shadow-xl transition-all duration-300 hover:border-yellow-300">
      <audio ref={audioRef} preload="metadata">
        <source src={src} type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
      
      <div className="text-center mb-4">
        <h3 className="text-2xl font-bold text-yellow-900 mb-2">{title}</h3>
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={() => onPlayToggle(trackNumber)}
            className="w-16 h-16 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            disabled={!isLoaded}
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
          </button>
        </div>
      </div>

      {isLoaded && (
        <div className="mb-4">
          <div className="flex justify-between text-sm text-yellow-800 mb-2">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
          <div className="relative">
            <div className="w-full h-3 bg-yellow-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={handleSeek}
              className="absolute top-0 left-0 w-full h-3 opacity-0 cursor-pointer"
            />
          </div>
        </div>
      )}

      <div className="text-center">
        <div className="mb-3">
          <span className="inline-flex items-center px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-lg font-semibold">
            {votes} vote{votes !== 1 ? 's' : ''}
          </span>
        </div>
        <button
          onClick={() => onVote(trackNumber)}
          className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white text-xl font-bold py-3 px-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
        >
          Vote for this track! 🎵
        </button>
      </div>
    </div>
  );
};