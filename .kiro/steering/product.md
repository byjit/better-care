---
inclusion: always
---

# Product Overview

**better-care** is a healthcare consultation platform enabling secure communication between doctors and patients through issue-specific chat channels with AI assistance.

## Core Architecture

### User Roles & Permissions
- **Patients**: Create consultations, select doctors, cannot end sessions
- **Doctors**: Join/reject consultations, exclusive session termination rights
- **AI Assistant**: Chat-scoped memory and query assistance via `@b` trigger

### Data Model Concepts
- **Consultations**: Issue-specific channels with persistent history
- **Sessions**: Active doctor-patient connections within consultations
- **AI Memory**: Redis-based, chat-scoped storage (doctor-write, both-read)

## Key User Flows

### Patient Journey
1. `/doctors` → Select doctor → Choose existing consultation OR create new
2. New consultation → Fill problem details form → Redirect to `/chat/{chatId}`
3. Chat with doctor and AI assistant using `@b` mentions
4. Cannot terminate consultations (doctor-only privilege)

### Doctor Journey  
1. Dashboard sidebar → View consultations pending,active both. Pending ones are highlighted with text-blue-400 colors. And active ones are normal. Ended consulations don't show up  in the sidebar. And the doctors don't have access to them.
2. Accept/reject pending consultations
3. Click consultation → Navigate to `/chat/{chatId}`
4. Exclusive ability to end consultation sessions
5. Create AI memories via `@b` statements/advice

### AI Integration Rules
- Trigger: `@b` mention in chat input
- Doctor statements → Create memory + respond
- Questions (any user) → Query using memories as RAG context
- Memory scope: Chat-specific, Redis key-value storage
- Visibility: All AI responses visible to both users

## Technical Conventions

### Route Structure
- `/doctors` - Doctor selection page
- `/chat/{chatId}` - Consultation interface
- `/dashboard` - Role-specific dashboards

### State Management
- Consultation states: `pending`, `active`, `inactive`
- Doctor access: Hide inactive consultations (data privacy)
- Real-time updates required for active chats

### UI Guidelines
- Use default shadcn/ui components only
- No custom styling beyond component variants
- Responsive design for web/mobile
- Proper loading states and error handling

## Database Design Principles
- Separate user profiles by role (Patient/Doctor)
- Consultation-doctor relationships with status tracking
- Message history with sender identification
- AI memory as key-value pairs scoped to consultation ID

## Security & Privacy
- Google OAuth via Better-Auth
- Role-based access control
- Doctor data access restricted to active consultations only
- Complete conversation history preserved for continuity of care