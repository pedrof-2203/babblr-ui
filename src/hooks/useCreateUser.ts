import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client/react";
import { User } from "../models/User";

interface CreateUserInput {
  createUserInput: {
    email: string;
    password: string;
  };
}

const CREATE_USER = gql`
  mutation CreateUser($createUserInput: CreateUserInput!) {
    createUser(createUserInput: $createUserInput) {
      _id
      email
    }
  }
`;

const useCreateUser = () => {
  return useMutation<User, CreateUserInput>(CREATE_USER);
};

export { useCreateUser };
