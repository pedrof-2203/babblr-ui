import { ApolloProvider } from "@apollo/client/react";
import {
  Container,
  createTheme,
  CssBaseline,
  Grid,
  Snackbar,
  ThemeProvider,
} from "@mui/material";
import client from "./constants/apollo-client";
import Header from "./components/header/Header";
import ChatList from "./components/chat-list/ChatList";
import Guard from "./components/auth/Guard";
import { RouterProvider } from "react-router-dom";
import router from "./components/Routes";
import { usePath } from "./hooks/usePath";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

const App = () => {
  const { path } = usePath();

  const showChatList = path === "/" || path.includes("chats");

  return (
    <ApolloProvider client={client}>
      <ThemeProvider theme={darkTheme}>
        <CssBaseline>
          <Header />
          <Guard>
            {showChatList ? (
              <Grid container>
                <Grid size={{ md: 3 }}>
                  <ChatList />
                </Grid>
                <Grid size={{ md: 9 }}>
                  <Routes />
                </Grid>
              </Grid>
            ) : (
              <Routes />
            )}
          </Guard>
          <Snackbar />
        </CssBaseline>
      </ThemeProvider>
    </ApolloProvider>
  );
};

const Routes = () => {
  return (
    <Container sx={{ height: "100%" }}>
      <RouterProvider router={router} />
    </Container>
  );
};

export default App;
