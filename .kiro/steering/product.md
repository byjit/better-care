# Product Overview

**better-care** is a healthcare consultation platform that facilitates communication between doctors and patients through issue-specific channels. The platform enables patients to create dedicated channels for specific health problems (e.g., "Knee Pain") and connect with doctors for remote consultations while maintaining complete conversation history and context.

## Core Concept

The platform operates on a channel-based system where:
- Patients create channels tied to specific health issues
- Doctors can join available patient channels for consultations
- When patients want to change doctors, they can disconnect from the current doctor and connect to a new one within the same channel
- New doctors have access to the complete conversation history, ensuring continuity of care
- An AI assistant is integrated into each channel to help both doctors and patients with queries, note-taking, information summarization, and reminders

## Key Features

### Authentication & User Management
- Email & password authentication with Better-Auth
- Post-registration profile selection (Patient or Doctor)
- Role-based access control and permissions

### Patient Experience
- Create new health issue channels with descriptive names
- View active and past consultation channels
- Connect with available doctors for consultations
- Switch doctors while maintaining channel history
- Access to AI assistant for health-related queries and reminders

### Doctor Experience
- Browse available patient channels requiring consultation
- Join patient channels to begin consultations
- Access complete conversation history when joining existing channels
- Exclusive ability to end consultation sessions
- AI assistance for note-taking and information analysis

### Channel System
- Issue-specific channels with persistent chat history
- Real-time WebSocket-based messaging
- Session management (only doctors can end sessions)
- Seamless doctor transitions with full context preservation

### AI Integration
- Channel-specific AI assistant for both patients and doctors
- Conversation summarization for new doctors joining channels
- Query assistance and information streamlining
- Note-taking and reminder capabilities

## Technical Architecture

The application follows a monorepo architecture with:
- React frontend with Next.js 15 and shadcn/ui components
- Express backend with tRPC for type-safe APIs
- Drizzle ORM with Turso database for data persistence
- Better-Auth for authentication and authorization
- WebSocket integration for real-time communication
- AI SDK integration for healthcare assistance features

## MVP Requirements

### Core Functionality
- User registration and role selection
- Patient and doctor dashboards
- Channel creation and management
- Real-time chat with WebSocket support
- Basic AI conversation summarization
- Session management with doctor-controlled endings

### Technical Requirements
- Minimal UI using default shadcn components (no custom styling)
- Real-time updates for active chats
- Proper error handling and loading states
- Type-safe API communication
- Database migrations and proper schema design
- Responsive design for web and mobile access