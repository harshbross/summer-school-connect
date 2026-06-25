# Product Requirements Document
## Summer School Community Platform

**Version:** 1.0  
**Date:** June 25, 2026  
**Status:** Draft

---

## 1. Overview

### 1.1 Product Summary

A private, invite-only community platform for summer school cohorts. Students get a personal profile card showcasing their background, college, and interests. The platform enables peer discovery, information sharing, and organized event participation — all within a safe, program-managed environment.

### 1.2 Problem Statement

Summer school students arrive from different colleges and backgrounds. Without a structured platform, connections are surface-level, event communication is scattered across WhatsApp groups, and the cohort experience ends when the program does. This platform gives the cohort a persistent home.

### 1.3 Target Users

| Role | Description |
|---|---|
| **Student** | Enrolled summer school participant who creates a profile and engages with peers |
| **Admin / Organizer** | Program staff who manages student access, events, and content moderation |

---

## 2. Goals & Success Metrics

| Goal | Metric |
|---|---|
| All students onboarded within Day 1 | 100% of enrolled students have a profile by end of Day 1 |
| Active daily engagement | ≥ 70% of students visit the platform on any given program day |
| Event attendance tracking | RSVP-to-attendance conversion rate ≥ 80% |
| Peer discovery | Average student connects with ≥ 5 peers in the first week |
| Information sharing | ≥ 3 posts/resources shared per student over the program duration |

---

## 3. Features & Requirements

---

### 3.1 Authentication & Onboarding

**Description:** Students join via an invite link sent by the admin. No public sign-up. First login triggers a guided profile setup wizard.

**Requirements:**

- Admin generates unique invite links per student (or a single cohort-wide link with an enrollment cap)
- Students sign up with email + password (or Google SSO)
- Email verification required before access is granted
- First login → mandatory profile setup wizard (cannot skip)
- Admin can revoke access at any time
- Session persists for 30 days; re-auth required after expiry

**Onboarding Wizard Steps:**
1. Upload profile photo
2. Enter name, pronouns (optional), and home city
3. Enter college / university name, year, and major
4. Write a short bio (max 300 characters)
5. Add up to 5 interest tags (from a predefined list + custom option)
6. Add optional social links (LinkedIn, Instagram, personal website)
7. Confirm and publish card

---

### 3.2 Student Profile Card

**Description:** Each student has a public-facing profile card visible to all platform members. It is the primary unit of identity on the platform.

**Card Fields:**

| Field | Required | Notes |
|---|---|---|
| Full name | Yes | |
| Profile photo | Yes | Cropped to square, min 200×200px |
| Pronouns | No | |
| Home city / country | Yes | |
| College / University | Yes | |
| Year of study | Yes | Freshman / Sophomore / Junior / Senior / Grad |
| Major / Field of study | Yes | |
| Short bio | Yes | Max 300 characters |
| Interest tags | Yes | Min 1, max 5 |
| LinkedIn URL | No | |
| Instagram handle | No | |
| Personal website | No | |
| Fun fact | No | Max 150 characters |

**Card Behaviors:**
- Cards are displayed in a browsable directory (grid + list view)
- Clicking a card opens a full profile page
- Students can edit their own card at any time after onboarding
- Admin can edit or hide any card
- Cards show a "Joined [N] days ago" badge

**Directory / Browse Features:**
- Search by name
- Filter by college, year, major, interest tags, home city
- Sort by: Most recent, Name A–Z, College
- "People you haven't connected with yet" smart section

---

### 3.3 Information Sharing / Feed

**Description:** A structured feed for sharing resources, updates, questions, and discussions within the cohort.

**Post Types:**

| Type | Description |
|---|---|
| **Announcement** | Admin-only; pinned to top; highlighted visually |
| **Resource** | Share a link, file, or document (PDFs, slides, articles) |
| **Discussion** | Open-ended question or topic for the cohort |
| **Introduction** | Auto-generated when a new student joins; can be customized |
| **Poll** | Ask the cohort a question with selectable options |

**Feed Requirements:**
- Chronological by default; announcements always pinned at top
- Students can post Resources, Discussions, and Polls
- Admin can post all types including Announcements
- Reactions on each post (like, insightful, 🔥, ❤️)
- Threaded comments on each post
- Edit/delete own posts (with edit history visible to admin)
- Admin can pin, hide, or delete any post
- File upload support: PDF, PPTX, DOCX, images (max 20MB per file)
- Link preview cards when a URL is pasted
- @mention a student in a post or comment (triggers notification)
- Hashtag support for categorization (e.g. #resources, #questions, #fun)
- Feed can be filtered by post type and hashtag

---

### 3.4 Event Management

**Description:** The admin creates and manages events. Students RSVP and receive reminders. Attendance is tracked.

**Event Fields:**

| Field | Required | Notes |
|---|---|---|
| Title | Yes | |
| Description | Yes | Rich text |
| Date & time | Yes | With timezone |
| Location | Yes | Physical address or virtual meeting link |
| Event type | Yes | Workshop / Social / Guest Talk / Field Trip / Other |
| Capacity | No | If set, RSVP closes when full |
| Cover image | No | |
| Attachments | No | Pre-read materials, agendas |
| RSVP deadline | No | Defaults to event start time |
| Tags | No | |

**Event Lifecycle:**

1. Admin creates event (draft or published)
2. Students receive in-app + email notification when published
3. Students RSVP: Going / Not Going / Maybe
4. Reminders sent: 24 hours before + 1 hour before
5. Admin marks attendance post-event (manual or QR check-in)
6. Event archived with attendance log

**Event Views:**
- Upcoming events list (sorted by date)
- Calendar view (month/week)
- Past events with photo galleries (admin uploads)
- My Events: events the student RSVP'd to or attended

**Admin Event Tools:**
- Create / edit / cancel events
- See RSVP list with student details
- Export RSVP list as CSV
- QR code check-in: admin scans student's QR on their profile page
- Add recap photos and notes after the event
- Duplicate an event (for recurring events)

---

### 3.5 Notifications

**Description:** Students stay informed through in-app and email notifications.

**Notification Triggers:**

| Trigger | In-App | Email |
|---|---|---|
| New Announcement | ✅ | ✅ |
| New Event published | ✅ | ✅ |
| Event reminder (24h) | ✅ | ✅ |
| Event reminder (1h) | ✅ | ❌ |
| Someone @mentions you | ✅ | ✅ |
| Comment on your post | ✅ | ✅ (digest) |
| New student joins cohort | ✅ | ❌ |
| RSVP confirmation | ✅ | ✅ |
| Admin sends direct message | ✅ | ✅ |

**Notification Preferences:**
- Students can opt out of email notifications per category
- In-app notification bell with unread count
- Notification history (last 60 days)

---

### 3.6 Admin Dashboard

**Description:** A dedicated view for program administrators to manage the platform.

**Admin Capabilities:**

**Student Management:**
- View all students with profile completion status
- Invite new students (individual or bulk CSV upload)
- Deactivate / reactivate student accounts
- Reset a student's password
- Export student directory as CSV (name, college, email, join date)
- View any student's profile and edit if needed

**Content Moderation:**
- View all posts and comments
- Hide or delete any post/comment
- Flag and review reported content
- Send a private warning to a student

**Event Management:** (see 3.4)

**Analytics:**
- Daily active users (chart)
- Profile completion rate
- Post/comment volume by day
- Event RSVP and attendance rates
- Top hashtags and interest tags in the cohort
- Engagement by student (for identifying students who may need outreach)

**Platform Settings:**
- Edit cohort name and dates
- Upload cohort logo / cover photo
- Customize interest tag list
- Toggle features on/off (e.g. hide feed, disable polls)
- Set platform timezone

---

### 3.7 Direct Messaging (Phase 2)

**Description:** Private 1:1 messaging between students. Included here as a planned future feature.

**Requirements (Phase 2):**
- 1:1 text messaging only (no group DMs in Phase 1)
- Admin can see flagged/reported conversations
- Students can block another student
- Message history persists for duration of the program

---

## 4. Data Model (High-Level)

```
User
  - id, email, password_hash, role (student | admin)
  - created_at, last_active_at, is_active

Profile
  - user_id (FK)
  - full_name, pronouns, home_city, profile_photo_url
  - college, year, major, bio, fun_fact
  - linkedin_url, instagram_handle, website_url
  - interest_tags[] (FK → Tag)
  - updated_at

Post
  - id, author_id (FK → User), type (announcement | resource | discussion | introduction | poll)
  - content (rich text), attachments[], link_url, link_preview
  - is_pinned, is_hidden
  - created_at, updated_at

Comment
  - id, post_id (FK), author_id (FK), content, parent_comment_id (nullable, for threading)
  - created_at

Reaction
  - post_id (FK), user_id (FK), emoji_type

Event
  - id, title, description (rich text), event_type
  - start_at, end_at, timezone
  - location_text, meeting_url, cover_image_url
  - capacity, rsvp_deadline
  - status (draft | published | cancelled | past)
  - created_by (FK → User)

RSVP
  - event_id (FK), user_id (FK), status (going | not_going | maybe)
  - created_at, updated_at

Attendance
  - event_id (FK), user_id (FK), checked_in_at

Notification
  - id, user_id (FK), type, content, is_read, link
  - created_at

Tag
  - id, label, is_custom
```

---

## 5. Pages & Navigation

| Page | Route | Access |
|---|---|---|
| Login / Sign Up | `/login` | Public (invite only) |
| Onboarding Wizard | `/onboarding` | Students (first login) |
| Home / Feed | `/` | Students, Admins |
| Student Directory | `/directory` | Students, Admins |
| Student Profile | `/students/:id` | Students, Admins |
| Edit My Profile | `/profile/edit` | Student (own) |
| Events List | `/events` | Students, Admins |
| Event Detail | `/events/:id` | Students, Admins |
| Create / Edit Event | `/events/new`, `/events/:id/edit` | Admin only |
| Notifications | `/notifications` | Students, Admins |
| Admin Dashboard | `/admin` | Admin only |
| Admin: Students | `/admin/students` | Admin only |
| Admin: Analytics | `/admin/analytics` | Admin only |
| Admin: Settings | `/admin/settings` | Admin only |
| 404 / Error | — | All |

---

## 6. Non-Functional Requirements

| Category | Requirement |
|---|---|
| **Performance** | Pages load in under 2 seconds on a standard connection |
| **Mobile Responsiveness** | All pages fully functional on mobile (375px+) |
| **File Storage** | Profile photos and attachments stored in cloud object storage |
| **Security** | All routes protected; students cannot access other students' data via API without auth |
| **Privacy** | Platform is entirely private; no public-facing pages except login |
| **Data Retention** | Platform data retained for 1 year post-program; admin can export all data |
| **Accessibility** | WCAG 2.1 AA compliance for core flows |
| **Browser Support** | Chrome, Firefox, Safari, Edge (last 2 major versions) |

---

## 7. Out of Scope (v1.0)

- Group direct messaging
- Video calling / live sessions
- Native mobile app (web-responsive only)
- Integration with LMS (Canvas, Moodle, etc.)
- Public-facing student portfolios
- Payments or ticketed events
- Gamification / points / leaderboards
- AI-generated content or matching

---

## 8. Open Questions

1. **Invite mechanism:** Should each student get a unique invite link, or one shared cohort code? (Unique links are more secure; cohort codes are simpler to distribute.)
2. **Multiple cohorts:** Should the platform support multiple summer school programs simultaneously, or is it single-cohort?
3. **Profile visibility:** Can students hide specific fields (e.g. social links) from peers, or is the full card always visible?
4. **File storage limit:** What is the total storage budget per program?
5. **Event attendance tracking:** Is QR check-in required, or is manual admin check-in sufficient?
6. **Post-program access:** How long should students retain access after the program ends?

---

## 9. Phased Rollout

| Phase | Features | Timeline |
|---|---|---|
| **Phase 1 — Core** | Auth & onboarding, profile cards, directory, basic feed (posts + comments), event management, admin dashboard | Day 1 of program |
| **Phase 2 — Engagement** | Reactions, polls, hashtags, link previews, notification preferences, analytics | Week 2 |
| **Phase 3 — Social** | 1:1 messaging, photo galleries on past events, post-program alumni archive | Post-program |

---

*End of PRD v1.0*
