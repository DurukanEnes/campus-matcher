import { fireEvent, render, screen } from "@testing-library/react-native";
import { Pressable, Text } from "react-native";
import { ChatProvider } from "../../../mobile/src/chat/ChatContext";
import { MAX_MESSAGE_LENGTH } from "../../../mobile/src/chat/chatRules";
import { PrototypeProvider, usePrototypeData } from "../../../mobile/src/prototype/PrototypeData";
import ChatScreen from "../../../mobile/src/screens/ChatScreen";

let mockParams: { requestId: string } = { requestId: "request-demo" };

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
  useRoute: () => ({ params: mockParams }),
}));

// Friday, 27 November 2026, 15:00 local time.
const now = () => new Date(2026, 10, 27, 15, 0);

beforeEach(() => {
  mockParams = { requestId: "request-demo" };
});

// Lets a test answer a join request the way the owner's request inbox does.
function AnswerRequest({ requestId, status }: { requestId: string; status: "accepted" | "declined" }) {
  const { updateRequest } = usePrototypeData();
  return (
    <Pressable accessibilityRole="button" onPress={() => updateRequest(requestId, status)}>
      <Text>{`${status} ${requestId}`}</Text>
    </Pressable>
  );
}

function tree(extra?: React.ReactNode) {
  return (
    <PrototypeProvider>
      <ChatProvider>
        <ChatScreen now={now} />
        {extra}
      </ChatProvider>
    </PrototypeProvider>
  );
}

async function sendMessage(text: string) {
  await fireEvent.changeText(screen.getByLabelText("Chat message"), text);
  await fireEvent.press(screen.getByRole("button", { name: "Send message" }));
}

test("the chat starts with the join request message from the requester", async () => {
  await render(tree());

  expect(screen.getByText("Deniz Aydın")).toBeTruthy();
  expect(screen.getByLabelText("Deniz Aydın: Hi! I have a free hour after class. Mind if I join?")).toBeTruthy();
  expect(screen.getByText("PENDING")).toBeTruthy();
});

test("a sent message appears with its time and the input is cleared", async () => {
  await render(tree());
  await sendMessage("Second floor, near the entrance");

  expect(screen.getByLabelText("You: Second floor, near the entrance")).toBeTruthy();
  expect(screen.getByText("15:00")).toBeTruthy();
  expect(screen.getByLabelText("Chat message").props.value).toBe("");
});

test("an empty message cannot be sent", async () => {
  await render(tree());
  await fireEvent.changeText(screen.getByLabelText("Chat message"), "   ");

  expect(screen.getByRole("button", { name: "Send message" })).toBeDisabled();
});

test("a message longer than the limit is not sent", async () => {
  await render(tree());
  await sendMessage("a".repeat(MAX_MESSAGE_LENGTH + 1));

  expect(screen.getByText(`A message can have at most ${MAX_MESSAGE_LENGTH} characters.`)).toBeTruthy();
  expect(screen.queryByLabelText(/^You: a+$/)).toBeNull();
});

test("each join request has its own chat, even for the same post", async () => {
  await render(tree());
  await sendMessage("See you at the cafeteria");

  mockParams = { requestId: "request-second" };
  await screen.rerender(tree());

  expect(screen.getByText("Selin Yıldız")).toBeTruthy();
  expect(screen.getByLabelText("Selin Yıldız: Lunch sounds great, I'm nearby at that time.")).toBeTruthy();
  expect(screen.queryByLabelText("You: See you at the cafeteria")).toBeNull();
});

test("a matched chat stays open and shows that the members are matched", async () => {
  await render(tree(<AnswerRequest requestId="request-demo" status="accepted" />));
  await fireEvent.press(screen.getByRole("button", { name: "accepted request-demo" }));

  expect(screen.getByText("MATCHED")).toBeTruthy();
  expect(screen.getByLabelText("Chat message")).toBeTruthy();
});

test("the chat of a declined request is read-only", async () => {
  await render(tree(<AnswerRequest requestId="request-demo" status="declined" />));
  await fireEvent.press(screen.getByRole("button", { name: "declined request-demo" }));

  expect(screen.getByText("DECLINED")).toBeTruthy();
  expect(screen.getByText("This request was declined. The chat is read-only.")).toBeTruthy();
  expect(screen.queryByLabelText("Chat message")).toBeNull();
  expect(screen.getByLabelText("Deniz Aydın: Hi! I have a free hour after class. Mind if I join?")).toBeTruthy();
});

test("a chat whose activity was deleted shows that the activity has ended", async () => {
  mockParams = { requestId: "request-deleted-at-midnight" };
  await render(tree());

  expect(screen.getByText("This activity has ended")).toBeTruthy();
  expect(screen.queryByLabelText("Chat message")).toBeNull();
});
