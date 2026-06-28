"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const MAX_RECORDING_SECONDS = 600;
const MIN_RECORDING_SECONDS = 1;

export type VoiceRecordingResult = {
  file: File;
  duration: number;
};

const getSupportedMimeType = () => {
  if (typeof MediaRecorder === "undefined") return "";

  const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg", "audio/mp4"];

  return candidates.find((type) => MediaRecorder.isTypeSupported(type)) ?? "";
};

const normalizeMimeType = (mimeType: string) =>
  mimeType.split(";")[0].trim().toLowerCase();

const getFileExtension = (mimeType: string) => {
  const normalized = normalizeMimeType(mimeType);

  if (normalized.includes("ogg")) return "ogg";
  if (normalized.includes("mp4")) return "m4a";
  return "webm";
};

export const formatVoiceDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const isPermissionError = (error: unknown) =>
  error instanceof DOMException &&
  (error.name === "NotAllowedError" || error.name === "PermissionDeniedError");

const isDeviceNotFoundError = (error: unknown) => {
  if (
    error instanceof DOMException &&
    (error.name === "NotFoundError" || error.name === "DevicesNotFoundError")
  ) {
    return true;
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return message.includes("requested device not found") || message.includes("device not found");
  }

  return false;
};

const getMicrophoneErrorMessage = (error: unknown) => {
  if (isPermissionError(error)) {
    return "Allow microphone access when your browser asks, or enable it in site settings.";
  }

  if (isDeviceNotFoundError(error)) {
    return "No microphone was detected. Connect a microphone, select it in system settings, then try again.";
  }

  if (error instanceof DOMException) {
    if (error.name === "NotReadableError" || error.name === "TrackStartError") {
      return "Your microphone is in use by another application.";
    }
    if (error.name === "SecurityError") {
      return "Voice recording requires HTTPS or localhost.";
    }
    if (error.name === "OverconstrainedError") {
      return "Your microphone does not support the required audio settings. Try another input device.";
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return "Could not access the microphone. Please try again.";
};

const requestMicrophoneStream = async (): Promise<MediaStream> => {
  if (typeof window === "undefined") {
    throw new Error("Voice recording is not available.");
  }

  if (!window.isSecureContext) {
    throw new Error("Voice recording requires HTTPS or localhost.");
  }

  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error("Voice recording is not supported in this browser.");
  }

  if (typeof MediaRecorder === "undefined") {
    throw new Error("Voice recording is not supported in this browser.");
  }

  const attempts: MediaStreamConstraints[] = [
    { audio: true },
    {
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
      },
    },
  ];

  let lastError: unknown;

  for (const constraints of attempts) {
    try {
      return await navigator.mediaDevices.getUserMedia(constraints);
    } catch (error) {
      lastError = error;
      if (isPermissionError(error)) {
        throw error;
      }
    }
  }

  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const audioInputs = devices.filter(
      (device) => device.kind === "audioinput" && device.deviceId
    );

    for (const device of audioInputs) {
      try {
        return await navigator.mediaDevices.getUserMedia({
          audio: { deviceId: { ideal: device.deviceId } },
        });
      } catch (error) {
        lastError = error;
        if (isPermissionError(error)) {
          throw error;
        }
      }
    }
  } catch (error) {
    lastError = error;
    if (isPermissionError(error)) {
      throw error;
    }
  }

  throw lastError ?? new Error("Could not access the microphone.");
};

const createMediaRecorder = (stream: MediaStream) => {
  const mimeType = getSupportedMimeType();

  if (mimeType) {
    try {
      return new MediaRecorder(stream, { mimeType });
    } catch {
      // Fall back to browser default mime type.
    }
  }

  return new MediaRecorder(stream);
};

export type UseVoiceRecorderOptions = {
  onRecordingComplete?: (result: VoiceRecordingResult) => void;
};

export const useVoiceRecorder = (options: UseVoiceRecorderOptions = {}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mimeTypeRef = useRef("audio/webm");
  const durationRef = useRef(0);
  const startedAtRef = useRef<number | null>(null);
  const stopRecordingRef = useRef<(() => Promise<VoiceRecordingResult | null>) | null>(null);
  const onRecordingCompleteRef = useRef(options.onRecordingComplete);

  useEffect(() => {
    onRecordingCompleteRef.current = options.onRecordingComplete;
  }, [options.onRecordingComplete]);

  const cleanupStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    mediaRecorderRef.current = null;
    chunksRef.current = [];
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      cleanupStream();
    };
  }, [cleanupStream]);

  const startRecording = useCallback(async () => {
    if (isRecording || isRequestingPermission) return;

    setIsRequestingPermission(true);

    try {
      const stream = await requestMicrophoneStream();

      setError(null);
      streamRef.current = stream;

      const recorder = createMediaRecorder(stream);
      const rawMimeType = recorder.mimeType || getSupportedMimeType() || "audio/webm";
      mimeTypeRef.current = normalizeMimeType(rawMimeType);
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.start(250);
      mediaRecorderRef.current = recorder;
      startedAtRef.current = performance.now();
      durationRef.current = 0;
      setDuration(0);
      setIsRecording(true);

      timerRef.current = setInterval(() => {
        setDuration((current) => {
          const next = current + 1;
          durationRef.current = next;

          if (next >= MAX_RECORDING_SECONDS) {
            void stopRecordingRef.current?.().then((result) => {
              if (result) {
                onRecordingCompleteRef.current?.(result);
              }
            });
          }

          return next;
        });
      }, 1000);
    } catch (caughtError) {
      cleanupStream();
      setError(getMicrophoneErrorMessage(caughtError));
    } finally {
      setIsRequestingPermission(false);
    }
  }, [cleanupStream, isRecording, isRequestingPermission]);

  const stopRecording = useCallback(async (): Promise<VoiceRecordingResult | null> => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === "inactive") {
      cleanupStream();
      setIsRecording(false);
      durationRef.current = 0;
      setDuration(0);
      startedAtRef.current = null;
      return null;
    }

    const elapsedSeconds = startedAtRef.current
      ? Math.max(1, Math.round((performance.now() - startedAtRef.current) / 1000))
      : Math.max(durationRef.current, MIN_RECORDING_SECONDS);

    return new Promise((resolve) => {
      recorder.onstop = () => {
        const mimeType = mimeTypeRef.current || "audio/webm";
        const blob = new Blob(chunksRef.current, { type: mimeType });
        cleanupStream();
        setIsRecording(false);
        durationRef.current = 0;
        setDuration(0);
        startedAtRef.current = null;

        if (elapsedSeconds < MIN_RECORDING_SECONDS || blob.size === 0) {
          setError("Hold to record at least 1 second of audio.");
          resolve(null);
          return;
        }

        const extension = getFileExtension(mimeType);
        resolve({
          file: new File([blob], `voice-${Date.now()}.${extension}`, {
            type: mimeType,
          }),
          duration: elapsedSeconds,
        });
      };

      recorder.stop();
    });
  }, [cleanupStream]);

  stopRecordingRef.current = stopRecording;

  const cancelRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.onstop = () => {
        cleanupStream();
      };
      recorder.stop();
    } else {
      cleanupStream();
    }

    setIsRecording(false);
    durationRef.current = 0;
    setDuration(0);
    startedAtRef.current = null;
    setIsRequestingPermission(false);
  }, [cleanupStream]);

  return {
    isRecording,
    isRequestingPermission,
    duration,
    error,
    startRecording,
    stopRecording,
    cancelRecording,
    clearError: () => setError(null),
  };
};
