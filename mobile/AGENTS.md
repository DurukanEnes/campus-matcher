# CampusMatcher Mobile App

This folder is the React Native (Expo) mobile application of CampusMatcher, the BLG411E project of Group B.B.F. It runs on Android and iOS. `docs/Charter.md` and `docs/ProjectPlan.md` are the source of truth; if this file disagrees with them, follow them and report the mismatch.

## Product

CampusMatcher helps İTÜ members (students and staff) find companions for campus activities.

- **Home:** two main actions, Add Activity and Join Activity.
- **Add Activity:** a post with a category (library, gym, cafeteria), a venue from a predefined İTÜ list, a planned date, a time window, and an optional note.
- **Join Activity:** a feed of other users' open posts, filterable by activity and hour. A user sends the post owner a join request with a message.
- **Match:** when the owner accepts a request, the post is closed and leaves the feed. It is not deleted at that moment.
- **Chat:** text chat between the post owner and the requesting user. It starts with the join request message, belongs to the activity, and is where the exact meeting point is agreed.
- **End-of-day deletion:** every day at 23:59, activities planned for that day are deleted with their join requests and chats. Activities planned for later days are kept.
- **Notifications:** new join requests, request responses, and new messages.
- **Safety:** users block and report; admins review reports and suspend accounts in admin-only screens.
- **Access:** only verified `@itu.edu.tr` addresses can register. The roles are member and admin.

## Out of scope

Do not add these:

- GPS or device location, maps, or distance-based matching
- Swipe-based or automatic matching
- A friend system or any lasting connection between users
- Activity or chat history after the planned day
- Dating or romantic matching
- Voice or video calling
- Integration with official university systems
- Payments or monetization
- Multi-university support
- A full web client
- Publishing to the Google Play Store or Apple App Store

Group matching and admin usage statistics are optional scope. Do not start them unless the team asks.

## Stack

- Expo, React Native, and TypeScript
- **React Navigation** for navigation (do not use Expo Router)
- **Axios** through the shared client in `src/api/client.ts` for backend calls
- Jest and React Native Testing Library for tests
- The backend is FastAPI with a REST API and WebSocket chat, in `app/` at the repository root

## Project structure

- `src/screens/`: screens
- `src/navigation/`: navigators and route types
- `src/api/`: backend communication
- `../tests/unit/mobile/`: mobile tests. All tests belong in the repository's `tests/` folder, never inside `mobile/`.

## Commands

Run these from `mobile/`:

```bash
npx expo install <package>  # use for Expo and React Native packages; resolves SDK-compatible versions
npx expo start              # start the dev server
npx tsc --noEmit            # typecheck
npm test                    # run the tests in tests/unit/mobile
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run the typecheck and the tests before declaring any task done.

## Expo versions

Expo ships breaking changes in every SDK release. Before writing code that touches an Expo or React Native API, check the major version of `expo` in `package.json` and read the matching docs at `https://docs.expo.dev/versions/v<major>.0.0/`. Do not answer from memory.

## Rules

- Follow the task split in the plan: UI tasks (a) use mock data, and integration tasks (b) connect to the real API after the backend task is complete.
- The app runs in Expo Go, which only includes its bundled native modules. Ask the team before adding a library that needs a development build.
- If `ios/` and `android/` do not exist, they are generated. Never create or edit them by hand; configure native behavior in `app.json`.
- Keep mobile changes inside `mobile/` and `tests/unit/mobile/`. Tell the team before changing shared files such as `README.md` or `.gitignore`.
- Never commit secrets. Keep them in `.env`.
- Nobody commits directly to `main`. Work on a `feature/...` branch and merge through a pull request with at least one teammate's approval.
- Every AI-generated output is reviewed by a team member in a pull request. The team reports AI usage, effort, introduced errors, and their fixes.
