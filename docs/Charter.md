# Project Charter: CampusMatcher

## 1. Project Purpose and Objectives
CampusMatcher is a mobile application that enables members of Istanbul Technical University (İTÜ), both students and staff, to find companions for everyday campus activities such as studying at the library, working out at the gym, or having a meal at the cafeteria. A user either publishes an activity post (Add Activity) with the activity, campus venue, date, and time window they plan to attend, or browses the feed of other users' posts (Join Activity) and sends the post owner a join request with a message. When the owner accepts the request, the two users are matched and arrange the meeting in the chat. The project aims to reduce social isolation on campus, make it easier to meet peers with similar routines, and encourage participation in campus life through a safe, verified, and İTÜ-exclusive platform.

## 2. Stakeholders & Roles
* **Product Owner:**
* **Software Engineering Team:**
    * Enes Durukan : Project Manager / Mobile Developer
        * Implementing app screens and navigation flows, integrating the mobile app with the backend REST API, and handling push notifications on the device.
    * Erinç Özarı : Mobile Team Lead / Mobile Developer & UI/UX Designer
        * Owner of the UI/UX design: wireframes, interactive prototypes, and the visual style guide; implementing reusable UI components; reviewing mobile code.
    * Mohammed Alashi : Backend Team Lead / Backend Developer
        * API architecture and endpoint design, database schema design and the campus venue catalog, and implementation of the activity feed and join request (matching) services; reviewing backend code.
    * Ali Çetin : DevOps Lead / Backend Developer & DevOps Engineer
        * Authentication and authorization (JWT, RBAC), user/profile services, and the block, report, and suspension (moderation) API; Docker setup, CI/CD pipelines, and cloud deployment.
    * İbrahim Meral : QA Lead / Backend Developer & QA Engineer
        * Activity post service with the end-of-day deletion job, messaging (WebSocket), and notification services; test strategy, automated test suites, and test-first enforcement.
* **GH Repo/Project URL:** {_Do not fill this field in yet; to be filled after charter approval_}

## 3. Project Scope
### Project domain
The application belongs to the domain of social networking and campus life within higher education. The key users are İTÜ members (students and staff) who wish to share daily campus activities with peers, together with system administrators who are responsible for moderation and platform management.

### In-Scope
* **User Registration and Authentication:** Account creation restricted to verified İTÜ e-mail addresses (`@itu.edu.tr`) of students and staff, secure login, and token-based session management.
* **Role-Based Authorization:** Distinct permissions for members (students and staff) and administrators.
* **User Profile Management:** Management of basic profile information, faculty/department, interests, and activity preferences (e.g., workout type, study subject).
* **Home Screen:** Two main actions, Add Activity and Join Activity. The application does not use swipe-based matching.
* **Activity Posts (Add Activity):** Creation, editing, and deletion of activity posts that specify the activity category (library, gym, cafeteria), the campus venue, the planned date and time window, and an optional short note (e.g., "Library, 30 October, 19:00–23:00"). The venue is selected from a predefined list of İTÜ campus locations; the device's GPS location is not used.
* **Activity Feed (Join Activity):** A social-media-style feed that lists the open posts of other users with their details, with filters for activity category and hour.
* **Join Requests and Matching:** A user opens a post in the feed and sends the post owner a join request with a message. The owner accepts or declines the request; an accepted request is a match, and the matched post is closed and no longer shown in the feed. For example, Enes publishes a library post, Ahmet finds it in the feed and sends a request, Enes accepts it, and the post leaves the feed. A match exists only for a single post and does not create a lasting connection between users; the application has no friend system.
* **In-App Messaging:** A text-based chat between the post owner and the requesting user, starting with the join request message. The chat belongs to the activity, and the users agree on the exact meeting point (e.g., "second floor, near the entrance") in it.
* **End-of-Day Deletion:** Every day at 23:59, all activities planned for that day are deleted automatically together with their join requests and chats. Activities planned for later days are kept; for example, at the end of 30 October, a post for 3 November created on 30 October is not deleted.
* **Notifications:** Push notifications for new join requests, request responses (accepted or declined), and incoming messages.
* **Safety and Moderation:** Blocking and reporting users, and an administrator panel for reviewing reports and suspending accounts.
* **Service-Based Backend and Cloud Deployment:** A REST API offered by the backend services, hosted on a cloud platform with a relational database.

### Out-of-Scope
* GPS and device location services, including real-time location tracking, live location sharing, map views, and distance-based matching. Location is limited to the campus venue selected in the activity post, and the exact meeting point is shared by the users in the chat.
* Automatic or swipe-based matching (e.g., swiping left or right on user profiles); users choose posts themselves in the feed.
* A friend system (sending friend requests, adding or removing friends, or keeping a friend list) and any other persistent social connection between users.
* Keeping activities or chats after the end of their planned day (no activity or chat history).
* Dating or romantic matching features.
* Voice and video calling.
* Integration with official university systems (student information system, campus card, facility reservation systems).
* Payment, in-app purchase, or monetization features.
* Multi-university (multi-tenant) support.
* A full-featured web client (the user interface is delivered as a mobile application).

## 4. Technology Stack

### Backend Stack
* Python with FastAPI (RESTful API services)
* Neon PostgreSQL (relational database)
* SQLAlchemy and Alembic (ORM and database migrations)
* JWT (JSON Web Token) based authentication and role-based authorization
* WebSocket (real-time messaging)
* Firebase Cloud Messaging (push notifications)
* Docker (containerization)
* Cloud hosting platform (e.g., AWS, Azure for Students, or Render)
* Pytest (unit and integration testing)
* GitHub Actions (continuous integration and deployment)

### Frontend Stack
* React Native with Expo (cross-platform mobile application for Android and iOS)
* TypeScript
* React Navigation (screen navigation)
* Axios (HTTP client for API communication)
* Jest and React Native Testing Library (frontend testing)

### AI Stack
* Claude Code (AI-assisted coding, testing, and documentation)
* ChatGPT (image creation and design)

## 5. Project Milestones
| Deliverable                       | Deadline          |
|---                                |---                |
| Project Charter                   | 05.10.2026 23:59  |
| Project Plan                      | 19.10.2026 23:59  |
| Requirement Specification Report  | 02.11.2026 23:59  |
| Requirement Analysis Report       | 23.11.2026 23:59  |
| Software Design Report            | 07.12.2026 23:59  |
| Software Test Report              | 21.12.2026 23:59  |
| Codebase                          | 25.12.2026 23:59  |
| Demo                              | 26.12.2026 23:59  |
| Presentation                      | 28.12.2026 23:59  |
