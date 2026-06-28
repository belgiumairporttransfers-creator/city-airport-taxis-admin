"use client";
import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Icon } from "@iconify/react";
import { Annoyed, Mic, Paperclip, SendHorizontal, Square, Trash2 } from "lucide-react";
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
import { formatVoiceDuration, useVoiceRecorder } from "@/hooks/use-voice-recorder";
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
}: {
  handleSendMessage: (message: string) => void;
  replay: boolean;
  replayData: { contact?: { fullName?: string }; message?: string };
  onCancelReply: () => void;
  conversationId?: string | null;
  replyToMessageId?: string;
  onMessageSent?: () => void;
}) => {
  const isTypingRef = useRef(false);
  const stopTypingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingPreviewUrlRef = useRef<string | null>(null);
  const [isSendingVoice, setIsSendingVoice] = useState(false);
  const [isSendingFile, setIsSendingFile] = useState(false);
  const [pendingAttachment, setPendingAttachment] = useState<PendingAttachment | null>(null);

  const sendMessageMutation = useSendMessage();
  const uploadAttachmentMutation = useUploadCommunicationAttachment();
  const {
    isRecording,
    isRequestingPermission,
    duration,
    error: recorderError,
    startRecording,
    stopRecording,
    cancelRecording,
    clearError,
  } = useVoiceRecorder();

  const form = useForm<MessageFormValues>({
    defaultValues: { message: "" },
  });

  const message = form.watch("message");

  const clearTyping = () => {
    if (!conversationId || !isTypingRef.current) return;
    emitStopTyping(conversationId);
    isTypingRef.current = false;
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
      if (pendingPreviewUrlRef.current) {
        URL.revokeObjectURL(pendingPreviewUrlRef.current);
      }
    };
  }, [conversationId]);

  useEffect(() => {
    form.reset({ message: "" });
    cancelRecording();
    clearPendingAttachment();
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
        throw new Error("Voice upload failed.");
      }

      await sendMessageMutation.mutateAsync({
        conversationId,
        type: "voice",
        attachmentId: attachment.id,
        replyToMessageId,
      });

      onMessageSent?.();
    } catch (error) {
      const messageText =
        error instanceof Error ? error.message : "Failed to send voice message.";
      toast.error(messageText);
    } finally {
      setIsSendingVoice(false);
    }
  };

  const handleMicClick = () => {
    if (isSendingVoice) return;

    if (isRecording) {
      void (async () => {
        const recording = await stopRecording();
        if (recording) {
          await sendVoiceFile(recording.file, recording.duration);
        }
      })();
      return;
    }

    void startRecording();
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
        throw new Error("File upload failed.");
      }

      await sendMessageMutation.mutateAsync({
        conversationId,
        type: messageType,
        attachmentId: attachment.id,
        replyToMessageId,
      });

      clearPendingAttachment();
      onMessageSent?.();
    } catch (error) {
      const messageText =
        error instanceof Error ? error.message : "Failed to send file.";
      toast.error(messageText);
    } finally {
      setIsSendingFile(false);
    }
  };

  const isComposerBusy =
    isRecording || isSendingVoice || isSendingFile || isRequestingPermission;

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
        <div className="flex w-full items-center gap-2 border-t border-border px-2 py-2 sm:gap-3 sm:px-4 sm:py-2.5">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-9 w-9 shrink-0 rounded-full text-default-500 hover:bg-destructive/10 hover:text-destructive"
            onClick={cancelRecording}
            disabled={isSendingVoice}
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
            <div className="flex min-w-0 flex-1 items-center gap-0.5 overflow-hidden px-1">
              {Array.from({ length: 24 }).map((_, index) => (
                <span
                  key={index}
                  className="w-0.5 shrink-0 rounded-full bg-primary/50"
                  style={{
                    height: `${10 + ((index * 7) % 14)}px`,
                    animation: "pulse 1s ease-in-out infinite",
                    animationDelay: `${(index % 6) * 120}ms`,
                  }}
                />
              ))}
            </div>
          </div>

          <Button
            type="button"
            size="icon"
            className="h-9 w-9 shrink-0 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={handleMicClick}
            disabled={isSendingVoice || isRequestingPermission}
            aria-label="Stop and send voice message"
          >
            {isSendingVoice || isRequestingPermission ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
            ) : (
              <Square className="h-3.5 w-3.5 fill-current" />
            )}
          </Button>
        </div>
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
