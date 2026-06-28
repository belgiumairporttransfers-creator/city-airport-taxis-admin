"use client";
import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Icon } from "@iconify/react";
import { Annoyed, Mic, Paperclip, SendHorizontal } from "lucide-react";
import { emitStopTyping, emitTyping } from "@/lib/socket/communication-socket";
import { cn } from "@/lib/utils";
import ChatEmojiPicker from "@/lib/chat/chat-emoji-picker";
import {
  AttachmentSendPreview,
  type PendingAttachment,
} from "@/lib/chat/attachment-send-preview";
import {
  useSendMessage,
  useUploadCommunicationAttachment,
} from "@/hooks/queries/use-communication";
import type { OptimisticSender } from "@/lib/chat/optimistic-message";
import {
  VoiceRecordPreview,
  VoiceRecordingBar,
  type PendingVoiceRecording,
} from "@/lib/chat/voice-record-preview";
import { useVoiceRecorder, type VoiceRecordingResult } from "@/hooks/use-voice-recorder";
import toast from "react-hot-toast";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type MessageFormValues = {
  message: string;
};

const composerIconButtonClass =
  "flex !h-9 !w-9 !min-h-9 !min-w-9 shrink-0 items-center justify-center rounded-full bg-default-200 p-0 hover:bg-default-300";
const composerIconClass = "h-[18px] w-[18px] text-primary";
const composerInputClassName =
  "box-border h-9 min-h-9 max-h-24 w-full min-w-0 resize-none rounded-md border border-default-300 bg-card px-3 py-[7px] text-sm leading-5 text-default-500 transition duration-300 placeholder:text-accent-foreground/50 focus:border-primary focus:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 no-scrollbar";

const getAudioDuration = (file: File) =>
  new Promise<number>((resolve) => {
    const audio = document.createElement("audio");
    const objectUrl = URL.createObjectURL(file);

    audio.preload = "metadata";
    audio.onloadedmetadata = () => {
      const duration = Number.isFinite(audio.duration) ? Math.round(audio.duration) : 0;
      URL.revokeObjectURL(objectUrl);
      resolve(duration);
    };
    audio.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(0);
    };
    audio.src = objectUrl;
  });

const MessageFooter = ({
  handleSendMessage,
  replay,
  replayData,
  onCancelReply,
  conversationId,
  replyToMessageId,
  onMessageSent,
  optimisticSender,
}: {
  handleSendMessage: (message: string) => void;
  replay: boolean;
  replayData: { contact?: { fullName?: string }; message?: string };
  onCancelReply: () => void;
  conversationId?: string | null;
  replyToMessageId?: string;
  onMessageSent?: () => void;
  optimisticSender?: OptimisticSender;
}) => {
  const isTypingRef = useRef(false);
  const stopTypingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingPreviewUrlRef = useRef<string | null>(null);
  const pendingVoiceUrlRef = useRef<string | null>(null);
  const [isSendingVoice, setIsSendingVoice] = useState(false);
  const [isStoppingRecording, setIsStoppingRecording] = useState(false);
  const [isSendingFile, setIsSendingFile] = useState(false);
  const [pendingAttachment, setPendingAttachment] = useState<PendingAttachment | null>(null);
  const [pendingVoice, setPendingVoice] = useState<PendingVoiceRecording | null>(null);

  const sendMessageMutation = useSendMessage();
  const uploadAttachmentMutation = useUploadCommunicationAttachment();
  const applyPendingVoice = (recording: VoiceRecordingResult) => {
    if (pendingVoiceUrlRef.current) {
      URL.revokeObjectURL(pendingVoiceUrlRef.current);
    }

    const previewUrl = URL.createObjectURL(recording.file);
    pendingVoiceUrlRef.current = previewUrl;
    setPendingVoice({
      file: recording.file,
      previewUrl,
      duration: recording.duration,
    });
  };

  const {
    isRecording,
    isRequestingPermission,
    duration,
    error: recorderError,
    startRecording,
    stopRecording,
    cancelRecording,
    clearError,
  } = useVoiceRecorder({
    onRecordingComplete: applyPendingVoice,
  });

  const form = useForm<MessageFormValues>({
    defaultValues: { message: "" },
  });

  const message = form.watch("message");

  const clearTyping = () => {
    if (!conversationId || !isTypingRef.current) return;
    emitStopTyping(conversationId);
    isTypingRef.current = false;
  };

  const clearPendingVoice = () => {
    if (pendingVoiceUrlRef.current) {
      URL.revokeObjectURL(pendingVoiceUrlRef.current);
      pendingVoiceUrlRef.current = null;
    }
    setPendingVoice(null);
  };

  const clearPendingAttachment = () => {
    if (pendingPreviewUrlRef.current) {
      URL.revokeObjectURL(pendingPreviewUrlRef.current);
      pendingPreviewUrlRef.current = null;
    }
    setPendingAttachment(null);
  };

  useEffect(() => {
    return () => {
      if (stopTypingTimeoutRef.current) {
        clearTimeout(stopTypingTimeoutRef.current);
      }
      clearTyping();
      cancelRecording();
      clearPendingVoice();
      if (pendingPreviewUrlRef.current) {
        URL.revokeObjectURL(pendingPreviewUrlRef.current);
      }
    };
  }, [conversationId]);

  useEffect(() => {
    form.reset({ message: "" });
    cancelRecording();
    clearPendingAttachment();
    clearPendingVoice();
  }, [conversationId, form]);

  useEffect(() => {
    if (!recorderError) return;
    toast.error(recorderError);
    clearError();
  }, [recorderError, clearError]);

  useEffect(() => {
    if (!conversationId) return;

    if (!message.trim()) {
      if (stopTypingTimeoutRef.current) {
        clearTimeout(stopTypingTimeoutRef.current);
      }
      clearTyping();
      return;
    }

    if (!isTypingRef.current) {
      emitTyping(conversationId);
      isTypingRef.current = true;
    }

    if (stopTypingTimeoutRef.current) {
      clearTimeout(stopTypingTimeoutRef.current);
    }

    stopTypingTimeoutRef.current = setTimeout(() => {
      clearTyping();
    }, 2500);
  }, [message, conversationId]);

  const handleSelectEmoji = (emoji: { native: string }) => {
    form.setValue("message", `${form.getValues("message")}${emoji.native}`, {
      shouldDirty: true,
    });
  };

  const onSubmit = (values: MessageFormValues) => {
    const trimmed = values.message.trim();
    if (!trimmed) return;

    clearTyping();
    handleSendMessage(trimmed);
    form.reset({ message: "" });
  };

  const sendVoiceFile = async (file: File, recordedDuration?: number) => {
    if (!conversationId || isSendingVoice) return;

    setIsSendingVoice(true);

    try {
      const audioDuration = recordedDuration ?? (await getAudioDuration(file));
      const attachment = await uploadAttachmentMutation.mutateAsync({
        conversationId,
        file,
        kind: "voice",
        duration: audioDuration || undefined,
      });

      if (!attachment?.id) {
        toast.error("Voice upload failed. Please try again.");
        return;
      }

      await sendMessageMutation.mutateAsync({
        conversationId,
        type: "voice",
        attachmentId: attachment.id,
        replyToMessageId,
        optimisticSender,
      });

      clearPendingVoice();
      onMessageSent?.();
    } finally {
      setIsSendingVoice(false);
    }
  };

  const handleStopRecording = () => {
    if (isStoppingRecording || isSendingVoice) return;

    setIsStoppingRecording(true);
    void (async () => {
      try {
        const recording = await stopRecording();
        if (!recording) return;
        applyPendingVoice(recording);
      } finally {
        setIsStoppingRecording(false);
      }
    })();
  };

  const handleMicClick = () => {
    if (isSendingVoice || isStoppingRecording || pendingVoice) return;
    void startRecording();
  };

  const handleSendPendingVoice = () => {
    if (!pendingVoice) return;
    void sendVoiceFile(pendingVoice.file, pendingVoice.duration);
  };

  const handleCancelRecording = () => {
    cancelRecording();
    clearPendingVoice();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !conversationId || isSendingFile || pendingAttachment) return;

    const isImage = file.type.startsWith("image/");
    const previewUrl = URL.createObjectURL(file);

    if (pendingPreviewUrlRef.current) {
      URL.revokeObjectURL(pendingPreviewUrlRef.current);
    }

    pendingPreviewUrlRef.current = previewUrl;
    setPendingAttachment({
      file,
      previewUrl,
      kind: isImage ? "image" : "document",
    });
  };

  const handleSendPendingAttachment = async () => {
    if (!pendingAttachment || !conversationId || isSendingFile) return;

    const { file, kind } = pendingAttachment;
    const messageType = kind === "image" ? "image" : "document";

    setIsSendingFile(true);

    try {
      const attachment = await uploadAttachmentMutation.mutateAsync({
        conversationId,
        file,
        kind,
      });

      if (!attachment?.id) {
        toast.error("File upload failed.");
        return;
      }

      await sendMessageMutation.mutateAsync({
        conversationId,
        type: messageType,
        attachmentId: attachment.id,
        replyToMessageId,
        optimisticSender,
      });

      clearPendingAttachment();
      onMessageSent?.();
    } finally {
      setIsSendingFile(false);
    }
  };

  const isComposerBusy =
    isRecording ||
    isStoppingRecording ||
    Boolean(pendingVoice) ||
    isSendingVoice ||
    isSendingFile ||
    isRequestingPermission;

  return (
    <>
      <AttachmentSendPreview
        pending={pendingAttachment}
        isSending={isSendingFile}
        onClose={clearPendingAttachment}
        onSend={() => {
          void handleSendPendingAttachment();
        }}
      />

      {replay && (
        <div className="flex w-full items-center justify-between gap-3 border-t border-border px-3 py-2.5 sm:px-6 sm:py-3">
          <div className="min-w-0 flex-1 rounded-sm border-l-4 border-primary bg-default-200 py-1.5 pl-3 pr-2">
            <div className="text-xs font-semibold text-primary">
              {replayData?.contact?.fullName}
            </div>
            <div className="truncate text-xs text-default-600">{replayData?.message}</div>
          </div>
          <span className="cursor-pointer shrink-0" onClick={onCancelReply}>
            <Icon
              icon="heroicons:x-mark-20-solid"
              className="text-2xl text-default-900"
            />
          </span>
        </div>
      )}

      {isRecording ? (
        <VoiceRecordingBar
          duration={duration}
          isStopping={isStoppingRecording}
          onCancel={handleCancelRecording}
          onStop={handleStopRecording}
        />
      ) : pendingVoice ? (
        <VoiceRecordPreview
          pending={pendingVoice}
          isSending={isSendingVoice}
          onDiscard={handleCancelRecording}
          onSend={handleSendPendingVoice}
        />
      ) : (
        <div className="w-full max-w-full px-2 py-2 sm:px-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid w-full min-w-0 grid-cols-[auto_auto_minmax(0,1fr)_auto_auto] items-center gap-1.5 sm:gap-2">
              <Button
                type="button"
                size="icon"
                className={composerIconButtonClass}
                onClick={() => fileInputRef.current?.click()}
                disabled={isComposerBusy}
              >
                {isSendingFile ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                ) : (
                  <Paperclip className={composerIconClass} />
                )}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*,.pdf,.doc,.docx,.txt"
                onChange={handleFileChange}
              />

              <Button
                type="button"
                size="icon"
                className={cn(
                  composerIconButtonClass,
                  isRecording && "bg-destructive/15 hover:bg-destructive/20"
                )}
                onClick={handleMicClick}
                disabled={isSendingVoice || isRequestingPermission}
              >
                {isSendingVoice || isRequestingPermission ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                ) : (
                  <Mic className={cn(composerIconClass, isRecording && "text-destructive")} />
                )}
              </Button>

              <textarea
                {...form.register("message")}
                rows={1}
                placeholder="Type your message..."
                disabled={isComposerBusy}
                className={composerInputClassName}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void form.handleSubmit(onSubmit)();
                  }
                }}
              />

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    size="icon"
                    className={composerIconButtonClass}
                    disabled={isComposerBusy}
                  >
                    <Annoyed className={composerIconClass} />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  side="top"
                  className="w-fit p-0 shadow-none border-none"
                >
                  <ChatEmojiPicker onEmojiSelect={handleSelectEmoji} />
                </PopoverContent>
              </Popover>

              <Button
                type="submit"
                size="icon"
                className={composerIconButtonClass}
                disabled={isComposerBusy}
              >
                <SendHorizontal className={cn(composerIconClass, "rtl:rotate-180")} />
              </Button>
            </div>
          </form>
        </Form>
      </div>
      )}
    </>
  );
};

export default MessageFooter;
