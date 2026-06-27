"use client";
import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Icon } from "@iconify/react";
import { Annoyed, Mic, Paperclip, SendHorizontal, Square, X } from "lucide-react";
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
  "shrink-0 rounded-full bg-default-200 hover:bg-default-300 h-9 w-9 p-0";
const composerIconClass = "h-5 w-5 text-primary";

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
        const file = await stopRecording();
        if (file) {
          await sendVoiceFile(file, duration);
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
        <div className="flex w-full items-center justify-between gap-4 border-t border-border px-6 py-3">
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
        <div className="flex items-center justify-between gap-3 border-t border-border px-3 py-2 lg:px-4">
          <div className="flex min-w-0 items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive/70 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-destructive" />
            </span>
            <span className="text-sm font-medium text-default-900">Recording</span>
            <span className="text-sm text-default-500">{formatVoiceDuration(duration)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-8 w-8 rounded-full"
              onClick={cancelRecording}
              disabled={isSendingVoice}
            >
              <X className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="icon"
              className="h-8 w-8 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={handleMicClick}
              disabled={isSendingVoice || isRequestingPermission}
            >
              {isSendingVoice || isRequestingPermission ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              ) : (
                <Square className="h-3.5 w-3.5 fill-current" />
              )}
            </Button>
          </div>
        </div>
      ) : null}

      <div className="w-full px-2 lg:px-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="flex items-center gap-1.5">
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

              <div className="min-w-0 flex-1">
                <Input
                  name="message"
                  type="textarea"
                  placeholder="Type your message..."
                  rows={1}
                  disabled={isComposerBusy}
                  className="mb-0 [&_[data-slot=form-item]]:mb-0"
                  inputClassName="!min-h-9 !max-h-24 !h-9 resize-none !py-0 !pt-0 !pb-0 !px-3 text-sm leading-9 2xl:!min-h-9 2xl:!text-sm 2xl:!leading-9 no-scrollbar"
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      void form.handleSubmit(onSubmit)();
                    }
                  }}
                />
              </div>

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
                className={composerIconButtonClass}
                disabled={isComposerBusy}
              >
                <SendHorizontal className={cn(composerIconClass, "rtl:rotate-180")} />
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </>
  );
};

export default MessageFooter;
