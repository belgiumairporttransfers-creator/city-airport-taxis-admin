"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatVoiceDuration } from "@/hooks/use-voice-recorder";

type VoiceMessagePlayerProps = {
  url: string;
  duration?: number;
  isOwnMessage?: boolean;
};

const VoiceMessagePlayer = ({ url, duration, isOwnMessage = false }: VoiceMessagePlayerProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [loadedDuration, setLoadedDuration] = useState(duration ?? 0);

  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setLoadedDuration(duration ?? 0);
  }, [url, duration]);

  const totalDuration = loadedDuration || duration || 0;
  const progress =
    totalDuration > 0 ? Math.min(100, (currentTime / totalDuration) * 100) : 0;

  const togglePlayback = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      return;
    }

    void audio.play();
  };

  return (
    <div className="flex min-w-[210px] items-center gap-2 py-0.5">
      <button
        type="button"
        onClick={togglePlayback}
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          isOwnMessage ? "bg-primary/15 text-primary" : "bg-default-300 text-default-700"
        )}
        aria-label={isPlaying ? "Pause voice message" : "Play voice message"}
      >
        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 pl-0.5" />}
      </button>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="h-1.5 overflow-hidden rounded-full bg-default-300/80">
          <div
            className={cn("h-full rounded-full transition-all", isOwnMessage ? "bg-primary" : "bg-default-600")}
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-[10px] leading-none text-default-500">
          {formatVoiceDuration(isPlaying ? currentTime : totalDuration)}
        </span>
      </div>

      <audio
        ref={audioRef}
        src={url}
        preload="metadata"
        onLoadedMetadata={(event) => {
          if (!Number.isFinite(event.currentTarget.duration)) return;
          setLoadedDuration(Math.round(event.currentTarget.duration));
        }}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(0);
          if (audioRef.current) {
            audioRef.current.currentTime = 0;
          }
        }}
      />
    </div>
  );
};

export default VoiceMessagePlayer;
