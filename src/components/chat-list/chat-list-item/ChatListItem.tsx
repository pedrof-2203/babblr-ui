import {
  Avatar,
  Box,
  Divider,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import router from "../../Routes";
import type { ChatFragmentFragment as Chat } from "../../../gql/graphql";

interface ChatListProps {
  chat: Chat;
  selected: boolean;
}

const ChatListItem = ({ chat, selected }: ChatListProps) => {
  return (
    <>
      <ListItem alignItems="flex-start" disablePadding>
        <ListItemButton
          onClick={() => router.navigate(`/chats/${chat._id}`)}
          selected={selected}
        >
          <ListItemText
            primary={chat.name}
            secondary={
              <Box>
                <Typography
                  component="span"
                  variant="body2"
                  sx={{ color: "text.primary", display: "inline" }}
                >
                  {chat.latestMessage?.user?.username || ""}
                </Typography>

                <div
                  style={{
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitLineClamp: 1,
                    lineClamp: 1,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {chat.latestMessage?.content &&
                    " " + chat.latestMessage?.content}
                </div>
              </Box>
            }
          />
        </ListItemButton>
      </ListItem>
      <Divider variant="inset" />
    </>
  );
};

export default ChatListItem;
