# CampusMatcher — Test Strategy

**WBS:** 10.1 — Test Strategy and Test-First Setup  
**QA Lead:** İbrahim Meral  
**Status:** Initial Implementation

## 1. Purpose

This document defines the testing strategy for CampusMatcher, including test levels, tools, coverage reporting, and quality assurance procedures.

The objective is to detect defects early, verify functional requirements, and establish a repeatable testing process throughout development.

Testing will continue throughout the development lifecycle as new features and components are implemented.

## 2. Testing Tools

| Component | Tool | Purpose |
|---|---|---|
| Mobile (React Native / Expo) | Jest | Automated JavaScript/TypeScript tests |
| Mobile UI | React Native Testing Library | Component rendering and interaction tests |
| Backend (FastAPI) | Pytest | Unit and API integration tests |
| Coverage | Jest Coverage / pytest-cov | Measure executed code coverage |
| CI | GitHub Actions | Automated test execution (DevOps integration) |

## 3. Testing Levels

### Unit Testing

Verify individual functions, components, and validation rules in isolation.

Examples:
- Activity time-window validation
- Mobile form validation
- Feed filtering logic

### Integration Testing

Verify interactions between components and services.

Examples:
- Registration API and database
- Join requests and matching logic
- Chat service and authentication

### End-to-End Testing

Verify complete user workflows.

Example:

Registration → Login → Create Activity → Join Request → Accept Request → Chat

### Security Testing

Verify authentication, authorization, user isolation, and access restrictions.

### Performance Testing

Evaluate response times and behavior under expected workloads.

## 4. Test-First Development Approach

The project adopts a test-first approach where applicable:

1. **Red:** Write a test describing expected behavior and confirm that it fails.
2. **Green:** Implement the minimum functionality required to pass the test.
3. **Refactor:** Improve the implementation while keeping tests passing.

Test failures must be investigated before code is considered ready for integration.

## 5. Coverage Reporting

Mobile test coverage is generated using the following commands from the project root:

```bash
cd mobile
npm test -- --coverage --runInBand --watch=false
```

The Jest configuration includes all mobile source files in coverage collection, including files without tests. Coverage reports are generated in the project-level `coverage/mobile/` directory and are excluded from version control.

Backend coverage will be configured after the FastAPI scaffold becomes available.

**Mobile test baseline (November 6, 2026):**

- Test suites: 3 passed
- Tests: 4 passed
- Overall statement coverage: 100%
- Overall line coverage: 100%
- Scope: `HomeScreen.tsx`, `client.ts`, and `AppNavigator.tsx`

The current automated tests verify:

- HomeScreen renders the application name correctly.
- API client uses the configured base URL or the default fallback.
- API client timeout is set to 10 seconds.
- AppNavigator renders the Home screen through mocked navigation components.

The current coverage results apply only to the existing mobile source files. They do not demonstrate complete application functionality or guarantee the absence of defects.

Coverage targets and mandatory acceptance thresholds will be finalized with the team.

## 6. Pull Request Quality Checks

Before a Pull Request is merged:

- Relevant automated tests should be executed.
- Existing tests should remain passing.
- Test results and known limitations should be reported.
- Changes should undergo human review.
- Failed tests must not be represented as passing.

**Pending team decision:** Whether every feature PR must include new automated tests and which developer is responsible for writing them.

## 7. Responsibilities

The QA Lead coordinates test strategy, test setup, coverage reporting, and test quality.

The DevOps Lead manages CI/CD workflows in coordination with QA.

Developer-level test ownership and mandatory testing policies are pending team approval.

## 8. Current Setup Status

| Item | Status |
|---|---|
| Jest configuration | Configured and verified |
| Mobile unit tests | 4 tests passing |
| Mobile coverage reporting | Configured and verified |
| Backend Pytest setup | Pending backend scaffold |
| CI test integration | Pending coordination with DevOps |
| Complete integration and E2E tests | Scheduled for later WBS activities |

## 9. Known Limitations and Next Steps

The current test suite covers the initial mobile scaffold only. The navigation test uses mocked navigation components and does not verify actual screen transitions. The API client tests verify configuration but do not perform HTTP requests.

As new features are implemented, additional automated tests will be introduced to verify their behavior.

Next steps:

- Integrate Pytest after the FastAPI backend scaffold becomes available.
- Coordinate test execution and coverage reporting with the DevOps Lead.
- Finalize developer test ownership and Pull Request testing requirements after the team meeting.
- Expand mobile unit and component tests as new screens are developed.
- Implement integration, security, performance, and end-to-end tests according to the project schedule.
- Review and update coverage results throughout development.