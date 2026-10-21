# Project Charter: CampusMatcher

## 1. Project Purpose and Objectives
CampusMatcher is a mobile application that enables university students to find companions for everyday campus activities such as studying at the library, working out at the gym, or having a meal at the cafeteria. A student either publishes an activity post (Add Activity) with the activity, campus venue, and time window they plan to attend, or browses the feed of other students' posts (Join Activity) and sends the post owner a join request with a message. When the owner accepts the request, the two students are matched and arrange the meeting in the chat. The project aims to reduce social isolation among students, make it easier to meet peers with similar routines, and encourage participation in campus life through a safe, verified, and university-exclusive platform.

## 2. Stakeholders & Roles
* **Product Owner:**
* **Software Engineering Team:**
    * Enes Durukan : Project Manager / Mobile Developer
        * Implementing app screens and navigation flows, integrating the mobile app with the backend REST API, and handling push notifications on the device.
    * Erinç Özarı : Mobile Team Lead / Mobile Developer & UI/UX Designer
        * Owner of the UI/UX design: wireframes, interactive prototypes, and the visual style guide; implementing reusable UI components; reviewing mobile code.
    * Mohammed Alashi : Backend Team Lead / Backend Developer
        * API architecture and endpoint design, database schema design, and implementation of the activity feed and join request (matching) services; reviewing backend code.
    * Ali Çetin : DevOps Lead / Backend Developer & DevOps Engineer
        * Authentication and authorization (JWT, RBAC) and user/profile services; Docker setup, CI/CD pipelines, and cloud deployment.
    * İbrahim Meral : QA Lead / Backend Developer & QA Engineer
        * Messaging (WebSocket), notification, and moderation services; test strategy, automated test suites, and test-first enforcement.
* **GH Repo/Project URL:** {_Do not fill this field in yet; to be filled after charter approval_}

## 3. Project Scope
### Project domain
The application belongs to the domain of social networking and campus life within higher education. The key users are enrolled university students who wish to share daily campus activities with peers, together with system administrators who are responsible for moderation and platform management.

### In-Scope
* **User Registration and Authentication:** Account creation restricted to verified university e-mail addresses, secure login, and token-based session management.
* **Role-Based Authorization:** Distinct permissions for students and administrators.
* **User Profile Management:** Management of basic profile information, faculty/department, interests, and activity preferences (e.g., workout type, study subject).
* **Home Screen:** Two main actions, Add Activity and Join Activity. The application does not use swipe-based matching.
* **Activity Posts (Add Activity):** Creation, editing, and deletion of activity posts that specify the activity category (library, gym, cafeteria), the campus venue, the time window, and an optional short note (e.g., "Library, 19:00–23:00"). The venue is selected from a predefined list of campus locations; the device's GPS location is not used.
* **Activity Feed (Join Activity):** A social-media-style feed that lists the active posts of other students with their details, with filters for activity category and hour.
* **Join Requests and Matching:** A student opens a post in the feed and sends the post owner a join request with a message. The owner accepts or declines the request; an accepted request is a match. One hour after the match, the post is removed from the feed automatically. Posts whose time window has ended are also removed. For example, Enes publishes a library post, Ahmet finds it in the feed and sends a request, Enes accepts it, and the post is removed one hour later. A match exists only for a single post and does not create a lasting connection between users; the application has no friend system.
* **In-App Messaging:** A text-based chat between the post owner and the requesting student, starting with the join request message. The users agree on the exact meeting point (e.g., "second floor, near the entrance") in this chat. The chat closes when the post is removed.
* **Notifications:** Push notifications for new join requests, request responses (accepted or declined), and incoming messages.
* **Safety and Moderation:** Blocking and reporting users, and an administrator panel for reviewing reports and suspending accounts.
* **Service-Based Backend and Cloud Deployment:** A REST API offered by the backend services, hosted on a cloud platform with a relational database.

### Out-of-Scope
* GPS and device location services, including real-time location tracking, live location sharing, map views, and distance-based matching. Location is limited to the campus venue selected in the activity post, and the exact meeting point is shared by the users in the chat.
* Automatic or swipe-based matching (e.g., swiping left or right on user profiles); students choose posts themselves in the feed.
* A friend system (sending friend requests, adding or removing friends, or keeping a friend list) and any other persistent social connection between users.
* Dating or romantic matching features.
* Voice and video calling.
* Integration with official university systems (student information system, campus card, facility reservation systems).
* Payment, in-app purchase, or monetization features.
* Multi-university (multi-tenant) support.
* A full-featured web client for students (the student interface is delivered as a mobile application).

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
* Claude Code (AI-assisted coding, test generation, and code review)
* GitHub Copilot (in-editor code completion)
* ChatGPT / Claude (requirements elicitation support and documentation drafting)

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
