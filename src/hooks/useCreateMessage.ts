import { useMutation } from "@apollo/client/react";
import { graphql } from "../gql";
import { getMessagesDocument } from "./useGetMessages";

const createMessageDocument = graphql(`
  mutation CreateMessage($createMessageInput: CreateMessageInput!) {
    createMessage(createMessageInput: $createMessageInput) {
      ...MessageFragment
    }
  }
`);

const useCreateMessage = (chatId: string) => {
  return useMutation(createMessageDocument, {
    update(cache, { data }) {
      const queryOptions = {
        query: getMessagesDocument,
        variables: {
          chatId,
        },
      };

      const messages = cache.readQuery({ ...queryOptions });

      if (!messages || !data?.createMessage) return;

      cache.writeQuery({
        ...queryOptions,
        data: {
          messages: messages.messages.concat(data?.createMessage),
        },
      });
    },
  });
};

export { useCreateMessage };
