# Requirements Document

## Introduction

The healthcare consultation platform is a comprehensive system that enables remote medical consultations through issue-specific communication channels. The platform connects patients with doctors while maintaining complete conversation history and providing AI assistance to both parties. The system emphasizes continuity of care by allowing patients to switch doctors within the same health issue channel while preserving all previous interactions and context.

## Requirements

### Requirement 1: User Authentication and Role Management

**User Story:** As a new user, I want to register using google and select my role (patient or doctor), so that I can access the appropriate features and interface for my user type.

#### Acceptance Criteria

1. WHEN a user visits the registration page THEN the system SHALL provide google oauth button
2. WHEN a user successfully registers THEN the system SHALL redirect them to a role selection page
3. WHEN a user selects their role (patient or doctor) THEN the system SHALL save this role to their profile and redirect them to the appropriate dashboard
4. WHEN a user attempts to login THEN the system SHALL authenticate their credentials and redirect them to their role-specific dashboard
5. IF a user has not selected a role THEN the system SHALL redirect them to the role selection page upon login

### Requirement 2: Patient Channel Management

**User Story:** As a patient, I want to create health issue channels and manage my consultations, so that I can organize my medical concerns and track my consultation history.

#### Acceptance Criteria

NOTE: The UI UX must be like that of Chat GPT's
1. WHEN a patient accesses their dashboard THEN the system SHALL display options to create new channels with a left sidebar provided by shadcn and view existing channels as a list in the left sidebar only.
2. WHEN a patient creates a new channel THEN the system SHALL require a descriptive name for the health issue (e.g., "Knee Pain")
3. WHEN a patient creates a channel THEN the system SHALL initialize the channel with the patient as the owner and set status to "waiting for doctor"
4. WHEN a patient views their channels THEN the system SHALL display active channels and past channels separately
5. WHEN a patient selects a channel THEN the system SHALL display the full conversation history and current status

### Requirement 3: Doctor Channel Discovery and Joining

**User Story:** As a doctor, I want to browse available patient channels and join consultations, so that I can provide medical assistance to patients who need help.

#### Acceptance Criteria
NOTE: The UI UX must be like that of Chat GPT's
1. WHEN a doctor accesses their dashboard THEN the system SHALL display a list of available patient channels awaiting consultation
2. WHEN a doctor views available channels THEN the system SHALL show the channel name, patient information, and creation time
3. WHEN a doctor joins a channel THEN the system SHALL update the channel status to "active consultation" and notify the patient
4. WHEN a doctor joins a channel THEN the system SHALL provide access to the complete conversation history
5. IF a channel already has an active doctor THEN the system SHALL not display it in the available channels list

### Requirement 4: Real-time Chat Communication

**User Story:** As a patient or doctor in an active consultation, I want to communicate in real-time through chat messages, so that we can have an effective consultation session.

#### Acceptance Criteria

1. WHEN a patient and doctor are in an active channel THEN the system SHALL enable real-time messaging between them
2. WHEN a user sends a message THEN the system SHALL immediately display it to both participants using WebSocket communication
3. WHEN a message is sent THEN the system SHALL store it permanently in the channel history with timestamp and sender information
5. WHEN a user joins an active channel THEN the system SHALL load and display the complete message history

### Requirement 5: Session Management and Doctor Transitions

**User Story:** As a patient, I want to be able to change doctors within the same health issue channel while maintaining all conversation history, so that I can get different medical opinions without losing context.

#### Acceptance Criteria

1. WHEN a doctor ends a consultation session THEN the system SHALL update the channel status to "session ended" and make the channel available for other doctors
2. WHEN a patient wants to connect with a new doctor THEN the system SHALL allow them to make the channel available for new doctor connections
3. WHEN a new doctor joins a previously consulted channel THEN the system SHALL provide access to the complete conversation history from all previous sessions
4. IF a patient tries to end a session THEN the system SHALL not allow this action (only doctors can end sessions)
5. WHEN a session ends THEN the system SHALL notify both the patient and doctor of the session termination

### Requirement 6: AI Assistant Integration

**User Story:** As a patient or doctor using the platform, I want an AI assistant to help with conversation summarization, note-taking, and health-related queries, so that I can have more effective and organized consultations.

#### Acceptance Criteria

1. WHEN a new doctor joins a channel with existing conversation history THEN the AI SHALL provide a summary of previous interactions
2. WHEN a user asks the AI a question within a channel THEN the system SHALL provide contextually relevant responses based on the conversation history
3. WHEN a consultation session is active THEN the AI SHALL be available to both patient and doctor for assistance
4. WHEN the AI provides information THEN the system SHALL clearly identify AI responses as distinct from human messages
5. WHEN a user requests conversation notes THEN the AI SHALL generate structured summaries of key discussion points

### Requirement 7: Dashboard and Navigation

**User Story:** As a user (patient or doctor), I want an intuitive dashboard that shows relevant information and easy navigation, so that I can efficiently manage my consultations and access platform features.

#### Acceptance Criteria

1. WHEN a patient logs in THEN the system SHALL display their active channels, past channels, and option to create new channels
2. WHEN a doctor logs in THEN the system SHALL display available patient channels and their active consultations
3. WHEN a user navigates between sections THEN the system SHALL provide clear visual indicators of their current location
4. WHEN a user has notifications THEN the system SHALL display them prominently on the dashboard
5. WHEN a user accesses their profile THEN the system SHALL allow them to view and update their account information

### Requirement 8: Data Persistence and Security

**User Story:** As a platform user, I want my data to be securely stored and always available, so that I can trust the platform with sensitive health information.

#### Acceptance Criteria

1. WHEN a user accesses their data THEN the system SHALL ensure they can only view information they are authorized to see
2. WHEN system errors occur THEN the system SHALL handle them gracefully without exposing sensitive information
3. WHEN users are inactive THEN the system SHALL automatically log them out after a secure timeout period
4. WHEN data is transmitted THEN the system SHALL use secure HTTPS connections for all communications