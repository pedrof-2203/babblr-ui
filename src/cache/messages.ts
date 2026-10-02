import { ApolloCache } from "@apollo/client";
import { MessageFragmentFragment as Message } from "../gql/graphql";
import { getMessagesDocument } from "../hooks/useGetMessages";
import { PAGE_SIZE } from "../constants/page-size";

export const updateMessages = (cache: ApolloCache, message: Message) => {
  const queryOptions = {
    query: getMessagesDocument,
    variables: {
      chatId: message.chatId,
      skip: 0,
      limit: PAGE_SIZE,
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
