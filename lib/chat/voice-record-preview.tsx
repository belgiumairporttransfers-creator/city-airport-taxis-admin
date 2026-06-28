"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, Pause, Play, SendHorizontal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatVoiceDuration } from "@/hooks/use-voice-recorder";

export type PendingVoiceRecording = {
  file: File;
  previewUrl: string;
  duration: number;
};

type VoiceRecordPreviewProps = {
  pending: PendingVoiceRecording;
  isSending?: boolean;
  onDiscard: () => void;
  onSend: () => void;
};

const WaveformBars = ({
  active = false,
  progress = 0,
  barCount = 28,
}: {
  active?: boolean;
  progress?: number;
  barCount?: number;
}) => (
  <div className="flex min-w-0 flex-1 items-center gap-[2px] overflow-hidden px-1">
    {Array.from({ length: barCount }).map((_, index) => {
      const height = 6 + ((index * 5 + 7) % 16);
      const filled = active ? index / barCount <= progress : false;

      return (
        <span
          key={index}
          className={cn(
            "w-[3px] shrink-0 rounded-full transition-colors",
            filled ? "bg-primary" : "bg-primary/35"
          )}
          style={{
            height: `${height}px`,
            animation: active && !filled ? "pulse 1.1s ease-in-out infinite" : undefined,
            animationDelay: `${(index % 8) * 90}ms`,
          }}
        />
      );
    })}
  </div>
);

export function VoiceRecordingBar({
  duration,
  isStopping = false,
  onCancel,
  onStop,
}: {
  duration: number;
  isStopping?: boolean;
  onCancel: () => void;
  onStop: () => void;
}) {
  return (
    <div className="flex w-full items-center gap-2 border-t border-border px-2 py-2 sm:gap-3 sm:px-4 sm:py-2.5">
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className="h-9 w-9 shrink-0 rounded-full text-default-500 hover:bg-destructive/10 hover:text-destructive"
        onClick={onCancel}
        disabled={isStopping}
        aria-label="Cancel recording"
      >
        <Trash2 className="h-[18px] w-[18px]" />
      </Button>

      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive/70 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-destructive" />
        </span>
        <span className="shrink-0 text-sm font-medium tabular-nums text-default-900">
          {formatVoiceDuration(duration)}
        </span>
        <WaveformBars active />
      </div>

      <Button
        type="button"
        size="icon"
        className="h-9 w-9 shrink-0 rounded-full bg-destructive/90 text-white hover:bg-destructive"
        onClick={onStop}
        disabled={isStopping}
        aria-label="Stop recording"
      >
        {isStopping ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
        ) : (
          <span className="h-3.5 w-3.5 rounded-sm bg-white" />
        )}
      </Button>
    </div>
  );
}

export function VoiceRecordPreview({
  pending,
  isSending = false,
  onDiscard,
  onSend,
}: VoiceRecordPreviewProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
  }, [pending.previewUrl]);

  const totalDuration = pending.duration || 0;
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
    <div className="flex w-full items-center gap-2 border-t border-border px-2 py-2 sm:gap-3 sm:px-4 sm:py-2.5">
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className="h-9 w-9 shrink-0 rounded-full text-default-500 hover:bg-destructive/10 hover:text-destructive"
        onClick={onDiscard}
        disabled={isSending}
        aria-label="Discard voice message"
      >
        <Trash2 className="h-[18px] w-[18px]" />
      </Button>

      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={togglePlayback}
          disabled={isSending}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary hover:bg-primary/20 disabled:opacity-50"
          aria-label={isPlaying ? "Pause preview" : "Play preview"}
        >
          {isPlaying ? (
            <Pause className="h-[18px] w-[18px]" />
          ) : (
            <Play className="h-[18px] w-[18px] pl-0.5" />
          )}
        </button>

        <WaveformBars active={isPlaying} progress={progress} />

        <span className="shrink-0 text-sm font-medium tabular-nums text-default-700">
          {formatVoiceDuration(isPlaying ? Math.floor(currentTime) : totalDuration)}
        </span>
      </div>

      <Button
        type="button"
        size="icon"
        className="h-9 w-9 shrink-0 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
        onClick={onSend}
        disabled={isSending}
        aria-label="Send voice message"
      >
        {isSending ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
        ) : (
          <SendHorizontal className="h-[18px] w-[18px] rtl:rotate-180" />
        )}
      </Button>

      <audio
        ref={audioRef}
        src={pending.previewUrl}
        preload="metadata"
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
}

export function VoiceRecordingHint() {
  return (
    <div className="pointer-events-none absolute inset-x-0 -top-7 flex justify-center">
      <span className="inline-flex items-center gap-1 rounded-full bg-default-900/85 px-2.5 py-1 text-[11px] text-white">
        <Mic className="h-3 w-3" />
        Recording voice message
      </span>
    </div>
  );
}
