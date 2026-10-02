import { useParams } from "react-router-dom";
import { useGetChat } from "../../hooks/useGetChat";
import {
  Avatar,
  Box,
  Divider,
  Grid,
  IconButton,
  InputBase,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { useCreateMessage } from "../../hooks/useCreateMessage";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useGetMessages } from "../../hooks/useGetMessages";
import { PAGE_SIZE } from "../../constants/page-size";
import { useCountMessages } from "../../hooks/useCountMessages";
import { useGetMe } from "../../hooks/useGetMe";

const Chat = () => {
  const params = useParams();
  const [message, setMessage] = useState("");
  const chatId = params._id!;
  const { data } = useGetChat({ _id: chatId });
  const { data: currentUser } = useGetMe();
  const [createMessage] = useCreateMessage();
  const {
    data: existingMessages,
    fetchMore,
    loading,
  } = useGetMessages({
    chatId,
    skip: 0,
    limit: PAGE_SIZE,
  });
  const messages = existingMessages?.messages;
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const initializedChat = useRef<string | null>(null);
  const previousScrollTop = useRef(0);
  const pendingPage = useRef<{
    chatId: string;
    height: number;
    top: number;
    messages: typeof messages;
  } | null>(null);

  const { messagesCount, countMessages } = useCountMessages(chatId);

  useEffect(() => {
    countMessages();
  }, [countMessages]);

  const scrollToBottom = () => {
    const container = scrollRef.current;
    if (!container) return;
    container.scrollTop = container.scrollHeight;
    previousScrollTop.current = container.scrollTop;
  };

  useEffect(() => {
    setMessage("");
  }, [chatId]);

  useLayoutEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    if (initializedChat.current !== chatId) {
      pendingPage.current = null;
      if (!messages) return;
      initializedChat.current = chatId;
      scrollToBottom();
      return;
    }

    const page = pendingPage.current;
    if (page && page.chatId === chatId && page.messages !== messages) {
      container.scrollTop = page.top + container.scrollHeight - page.height;
      previousScrollTop.current = container.scrollTop;
      pendingPage.current = null;
    }
  }, [chatId, messages]);

  const handleScroll = async () => {
    const container = scrollRef.current;
    if (!container) return;

    const scrollingUp = container.scrollTop < previousScrollTop.current;
    previousScrollTop.current = container.scrollTop;
    if (
      !scrollingUp ||
      container.scrollTop > 50 ||
      loading ||
      pendingPage.current ||
      !messages ||
      messagesCount === undefined ||
      messages.length >= messagesCount
    )
      return;

    const page = {
      chatId,
      height: container.scrollHeight,
      top: container.scrollTop,
      messages,
    };
    pendingPage.current = page;
    try {
      const result = await fetchMore({ variables: { skip: messages.length } });
      if (!result.data?.messages.length && pendingPage.current === page) {
        pendingPage.current = null;
      }
    } catch {
      // Release the guard so the next upward scroll can retry.
      if (pendingPage.current === page) pendingPage.current = null;
    }
  };

  const handleCreateMessage = async () => {
    createMessage({
      variables: {
        createMessageInput: {
          content: message,
          chatId,
        },
      },
    });
    setMessage("");
    scrollToBottom();
  };

  return (
    <Stack sx={{ height: "100%", justifyContent: "space-between" }}>
      <h1>{data?.chat.name}</h1>
      <Box
        ref={scrollRef}
        onScroll={handleScroll}
        sx={{ maxHeight: "70vh", overflow: "auto", overflowAnchor: "none" }}
      >
        {messages &&
          [...messages]
            .sort(
              (messageA, messageB) =>
                new Date(messageA.createdAt as Date).getTime() -
                new Date(messageB.createdAt as Date).getTime(),
            )
            .map((message) => (
              <Grid
                key={message._id}
                container
                sx={{
                  alignItems: "center",
                  marginBottom: "1rem",
                  justifyContent:
                    message.user._id === currentUser?.me._id
                      ? "flex-end"
                      : "flex-start",
                }}
              >
                <Grid
                  size={{
                    xs: 10,
                    lg: 11,
                  }}
                >
                  <Stack
                    sx={{
                      alignItems:
                        message.user._id === currentUser?.me._id
                          ? "flex-end"
                          : "flex-start",
                    }}
                  >
                    <Typography sx={{ marginLeft: ".25rem" }} variant="caption">
                      {message.user.username}
                    </Typography>
                    <Paper sx={{ width: "fit-content" }}>
                      <Typography sx={{ padding: ".9rem" }}>
                        {message.content}
                      </Typography>
                    </Paper>
                    <Typography variant="caption" sx={{ marginLeft: ".25rem" }}>
                      {new Date(message.createdAt as Date).toLocaleTimeString()}{" "}
                      {new Date(message.createdAt as Date).toLocaleDateString()}
                    </Typography>
                  </Stack>
                </Grid>
              </Grid>
            ))}
      </Box>

      <Paper
        sx={{
          p: "2px 4px",
          display: "flex",
          justifySelf: "flex-end",
          alignItems: "center",
          width: "100%",
          margin: "1rem",
        }}
      >
        <InputBase
          sx={{ ml: 1, flex: 1, width: "100%" }}
          onChange={(event) => setMessage(event.target.value)}
          value={message}
          placeholder="Message"
          onKeyDown={async (event) => {
            if (event.key === "Enter") {
              await handleCreateMessage();
            }
          }}
        />
        <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
        <IconButton
          onClick={handleCreateMessage}
          color="primary"
          sx={{ p: "10px" }}
        >
          <SendIcon />
        </IconButton>
      </Paper>
    </Stack>
  );
};

export default Chat;
