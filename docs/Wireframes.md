# CampusMatcher Low-Fidelity Wireframes

**WBS activity:** WBS-9.1 — Wireframes for all screens

**Status:** Revised draft; awaiting team review and approval

**Plan alignment:** WBS-9.1 is unchanged in the current merged plan. This revision also reflects the updated scope in open PR [#7](https://github.com/DurukanEnes/campus-matcher/pull/7) (Project Plan v1.3).

**Platforms:** Student and admin experiences are role-restricted Android and iOS mobile app screens.

## Design principles

- Keep the two primary actions, **Add Activity** and **Join Activity**, easy to reach from Home.
- Show the selected campus venue and time window as text. Do not request device location or show maps.
- Explain request and match states clearly. A match is limited to one activity post and does not create a friend connection.
- Keep matched posts out of the open feed, but retain their activity chat until the planned day ends.
- Make blocking and reporting reachable from relevant user and post views.
- Support loading, empty, validation, network-error, and permission-denied states on data-driven screens.
- Use accessible labels, readable contrast, and controls large enough for touch.

## Student navigation

```text
Welcome -> Register -> Verify e-mail -> Home
Welcome -> Login -----------------> Home

Home <-> Join Activity feed -> Post details -> Send request
  |             |                              |
  |             +-> Request inbox              +-> Activity chat
  |                                                    |
  +-> Add Activity -> Preview -> My activities         |
                                                       v
Notifications -> Request details -> Accept / Decline -> Matched activity chat
Profile -> Edit profile / Preferences / Safety
Admin role -> Moderation queue -> Report details -> Dismiss / Suspend
```

The persistent bottom navigation is **Home**, **Notifications**, and **Profile**. The Home screen contains the two main activity actions. An activity chat starts with the join-request message and continues after acceptance; it is not a persistent user-to-user conversation and is deleted with the activity at 23:59 on its planned day.

## Wireframes

### 1. Welcome

```text
+----------------------------------+
|          CampusMatcher           |
|                                  |
| Find a campus activity partner.  |
|                                  |
| [ Create account ]               |
| [ Log in ]                       |
|                                  |
| For verified İTÜ members         |
| (students and staff).            |
+----------------------------------+
```

**Actions:** Create account opens Register; Log in opens Login.

### 2. Register

```text
+----------------------------------+
| <- Create account                |
|                                  |
| Name                             |
| [____________________________]   |
| University e-mail                |
| [____________________________]   |
| Password                         |
| [____________________________]   |
|                                  |
| Use your verified @itu.edu.tr    |
| address (student or staff).      |
| [ Continue ]                     |
| Already registered? Log in       |
+----------------------------------+
```

**Behavior:** Validate required fields and the İTÜ e-mail domain. Student and staff accounts use the member role; admin access is separate. Never echo a password in an error. Continue requests verification and opens Verify e-mail.

### 3. Verify e-mail

```text
+----------------------------------+
| <- Verify your e-mail            |
|                                  |
| Enter the one-time code sent to  |
| e***@itu.edu.tr                  |
|                                  |
| [ _ ] [ _ ] [ _ ] [ _ ] [ _ ] [ _]|
|                                  |
| [ Verify ]                       |
| Resend code                      |
+----------------------------------+
```

**Behavior:** Show expiry, invalid-code, and resend feedback. A successful verification proceeds to Home or Login, according to the authentication flow.

### 4. Login

```text
+----------------------------------+
| <- Log in                        |
|                                  |
| University e-mail                |
| [____________________________]   |
| Password                         |
| [____________________________]   |
|                                  |
| [ Log in ]                       |
| Create an account                |
+----------------------------------+
```

### 5. Home

```text
+----------------------------------+
| CampusMatcher              (bell)|
|                                  |
| Good afternoon, Erinç            |
|                                  |
| What would you like to do?       |
|                                  |
| [ + Add Activity ]               |
|                                  |
| [ Browse Activities ]            |
|                                  |
| My activities                    |
| Library · Mustafa İnan Library   |
| 30 Oct, 19:00–21:00 [Edit][Delete]|
|                                  |
| Gym · Campus Gym                 |
| 02 Nov, 17:00–18:00 [Edit][Delete]|
|                                  |
| Home       Notifications Profile |
+----------------------------------+
```

**Behavior:** Show the user's own planned activities, with an empty state and an entry to create one when there are none. Add Activity opens the form; Browse Activities opens the feed.

### 6. Add / edit activity

```text
+----------------------------------+
| <- Add Activity                  |
|                                  |
| Activity                         |
| [ Library                  v ]   |
|                                  |
| Campus venue                     |
| [ Select a venue           v ]   |
|                                  |
| Date                             |
| [ Select planned date      v ]   |
| Time window                      |
| [ Start time ]  to  [ End time ] |
|                                  |
| Note (optional)                  |
| [____________________________]   |
|                                  |
| [ Preview activity ]             |
+----------------------------------+
```

**Behavior:** Venue options come from the predefined catalog and may depend on activity. Validate the planned date and time window, including past and overlapping windows. Do not request GPS or offer map selection. Edit mode pre-fills the existing post and exposes Delete with confirmation.

### 7. Activity preview

```text
+----------------------------------+
| <- Review activity               |
|                                  |
| Library                          |
| Mustafa İnan Library             |
| Today, 19:00–21:00               |
| "Working on the database project"|
|                                  |
| If matched, this post leaves the |
| open feed. Activity, requests,   |
| and chat are deleted at 23:59 on |
| the planned day.                 |
|                                  |
| [ Publish activity ]             |
| [ Edit details ]                 |
+----------------------------------+
```

**Behavior:** Publishing returns to Home and shows the active-post summary.

### 8. Join Activity feed

```text
+----------------------------------+
| Join Activity                    |
| [Category v] [Hour range v]      |
| [Venue v]                        |
|                                  |
| [ Activity card                  |
|   Library · Today, 19:00–21:00   |
|   Mustafa İnan Library           |
|   by Student name                |
|   View details                > ]|
|                                  |
| [ Activity card ...             ]|
|                                  |
| Home       Notifications Profile |
+----------------------------------+
```

**States:** Loading indicator; empty result with “Try changing your filters”; retry action on network error. Show open posts newest first; omit the user's own posts, matched/closed posts, and posts from blocked users. Support category, hour-range, and venue filters with pagination. Filter selection can be cleared.

### 9. Activity details and join request

```text
+----------------------------------+
| <- Activity details         (...)|
|                                  |
| Library                          |
| Mustafa İnan Library             |
| Today, 19:00–21:00               |
|                                  |
| "Working on the database project"|
| Posted by Student name           |
|                                  |
| Your message to the owner        |
| [ Hi! Can I join you?__________ ]|
|                                  |
| [ Send join request ]            |
+----------------------------------+
```

**Behavior:** The overflow menu offers Report and Block. Sending requires a message and confirmation state; prevent duplicate requests and hide the action for the user's own post. The join-request message is also the first message in the activity chat.

### 10. Request sent

```text
+----------------------------------+
| Join request sent                |
|                                  |
| The post owner will review your  |
| request. We will notify you when|
| they respond.                    |
|                                  |
| [ Back to feed ]                 |
| [ View activity chat ]           |
+----------------------------------+
```

### 11. Notifications and requests

```text
+----------------------------------+
| Notifications                    |
|                                  |
| NEW  Join request                |
|      Student wants to join your  |
|      Library activity            |
|      [ Review request ]          |
|                                  |
|      Request accepted            |
|      Open the activity chat      |
|      [ Open chat ]               |
|                                  |
| Home       Notifications Profile |
+----------------------------------+
```

The request inbox is available to the activity owner from Notifications. Opening a request shows the activity, requester's message, and **Accept** / **Decline** actions. Accept closes the post in the feed and marks the activity as matched; the activity chat remains available. A requester sees the response but cannot accept on the owner's behalf.

### 12. Matched activity chat

```text
+----------------------------------+
| <- Library · Student name        |
| Mustafa İnan Library             |
| 30 Oct, 19:00–21:00              |
| Request pending / Matched        |
|                                  |
| Student: Hi! Can I join you?     |
| You: Sure, let's meet there.     |
|                                  |
| Agree on an exact meeting point. |
|                                  |
| [ Message...                 ][>]|
|                                  |
| Activity and chat are deleted   |
| at 23:59 on the planned day.     |
+----------------------------------+
```

**Behavior:** The chat starts with the request message and continues after acceptance. Show pending/matched state and delivery/reconnect states. Do not expose chats to unrelated users. Keep the matched activity chat available until the end-of-day deletion at 23:59 on the planned day; then remove the activity, requests, and chat.

### 13. Profile

```text
+----------------------------------+
| Profile                    [Edit]|
|                                  |
| [Avatar]  Erinç Özarı            |
|           Faculty / Department   |
|                                  |
| Interests                        |
| [ Study ] [ Design ]             |
| Activity preferences             |
| [ Library ] [ Gym ]              |
|                                  |
| [ Safety and blocked users ]     |
| [ Log out ]                      |
|                                  |
| Home       Notifications Profile |
+----------------------------------+
```

### 14. Edit profile and preferences

```text
+----------------------------------+
| <- Edit profile                  |
| Name                             |
| [____________________________]   |
| Faculty / Department             |
| [____________________________]   |
| Interests                        |
| [ Add interest               + ] |
| Activity preferences             |
| [ Library ] [ Gym ] [ Cafeteria ]|
|                                  |
| [ Save changes ]                 |
+----------------------------------+
```

### 15. Report a user or activity

```text
+----------------------------------+
| <- Report                        |
|                                  |
| Reporting: Student / Activity   |
| Why are you reporting it?        |
| ( ) Harassment                   |
| ( ) Inappropriate content        |
| ( ) Spam                         |
| ( ) Other                        |
|                                  |
| Details (optional)               |
| [____________________________]   |
|                                  |
| [ Submit report ]                |
+----------------------------------+
```

**Behavior:** Confirm successful submission without exposing the report to the reported user. Provide a separate confirmation before blocking; blocked users cannot see or contact the blocker.

### 16. Admin moderation screens (mobile)

```text
+----------------------------------+
| Admin · Reports                  |
| [ Open v ]                       |
|                                  |
| Student A reported Student B    |
| Spam · 30 Oct              [ > ]|
|                                  |
| Student C reported an activity  |
| Inappropriate content      [ > ]|
+----------------------------------+
| Report details                   |
| Reporter, reported account,      |
| reason, and submitted details    |
|                                  |
| [ Dismiss report ]               |
| [ Suspend account ]              |
|                                  |
| Confirm action + reason          |
| [ Cancel ] [ Confirm ]           |
+----------------------------------+
```

**Behavior:** Restrict these screens and actions to administrators in the mobile app. Require confirmation and a reason before suspension. Show loading, empty, error, and action-completed states.

## Primary flow and screen transitions

1. An İTÜ student or staff member registers with a verified `@itu.edu.tr` e-mail and reaches Home.
2. From Home, the student publishes a post using Add Activity, a predefined venue, a time window, and an optional note.
3. Another student filters the feed, opens a post, and sends a message with a join request.
4. The owner reviews the request in Notifications and accepts or declines it.
5. The request message starts the activity chat. On acceptance, the post is closed to further feed requests, while the participants continue the chat and agree on the exact meeting point.
6. At 23:59 on the activity's planned day, the activity, its join requests, and its chat are deleted. Later-dated activities remain.
7. Either student can report or block the other from the relevant activity or profile context.
8. An administrator reviews reports and may dismiss a report or suspend an account.

## Review checklist

- [ ] Team review and approval of the core screens and main user flows (WBS-9.1 acceptance criterion).
- [ ] Confirm the declined-request chat behavior with the team; the plan defines the chat starting with the request and continuing after a match, but does not specify what happens after a decline.
- [ ] Carry approved wireframes into the clickable prototype and style guide (WBS-9.2).
