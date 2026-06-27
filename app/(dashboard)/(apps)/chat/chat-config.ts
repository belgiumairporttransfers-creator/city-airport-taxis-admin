import {
  contacts as contactsData,
  chats as initialChats,
  profileUser,
} from "./data";

let chatsState = structuredClone(initialChats);

const delay = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms));

export const getContacts = async () => {
  await delay();

  const contacts = contactsData.map((contact) => {
    const chat = chatsState.find((item) => item.userId === contact.id);
    const lastMessage = chat ? chat.chat[chat.chat.length - 1] : null;
    const lastMessageTime = lastMessage ? lastMessage.time : null;

    return {
      ...contact,
      chat: {
        id: chat ? chat.id : null,
        unseenMsgs: chat ? chat.unseenMsgs : null,
        lastMessage: lastMessage ? lastMessage.message : null,
        lastMessageTime: lastMessageTime
          ? new Date(lastMessageTime).toISOString()
          : null,
      },
    };
  });

  return { contacts };
};

export const getMessages = async (id: number | string) => {
  await delay();

  const contactId = Number(id);
  const contact = contactsData.find((item) => item.id === contactId);
  const chat = chatsState.find((item) => item.userId === contactId);

  if (!contact || !chat) {
    throw new Error("Chat not found");
  }

  return { contact, chat };
};

export const getProfile = async () => {
  await delay();
  return profileUser;
};

export const sendMessage = async (msg: {
  message: string;
  contact: { id: number };
  replayMetadata: boolean;
}) => {
  await delay();

  const chat = chatsState.find((item) => item.userId === msg.contact.id);
  if (!chat) {
    throw new Error("Chat not found");
  }

  chat.chat.push({
    message: msg.message,
    time: new Date().toISOString(),
    senderId: profileUser.id,
    replayMetadata: msg.replayMetadata,
  });

  return chat;
};

export const deleteMessage = async (obj: {
  selectedChatId: number;
  index: number;
}) => {
  await delay();

  const chat = chatsState.find((item) => item.userId === obj.selectedChatId);
  if (chat) {
    chat.chat.splice(obj.index, 1);
  }
};
