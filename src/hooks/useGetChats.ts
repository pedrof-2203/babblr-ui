import { useQuery } from "@apollo/client/react";
import { graphql } from "../gql";

export const getChatsDocument = graphql(`
  query Chats($skip: Int!, $limit: Int!) {
    chats(skip: $skip, limit: $limit) {
      ...ChatFragment
    }
  }
`);

const useGetChats = (args: { skip: number; limit: number }) => {
  return useQuery(getChatsDocument, { variables: args });
};

export { useGetChats };
