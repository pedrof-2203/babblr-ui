import {
  CombinedGraphQLErrors,
  ServerError,
} from "@apollo/client/errors";

const extractErrorMessage = (error: unknown): string => {
  if (CombinedGraphQLErrors.is(error)) {
    const graphQLError = error.errors[0];

    const originalError = graphQLError?.extensions?.originalError as
      | { message?: string | string[] }
      | undefined;

    const message = originalError?.message;

    if (Array.isArray(message)) {
      return formatErrorMessage(message[0]);
    }

    if (message) {
      return formatErrorMessage(message);
    }

    return graphQLError?.message ?? "An unexpected error occurred.";
  }

  if (ServerError.is(error)) {
    console.log("HTTP status:", error.statusCode);
    console.log("Response body:", error.bodyText);

    return `An unexpected error occurred.`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred.";
};

const formatErrorMessage = (message: string): string => {
  return message.charAt(0).toUpperCase() + message.slice(1);
};

export { extractErrorMessage };