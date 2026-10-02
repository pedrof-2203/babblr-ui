import { fireEvent, render } from "@testing-library/react";
import Chat from "./Chat";

const mockFetchMore = jest.fn();
const mockCountMessages = jest.fn();
let mockMessages = Array.from({ length: 15 }, (_, index) => ({
  _id: String(index),
  content: `Message ${index}`,
  createdAt: new Date(2026, 0, 1, 0, index).toISOString(),
}));

jest.mock("react-router-dom", () => ({
  useParams: () => ({ _id: "chat-1" }),
}));
jest.mock("../../hooks/useGetChat", () => ({
  useGetChat: () => ({ data: { chat: { name: "Chat" } } }),
}));
jest.mock("../../hooks/useCreateMessage", () => ({
  useCreateMessage: () => [jest.fn()],
}));
jest.mock("../../hooks/useGetMessages", () => ({
  useGetMessages: () => ({
    data: { messages: mockMessages },
    loading: false,
    fetchMore: mockFetchMore,
  }),
}));
jest.mock("../../hooks/useCountMessages", () => ({
  useCountMessages: () => ({
    messagesCount: 100,
    countMessages: mockCountMessages,
  }),
}));

test("loads one older page on upward scrolling and preserves the viewport", () => {
  // Model browser layout, which jsdom does not calculate.
  const height = jest.spyOn(HTMLElement.prototype, "scrollHeight", "get")
    .mockImplementation(() => mockMessages.length * 60);
  mockFetchMore.mockReturnValue(new Promise(() => {}));

  try {
    const { container, rerender } = render(<Chat />);
    const scroller = container.querySelector(".MuiBox-root") as HTMLElement;

    fireEvent.scroll(scroller);
    expect(mockFetchMore).not.toHaveBeenCalled();

    scroller.scrollTop = 40;
    fireEvent.scroll(scroller);
    expect(mockFetchMore).toHaveBeenCalledWith({ variables: { skip: 15 } });

    scroller.scrollTop = 20;
    fireEvent.scroll(scroller);
    expect(mockFetchMore).toHaveBeenCalledTimes(1);

    mockMessages = [...mockMessages, ...mockMessages.map((message) => ({
      ...message,
      _id: `older-${message._id}`,
    }))];
    rerender(<Chat />);
    expect(scroller.scrollTop).toBe(940);
    fireEvent.scroll(scroller);
    expect(mockFetchMore).toHaveBeenCalledTimes(1);
  } finally {
    height.mockRestore();
  }
});
