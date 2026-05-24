# How It Works

## 1) Authentication and session bootstrap

1. User enters credentials in the frontend.
2. Frontend sends request to `/api/auth/*` endpoints.
3. Backend validates credentials and issues auth cookie/JWT.
4. Frontend runs `checkAuth()` from `client/src/store/authStore.js`.
5. Protected routes in `client/src/App.jsx` unlock dashboard features.

## 2) Course lifecycle

### Admin flow

- Create/edit courses and modules
- Publish learning content
- Manage categories, users and dashboard views

### Learner flow

- Discover and enroll in courses
- Consume asynchronous modules and synchronous sessions
- Track progress, notes and evaluations

## 3) Forum and collaboration

- Users can create or join topics
- Posts support interaction and feedback loops
- Admin workflows include moderation, reports and topic requests

## 4) Progress and attendance

- Learning events are persisted through progress routes/controllers
- Attendance in synchronous sessions is tracked and exposed in course views
- Data feeds dashboard and reporting screens

## 5) Certificate generation and verification

1. Completion criteria are validated server-side.
2. Backend generates certificate assets (PDF + QR metadata flow).
3. Certificate is exposed for verification via dedicated route.
4. Public verification page validates certificate identity.

## 6) Notifications and background automation

- Notification endpoints expose real-time updates to users
- FCM integration supports push workflows
- Scheduled jobs perform maintenance and lifecycle updates

## Main route groups

### Frontend routes (examples)

- `/` - landing page
- `/login` - authentication
- `/dashboard` - main authenticated workspace
- `/dashboard/my-courses` - learner area
- `/dashboard/course-managemnent` - admin course management
- `/forum` - community area
- `/verify-certificate/:certificateId` - certificate verification

### Backend route prefixes (examples)

- `/api/auth`
- `/api/cursos`
- `/api/progress`
- `/api/forum/*`
- `/api/certificados`
- `/api/notificacoes`
- `/api/admin/stats`

## End-to-end request path

```text
UI interaction -> React page/component -> Axios call -> Express route
-> Controller business logic -> Sequelize model/database -> JSON response
-> State update (Zustand) -> UI refresh
```
