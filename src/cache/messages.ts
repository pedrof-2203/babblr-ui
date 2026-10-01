import { ApolloCache } from "@apollo/client";
import { MessageFragmentFragment as Message } from "../gql/graphql";
import { getMessagesDocument } from "../hooks/useGetMessages";

export const updateMessages = (cache: ApolloCache, message: Message) => {
  const queryOptions = {
    query: getMessagesDocument,
    variables: {
      chatId: message.chatId,
    },
  };

  const messages = cache.readQuery({ ...queryOptions });

  cache.writeQuery({
    ...queryOptions,
    data: {
      messages: (messages?.messages || []).concat(message),
    },
  });
};
