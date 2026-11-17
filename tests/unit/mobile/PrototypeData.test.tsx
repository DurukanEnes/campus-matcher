import { fireEvent, render, screen } from "@testing-library/react-native";
import { Pressable, Text, View } from "react-native";
import { PrototypeProvider, usePrototypeData } from "../../../mobile/src/prototype/PrototypeData";

function PrototypeHarness() {
  const { activities, addActivity, requests, updateRequest } = usePrototypeData();
  const matchedActivity = activities.find((activity) => activity.id === "activity-cafe");
  const request = requests.find((item) => item.id === "request-demo");
  return (
    <View>
      <Text testID="activity-count">{activities.length}</Text>
      <Text testID="activity-status">{matchedActivity?.status}</Text>
      <Text testID="request-status">{request?.status}</Text>
      <Pressable
        onPress={() => addActivity({
          category: "Library",
          venue: "Central Library",
          date: "Tomorrow",
          time: "15:00–16:00",
          period: "Afternoon",
          note: "Study together",
        })}
      >
        <Text>Add activity</Text>
      </Pressable>
      <Pressable onPress={() => updateRequest("request-demo", "accepted")}>
        <Text>Accept request</Text>
      </Pressable>
    </View>
  );
}

test("publishing an activity adds it to the shared prototype feed", async () => {
  await render(<PrototypeProvider><PrototypeHarness /></PrototypeProvider>);

  expect(screen.getByTestId("activity-count").props.children).toBe(3);
  await fireEvent.press(screen.getByText("Add activity"));
  expect(screen.getByTestId("activity-count").props.children).toBe(4);
});

test("accepting a request marks its activity as matched", async () => {
  await render(<PrototypeProvider><PrototypeHarness /></PrototypeProvider>);

  await fireEvent.press(screen.getByText("Accept request"));

  expect(screen.getByTestId("request-status").props.children).toBe("accepted");
  expect(screen.getByTestId("activity-status").props.children).toBe("matched");
});
