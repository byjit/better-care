# Implementation Plan

- [x] 1. Set up database schema for consultations and messages
  - Create consultation table schema with patient/doctor relationships and status tracking
  - Create message table schema with consultation relationships and message types
  - Generate and run database migrations for new tables
  - _Requirements: 1.2, 1.3, 3.4, 5.4_

- [x] 2. Implement consultation data models and validation
  - Create TypeScript interfaces and Zod schemas for consultation entities
  - Implement validation functions for consultation creation and status transitions
  - Create select/insert/update schemas using drizzle-zod
  - Write unit tests for data model validation
  - _Requirements: 1.1, 1.2, 2.2, 5.1_

- [x] 3. Build consultation management API endpoints
  - Implement consultation router with CRUD operations
  - Create protected procedures for consultation creation, acceptance, rejection, and ending
  - Add role-based access control for consultation operations
  - _Requirements: 1.1, 1.2, 2.3, 2.4, 5.1, 5.2_

- [ ] 4. Implement doctor consultation assignment system
  - Create consultation-doctor relationship management functions
  - Implement consultation status transition logic (pending → active → inactive)
  - Add validation for doctor assignment and status changes
  - Dont write tests
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 5.1, 5.2_

- [ ] 5. Create consultation creation and doctor selection UI
  - Build consultation creation form component with problem description
  - Implement doctor selection interface with existing doctor list integration
  - Create consultation submission workflow that creates consultation and navigates to chat
  - Add form validation and error handling
  - _Requirements: 1.1, 1.4, 2.1_

- [ ] 6. Build role-based dashboard with consultation lists
  - Implement patient dashboard showing all consultations with status indicators
  - Create doctor dashboard with pending (highlighted) and active consultations
  - Add consultation filtering and status-based styling
  - Implement navigation from consultation list to chat interface
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 7.1, 7.2_

- [ ] 7. Implement message data layer and API
  - Create message table operations with consultation relationships
  - Build message router with send/retrieve operations
  - Add message validation and sanitization
  - Implement pagination for message history
  - Write tests for message CRUD operations
  - _Requirements: 3.3, 3.4_

- [ ] 8. Create real-time chat interface components
  - Build chat UI components (message bubbles, input field, message list)
  - Implement message sending and receiving functionality
  - Add sender identification and timestamp display
  - Create message history loading and pagination
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 9. Set up WebSocket infrastructure for real-time messaging
  - Configure WebSocket server integration with Express
  - Implement WebSocket event handlers for message broadcasting
  - Add connection management and room-based messaging
  - Create client-side WebSocket connection and event handling
  - _Requirements: 3.1, 3.2_

- [ ] 10. Integrate real-time messaging with chat interface
  - Connect chat UI to WebSocket for live message updates
  - Implement message synchronization between database and real-time updates
  - Add online/offline status indicators for chat participants
  - Handle connection errors and reconnection logic
  - _Requirements: 3.1, 3.2, 3.5_

- [ ] 11. Set up Redis for AI memory storage
  - Configure Redis connection and client setup
  - Implement AI memory data access layer with consultation scoping
  - Create memory CRUD operations with proper key management
  - Add memory cleanup for inactive consultations
  - _Requirements: 4.4_

- [ ] 12. Implement AI assistant integration
  - Set up Google Gemini AI SDK integration
  - Create AI request processing pipeline for @b mentions
  - Implement memory creation for doctor statements
  - Build memory querying system for contextual responses
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 13. Build AI assistant UI components
  - Create @b mention detection in chat input
  - Implement AI response display with system message styling
  - Add AI processing indicators and loading states
  - Create memory management interface for doctors
  - _Requirements: 4.1, 4.5_

- [ ] 14. Implement consultation access control and permissions
  - Add role-based access validation for consultation endpoints
  - Implement doctor access restrictions for inactive consultations
  - Create patient access preservation for all consultation statuses
  - Add audit logging for sensitive consultation operations
  - _Requirements: 5.3, 5.5, 8.1, 8.2, 8.5_

- [ ] 15. Create consultation session management
  - Implement consultation ending functionality for doctors only
  - Add session status updates and notifications
  - Create consultation history preservation after ending
  - Update sidebar and dashboard to reflect consultation status changes
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 6.3_

- [ ] 16. Build medical records and consultation history interface
  - Create medical records page showing patient consultation history
  - Implement consultation summary display with dates and doctors
  - Add chronological organization and filtering options
  - Create detailed consultation view with full conversation access
  - _Requirements: 7.3, 7.4, 9.1, 9.2, 9.3, 9.4_

- [ ] 17. Implement comprehensive error handling and validation
  - Add API error handling with specific error codes for consultation operations
  - Implement frontend error boundaries and toast notifications
  - Create input validation and sanitization for all forms
  - Add graceful degradation for real-time features
  - _Requirements: 8.4_

- [ ] 18. Add security measures and data protection
  - Implement data encryption for sensitive medical information
  - Add rate limiting for AI requests and API endpoints
  - Create input sanitization to prevent XSS attacks
  - Implement proper session validation and CSRF protection
  - _Requirements: 8.3, 8.4_

- [ ] 19. Create comprehensive test suite
  - Write unit tests for all consultation and message operations
  - Implement integration tests for API endpoints and WebSocket communication
  - Create end-to-end tests for complete user workflows
  - Add performance tests for database queries and real-time features
  - _Requirements: All requirements validation_

- [ ] 20. Integrate and wire all components together
  - Connect all frontend components with backend APIs
  - Ensure proper data flow between consultation creation, chat, and records
  - Verify role-based access control across all features
  - Test complete user journeys for both patient and doctor roles
  - _Requirements: All requirements integration_