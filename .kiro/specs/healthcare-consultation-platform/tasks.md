# Implementation Plan

- [x] 1. Set up project foundation and database schema
  - Initialize monorepo structure with apps/web and apps/server directories
  - Configure Drizzle ORM with Turso database connection
  - Create database schema files for users, channels, sessions, and messages tables
  - Set up database migrations and connection utilities
  - _Requirements: 8.1, 8.4_

- [x] 2. Implement role selection page
  - Implement role selection page for post-authentication user setup
  - Create AuthGuard component for route protection
  - Set up tRPC auth router with session management and role update endpoints
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 3. Build core UI layout and navigation structure
  - Create AppLayout component with ChatGPT-inspired sidebar and main content area
  - Implement responsive Sidebar component using shadcn sidebar with collapsible functionality
  - Build Header component with user menu and logout functionality
  - Set up routing structure for patient and doctor dashboards
  - Configure shadcn/ui components and TailwindCSS styling
  - _Requirements: 7.3, 2.1, 3.1_

- [ ] 4. Develop patient channel management system
  - Implement NewChannel Dialog component for health issue channel creation
  - Build ChannelList component with active/past channel categorization
  - Create tRPC channel router with create, getMyChannels, and status management endpoints
  - Add channel status indicators (waiting, active, ended) with proper styling
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 5. Build doctor dashboard and channel discovery
  - Create DoctorDashboard component showing available patient channels
  - Implement channel browsing with patient information and creation time display
  - Add joinChannel functionality with session creation
  - Create tRPC endpoints for getAvailableChannels and joinChannel operations
  - Implement channel filtering to hide channels with active doctors
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 6. Implement real-time chat interface
  - Create ChatInterface component with message history and input areas
  - Build MessageList component with scrollable message display
  - Implement MessageBubble component with role-based styling (patient/doctor/AI)
  - Create MessageInput component with multi-line text area and send functionality
  - Add message persistence with tRPC message router (getMessages, sendMessage)
  - _Requirements: 4.1, 4.3, 4.5_- [ ] 7
. Add WebSocket integration for real-time messaging
  - Set up WebSocket server in Express backend for real-time communication
  - Implement WebSocket client connection in frontend chat interface
  - Add real-time message broadcasting between connected users in same channel
  - Create typing indicators and connection status displays
  - Handle WebSocket reconnection and error scenarios
  - _Requirements: 4.2, 4.4_

- [ ] 8. Develop session management and doctor transitions
  - Implement session ending functionality (doctor-only capability)
  - Create session status tracking and updates in database
  - Add "Request New Doctor" functionality for patients after session ends
  - Build session transition logic to maintain conversation history
  - Create notifications for session status changes
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 9. Integrate AI assistant functionality
  - Set up AI SDK with Google Gemini integration
  - Create AIAssistant component with conversation summarization
  - Implement AI question answering based on channel conversation context
  - Add AI message display with distinct styling (purple accent, AI icon)
  - Create tRPC AI router with summarizeConversation and askQuestion endpoints
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 10. Implement comprehensive error handling and loading states
  - Add global error boundary for unhandled React errors
  - Create loading states with skeleton loaders for message history and channel lists
  - Implement form validation for channel creation and message input
  - Add toast notifications for user feedback using shadcn/ui components
  - Create proper error handling in tRPC routers with appropriate error codes
  - _Requirements: 8.2, 8.3_

- [ ] 11. Add responsive design and mobile optimization
  - Implement mobile-responsive sidebar with hamburger menu
  - Create touch-friendly button sizes and interactions for tablet/mobile
  - Add swipe gestures for navigation on mobile devices
  - Optimize chat interface for mobile with bottom-fixed message input
  - Test and adjust layout for desktop, tablet, and mobile breakpoints
  - _Requirements: 7.3_

- [ ] 12. Implement user profile and notification system
  - Create user profile page with account information display and editing
  - Add notification system for session status changes and new messages
  - Implement dashboard notification display with proper visual indicators
  - Create user avatar display and management functionality
  - Add automatic logout functionality for inactive users
  - _Requirements: 7.4, 7.5, 8.3_

- [ ] 13. Add comprehensive testing suite
  - Write unit tests for React components using React Testing Library
  - Create API endpoint tests for all tRPC routers
  - Implement database model tests with test database setup
  - Add integration tests for authentication flow and role selection
  - Create end-to-end tests for complete user workflows (patient and doctor)
  - Test WebSocket functionality and real-time message delivery
  - _Requirements: All requirements validation_

- [ ] 14. Finalize deployment configuration and optimization
  - Configure production environment variables for Turso database and Google OAuth
  - Set up proper HTTPS configuration for secure data transmission
  - Implement rate limiting for API endpoints to prevent abuse
  - Add database connection pooling and error recovery mechanisms
  - Create production build optimization and deployment scripts
  - _Requirements: 8.1, 8.4_