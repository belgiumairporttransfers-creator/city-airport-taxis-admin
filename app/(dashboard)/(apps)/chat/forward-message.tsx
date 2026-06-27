"use client";

import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Contact } from "@/lib/chat/types";
import { getAvatarSrc } from "@/lib/chat/types";

const ForwardMessage = ({
  open,
  setIsOpen,
  contacts,
  messageContent,
  currentConversationId,
  onForward,
  isSending,
}: {
  open: boolean;
  setIsOpen: (open: boolean) => void;
  contacts: Contact[];
  messageContent: string | null;
  currentConversationId?: string | null;
  onForward: (contact: Contact) => Promise<void>;
  isSending?: boolean;
}) => {
  const [search, setSearch] = useState("");
  const [sendingContactId, setSendingContactId] = useState<string | null>(null);

  const filteredContacts = useMemo(() => {
    const term = search.trim().toLowerCase();
    return contacts.filter((contact) => {
      if (contact.conversationId && contact.conversationId === currentConversationId) {
        return false;
      }
      if (!term) return true;
      return contact.fullName.toLowerCase().includes(term);
    });
  }, [contacts, currentConversationId, search]);

  const handleOpenChange = (nextOpen: boolean) => {
    setIsOpen(nextOpen);
    if (!nextOpen) {
      setSearch("");
      setSendingContactId(null);
    }
  };

  const handleSend = async (contact: Contact) => {
    setSendingContactId(contact.id);
    try {
      await onForward(contact);
      handleOpenChange(false);
    } finally {
      setSendingContactId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent size="xl" className="px-0 pb-0">
        <DialogHeader className="relative border-b border-border py-3">
          <DialogTitle className="text-center">Forward message</DialogTitle>
        </DialogHeader>
        <DialogDescription className="hidden" />

        {messageContent ? (
          <div className="mx-4 mt-3 truncate rounded-md bg-default-100 px-3 py-2 text-sm text-default-600">
            {messageContent}
          </div>
        ) : null}

        <div className="px-2">
          <div className="px-4">
            <div className="relative my-4">
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search for people"
                className="h-10 w-full rounded-full border border-border bg-default-50 pl-9 pr-3 text-sm outline-none focus:border-primary"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2">
                <Icon icon="majesticons:search-line" className="text-lg text-default-400" />
              </span>
            </div>
          </div>

          <div className="max-h-[min(420px,calc(100vh-320px))]">
            <ScrollArea className="h-full px-2">
              {filteredContacts.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-default-500">
                  No contacts found
                </p>
              ) : (
                filteredContacts.map((contact) => (
                  <div
                    key={contact.id}
                    className={cn(
                      "flex cursor-default items-center gap-4 rounded-sm border-l-2 border-transparent px-2.5 py-2.5 hover:bg-default-100"
                    )}
                  >
                    <div className="flex flex-1 items-center gap-3">
                      <Avatar>
                        <AvatarImage src={getAvatarSrc(contact.avatar)} alt={contact.fullName} />
                        <AvatarFallback>{contact.fullName.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-default-900">
                        {contact.fullName}
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 rounded-md px-2.5 text-xs"
                      disabled={Boolean(isSending) || sendingContactId === contact.id}
                      isLoading={sendingContactId === contact.id}
                      loadingText="Sending..."
                      onClick={() => void handleSend(contact)}
                    >
                      Send
                    </Button>
                  </div>
                ))
              )}
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ForwardMessage;
