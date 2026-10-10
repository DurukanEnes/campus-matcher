# Project Charter: CampusMatcher

## 1. Project Purpose and Objectives
CampusMatcher is a mobile application that enables university students to find companions for everyday campus activities such as studying at the library, working out at the gym, or having a meal at the cafeteria. A student specifies the activity, location, and time window they plan to attend, and the system matches them with other students who have submitted compatible plans. The project aims to reduce social isolation among students, make it easier to meet peers with similar routines, and encourage participation in campus life through a safe, verified, and university-exclusive platform.

## 2. Stakeholders & Roles
* **Product Owner:** Sultan Çoğay
* **Software Engineering Team:**
    * Enes Durukan : Project Manager / Mobile Developer
    * Erinç Özarı : Mobile Team Lead / Mobile Developer
    * Mohammed Alashi : Backend Team Lead / Backend Developer
    * Ali Çetin : DevOps Lead / Backend Developer (Secondary: DevOps / Cloud Engineer)
    * İbrahim Meral : QA Lead / Backend Developer (Secondary: QA / Test Engineer)
* **GH Repo/Project URL:** {_Do not fill this field in yet; to be filled after charter approval_}

## 3. Project Scope
### Project domain
The application belongs to the domain of social networking and campus life within higher education. The key users are enrolled university students who wish to share daily campus activities with peers, together with system administrators who are responsible for moderation and platform management.

### In-Scope
* **User Registration and Authentication:** Account creation restricted to verified university e-mail addresses, secure login, and token-based session management.
* **Role-Based Authorization:** Distinct permissions for students and administrators.
* **User Profile Management:** Management of basic profile information, faculty/department, interests, and activity preferences (e.g., workout type, study subject).
* **Activity Plan Submission:** Creation, editing, and cancellation of activity plans that specify the activity category (library, gym, cafeteria), location, and time window.
* **Matching Engine:** Automatic matching of users based on activity category, location, overlapping time windows, and stated preferences.
* **Match Lifecycle Management:** Viewing suggested matches, accepting or declining them, and cancelling confirmed matches.
* **In-App Messaging:** A text-based chat between matched users to coordinate the meeting.
* **Notifications:** Push notifications for new matches, match responses, and incoming messages.
* **Safety and Moderation:** Blocking and reporting users, and an administrator panel for reviewing reports and suspending accounts.
* **Service-Based Backend and Cloud Deployment:** A REST API offered by the backend services, hosted on a cloud platform with a relational database.

### Out-of-Scope
* Real-time GPS location tracking of users.
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
