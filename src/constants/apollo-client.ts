import {
  ApolloClient,
  CombinedGraphQLErrors,
  HttpLink,
  InMemoryCache,
} from "@apollo/client";
import { ErrorLink } from "@apollo/client/link/error";
import { API_URL } from "./urls";
import excludedRoutes from "./excluded-routes";
import router from "../components/Routes";

const logoutLink = new ErrorLink(({ error }) => {
  if (!CombinedGraphQLErrors.is(error)) {
    return;
  }

  const originalError = error.errors[0]?.extensions?.originalError as
    | { statusCode?: number }
    | undefined;

  if (
    originalError?.statusCode === 401 &&
    !excludedRoutes.includes(window.location.pathname)
  ) {
    router.navigate("/login");
    client.resetStore();
  }
});

const httpLink = new HttpLink({ uri: `${API_URL}/graphql` });

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: logoutLink.concat(httpLink),
});

export default client;
