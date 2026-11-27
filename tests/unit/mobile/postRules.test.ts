import {
  dateLabel,
  parseTime,
  periodOf,
  upcomingDates,
  validatePost,
  type PostDraft,
} from "../../../mobile/src/activities/postRules";

// Friday, 27 November 2026, 15:00 local time.
const now = new Date(2026, 10, 27, 15, 0);

const draft: PostDraft = {
  category: "Library",
  venue: "Mustafa İnan Library",
  date: "2026-11-27",
  start: "19:00",
  end: "23:00",
};

describe("parseTime", () => {
  test("reads 24-hour times as minutes after midnight", () => {
    expect(parseTime("19:00")).toBe(19 * 60);
    expect(parseTime("7:05")).toBe(7 * 60 + 5);
    expect(parseTime(" 23:59 ")).toBe(23 * 60 + 59);
  });

  test("rejects times that are not valid HH:MM", () => {
    expect(parseTime("24:00")).toBeUndefined();
    expect(parseTime("19:60")).toBeUndefined();
    expect(parseTime("19")).toBeUndefined();
    expect(parseTime("7pm")).toBeUndefined();
  });
});

describe("validatePost", () => {
  test("accepts a library activity today from 19:00 to 23:00", () => {
    expect(validatePost(draft, now)).toEqual({});
  });

  test("requires a venue from the predefined list of the category", () => {
    expect(validatePost({ ...draft, venue: null }, now).venue).toBe("Choose a venue from the list.");
    expect(validatePost({ ...draft, venue: "My dorm room" }, now).venue).toBe("Choose a venue from the list.");
    expect(validatePost({ ...draft, category: "Gym" }, now).venue).toBe("Choose a venue from the list.");
  });

  test("explains the time format", () => {
    const errors = validatePost({ ...draft, start: "7pm", end: "" }, now);
    expect(errors.start).toBe("Enter the start time as HH:MM, e.g. 19:00.");
    expect(errors.end).toBe("Enter the end time as HH:MM, e.g. 23:00.");
  });

  test("rejects a window whose end is not after its start", () => {
    expect(validatePost({ ...draft, start: "19:00", end: "18:00" }, now).end).toBe(
      "The end time must be after the start time.",
    );
    expect(validatePost({ ...draft, start: "19:00", end: "19:00" }, now).end).toBe(
      "The end time must be after the start time.",
    );
  });

  test("rejects a window that crosses midnight", () => {
    expect(validatePost({ ...draft, start: "22:00", end: "01:00" }, now).end).toBe(
      "The activity must end by 23:59 of the planned day.",
    );
  });

  test("allows a window that ends at 23:59", () => {
    expect(validatePost({ ...draft, start: "22:00", end: "23:59" }, now)).toEqual({});
  });

  test("rejects a window that has already passed", () => {
    expect(validatePost({ ...draft, start: "08:00", end: "09:00" }, now).end).toBe(
      "This time window has already passed. Choose a later time.",
    );
  });

  test("accepts a window that has started but not ended", () => {
    expect(validatePost({ ...draft, start: "14:00", end: "16:00" }, now)).toEqual({});
  });

  test("accepts an early window on a later day", () => {
    expect(validatePost({ ...draft, date: "2026-11-28", start: "08:00", end: "09:00" }, now)).toEqual({});
  });
});

describe("dates", () => {
  test("offers today and the next six days", () => {
    const dates = upcomingDates(now);
    expect(dates).toHaveLength(7);
    expect(dates.slice(0, 3)).toEqual([
      { iso: "2026-11-27", label: "Today" },
      { iso: "2026-11-28", label: "Tomorrow" },
      { iso: "2026-11-29", label: "Sun 29 Nov" },
    ]);
    expect(dates[6]).toEqual({ iso: "2026-12-03", label: "Thu 3 Dec" });
  });

  test("labels a date relative to today", () => {
    expect(dateLabel("2026-11-27", now)).toBe("Today");
    expect(dateLabel("2026-12-01", now)).toBe("Tue 1 Dec");
  });
});

test("maps the start time to the feed period", () => {
  expect(periodOf(parseTime("07:00")!)).toBe("Morning");
  expect(periodOf(parseTime("12:00")!)).toBe("Afternoon");
  expect(periodOf(parseTime("17:00")!)).toBe("Evening");
});
