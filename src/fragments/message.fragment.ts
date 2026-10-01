import { graphql } from "../gql";

export const MessageFragment = graphql(`
  fragment MessageFragment on Message {
    _id
    chatId
    user {
      _id
      username
      email
    }
    content
    createdAt
  }
`);
