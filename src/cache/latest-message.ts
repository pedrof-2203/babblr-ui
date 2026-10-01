import { ApolloCache } from "@apollo/client";
import { MessageFragmentFragment as Message } from "../gql/graphql";
import { getChatsDocument } from "../hooks/useGetChats";

export const updateLatestMessage = (cache: ApolloCache, message: Message) => {
  const chats = [
    ...(cache.readQuery({ query: getChatsDocument })?.chats || []),
  ];
  const cachedChatIdx = chats.findIndex((chat) => chat._id === message.chatId);
  if (cachedChatIdx === -1) {
    return;
  }
  const cachedChat = chats[cachedChatIdx];
  const cachedChatCopy = { ...cachedChat };
  cachedChatCopy.latestMessage = message;
  chats[cachedChatIdx] = cachedChatCopy;
  cache.writeQuery({
    query: getChatsDocument,
    data: {
      chats,
    },
  });
};
