"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatVoiceDuration } from "@/hooks/use-voice-recorder";

type VoiceMessagePlayerProps = {
  url: string;
  duration?: number;
  isOwnMessage?: boolean;
};

const VoiceWaveform = ({
  progress,
  isOwnMessage,
  barCount = 32,
}: {
  progress: number;
  isOwnMessage: boolean;
  barCount?: number;
}) => (
  <div className="flex min-w-0 flex-1 items-center gap-[2px] overflow-hidden">
    {Array.from({ length: barCount }).map((_, index) => {
      const height = 5 + ((index * 4 + 5) % 14);
      const filled = index / barCount <= progress;

      return (
        <span
          key={index}
          className={cn(
            "w-[2px] shrink-0 rounded-full transition-colors duration-150",
            filled
              ? isOwnMessage
                ? "bg-primary"
                : "bg-default-600"
              : isOwnMessage
                ? "bg-primary/30"
                : "bg-default-400/70"
          )}
          style={{ height: `${height}px` }}
        />
      );
    })}
  </div>
);

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
  const progress = totalDuration > 0 ? Math.min(1, currentTime / totalDuration) : 0;

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
    <div className="flex min-w-[220px] max-w-full items-center gap-2.5 py-0.5 sm:min-w-[240px]">
      <button
        type="button"
        onClick={togglePlayback}
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full shadow-sm",
          isOwnMessage
            ? "bg-primary text-primary-foreground"
            : "bg-default-300 text-default-700"
        )}
        aria-label={isPlaying ? "Pause voice message" : "Play voice message"}
      >
        {isPlaying ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4 pl-0.5" />
        )}
      </button>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <VoiceWaveform progress={progress} isOwnMessage={isOwnMessage} />
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1 text-[10px] leading-none text-default-500">
            <Mic className="h-3 w-3" />
            Voice
          </span>
          <span className="text-[11px] font-medium tabular-nums leading-none text-default-600">
            {formatVoiceDuration(isPlaying ? Math.floor(currentTime) : totalDuration)}
          </span>
        </div>
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
