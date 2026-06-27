import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { DialogClose } from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Icon } from "@iconify/react";
import { Pin } from "lucide-react";
import type { PinnedMessage } from "@/lib/chat/types";

const PinnedMessages = ({
  pinnedMessages,
  handleUnpinMessage,
}: {
  pinnedMessages: PinnedMessage[];
  handleUnpinMessage: (message: PinnedMessage) => void;
}) => {
  if (pinnedMessages.length === 0) return null;

  const latestPinned = pinnedMessages[pinnedMessages.length - 1];

  return (
    <div className="flex-none border-b border-border bg-default-100/90 px-4 py-2.5">
      <div className="flex items-center gap-3">
        <Pin className="h-3.5 w-3.5 shrink-0 rotate-45 fill-primary text-primary" />

        {pinnedMessages.length === 1 ? (
          <p className="min-w-0 flex-1 truncate text-sm text-default-700">
            {latestPinned.note}
          </p>
        ) : (
          <Dialog>
            <DialogTrigger asChild>
              <button
                type="button"
                className="min-w-0 flex-1 truncate text-left text-sm text-default-700 hover:text-default-900"
              >
                {latestPinned.note}
                <span className="ml-1 text-xs text-primary">
                  +{pinnedMessages.length - 1} more
                </span>
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="mt-2 text-center">Pinned messages</DialogTitle>
              </DialogHeader>
              <DialogDescription className="max-h-[400px]">
                <ScrollArea className="h-full max-h-[360px]">
                  {pinnedMessages.map((pinnedMessage, index) => (
                    <div
                      key={`${pinnedMessage.messageId ?? index}-${index}`}
                      className="flex items-center gap-3 border-b border-default-100 py-4 last:border-none"
                    >
                      <Pin className="h-3.5 w-3.5 shrink-0 rotate-45 fill-primary text-primary" />
                      <span className="flex-1 text-sm text-default-700">
                        {pinnedMessage.note}
                      </span>
                      <Badge
                        variant="outline"
                        className="h-7 shrink-0 cursor-pointer self-end px-4"
                        onClick={() => handleUnpinMessage(pinnedMessage)}
                      >
                        Unpin
                      </Badge>
                    </div>
                  ))}
                </ScrollArea>
              </DialogDescription>
              <DialogFooter className="sm:justify-center">
                <DialogClose asChild>
                  <Button className="rounded-full">Close</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        <button
          type="button"
          aria-label="Unpin message"
          onClick={() => handleUnpinMessage(latestPinned)}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-default-400 transition-colors hover:bg-default-200 hover:text-default-700"
        >
          <Icon icon="heroicons:x-mark-20-solid" className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default PinnedMessages;
