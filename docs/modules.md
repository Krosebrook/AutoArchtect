# AutoArchitect Module Documentation

## Overview

This document provides a comprehensive breakdown of all modules, components, views, and services in AutoArchitect. Each module is documented with its purpose, dependencies, inputs/outputs, and integration points.

---

## Table of Contents

1. [Views (User-Facing Pages)](#views-user-facing-pages)
2. [Components (Reusable UI)](#components-reusable-ui)
3. [Services (Business Logic)](#services-business-logic)
4. [Types (TypeScript Definitions)](#types-typescript-definitions)
5. [PWA Infrastructure](#pwa-infrastructure)
6. [Module Dependencies](#module-dependencies)

---

## Views (User-Facing Pages)

### 1. AutomationGeneratorView
**File**: `views/AutomationGeneratorView.tsx`

**Purpose**: Primary interface for generating AI-powered automation workflows

**Key Features**:
- Platform selection (Zapier, n8n, LangChain, Make, etc.)
- Natural language workflow description
- AI-powered workflow generation
- Step-by-step workflow visualization
- Code snippet export
- Save to vault functionality

**State Management**:
- `platform` (Platform): Selected automation platform
- `description` (string): User's workflow description
- `result` (AutomationResult | null): Generated workflow
- `loading` (boolean): Generation in progress
- `error` (string): Error message if generation fails

**Key Functions**:
```typescript
handleGenerate(): Promise<void>
  - Calls geminiService.generateAutomation()
  - Updates result state
  - Handles errors

handleSave(): Promise<void>
  - Saves blueprint to IndexedDB via storage service
  - Generates unique ID
  - Includes version and timestamp

handleNavigateToAudit(): void
  - Navigates to AuditView with current blueprint
  - Passes blueprint via props
```

**Dependencies**:
- `geminiService.generateAutomation()`
- `storageService` (via Dexie)
- `AutomationResult` type
- Navigation callbacks

**Integration Points**:
- Calls AuditView, DeploymentHubView, LogicSandboxView with generated blueprint
- Saves to VaultView
- Exports code for external use

---

### 2. ChatbotView
**File**: `views/ChatbotView.tsx`

**Purpose**: Conversational AI assistant for automation questions and guidance

**Key Features**:
- Real-time chat interface
- Message history display
- Streaming responses (future)
- Context-aware assistance
- Copy message functionality

**State Management**:
- `messages` (ChatMessage[]): Conversation history
- `input` (string): Current user input
- `loading` (boolean): Waiting for AI response

**Key Functions**:
```typescript
handleSendMessage(message: string): Promise<void>
  - Adds user message to history
  - Calls geminiService.chatWithAssistant()
  - Adds AI response to history

resetChat(): void
  - Clears message history
  - Calls geminiService.resetChat() (no-op currently)
```

**Dependencies**:
- `geminiService.chatWithAssistant()`
- `ChatMessage` type
- Local state only (no persistence)

**Planned Enhancements**:
- Conversation persistence in IndexedDB
- Multi-turn context awareness
- Suggested questions
- Code snippet formatting in responses

---

### 3. ImageAnalysisView
**File**: `views/ImageAnalysisView.tsx`

**Purpose**: Extract automation workflows from diagrams and visual designs

**Key Features**:
- Image upload (drag-and-drop or file picker)
- Image preview
- AI-powered visual analysis
- Workflow extraction from diagrams
- Export analyzed workflow

**State Management**:
- `image` (File | null): Uploaded image
- `imagePreview` (string): Base64 preview URL
- `prompt` (string): Analysis instructions
- `analysis` (string): AI-generated analysis
- `loading` (boolean): Analysis in progress

**Key Functions**:
```typescript
handleImageUpload(file: File): void
  - Reads file to base64
  - Updates preview state

handleAnalyze(): Promise<void>
  - Converts image to base64
  - Calls geminiService.analyzeImage()
  - Displays analysis results
```

**Dependencies**:
- `geminiService.analyzeImage()`
- FileReader API for image processing
- Base64 encoding utilities

**Supported Formats**:
- JPEG, PNG, WebP, GIF
- Max size: 20MB (Gemini limit)

---

### 4. TTSView (Text-to-Speech)
**File**: `views/TTSView.tsx`

**Purpose**: Generate voice narration for automation procedures and manuals

**Key Features**:
- Text input for synthesis
- Voice selection (multiple voices)
- Audio generation and playback
- Download audio file
- Procedure manual generation

**State Management**:
- `text` (string): Text to synthesize
- `voice` (string): Selected voice ID
- `audioData` (string): Base64-encoded audio
- `isPlaying` (boolean): Audio playback state
- `loading` (boolean): Generation in progress

**Key Functions**:
```typescript
handleGenerateSpeech(): Promise<void>
  - Calls geminiService.generateSpeech()
  - Receives base64 audio data
  - Enables playback

handlePlayAudio(): void
  - Decodes base64 audio
  - Creates AudioContext
  - Plays audio buffer

handleDownload(): void
  - Converts base64 to blob
  - Downloads as .wav file
```

**Dependencies**:
- `geminiService.generateSpeech()`
- `geminiService.generateProcedureManual()`
- Web Audio API
- Base64 encoding/decoding utilities

**Audio Configuration**:
- Format: PCM (uncompressed)
- Sample Rate: 24000 Hz
- Channels: 1 (mono)

---

### 5. LiveArchitectView
**File**: `views/LiveArchitectView.tsx`

**Purpose**: Real-time voice interaction with AI automation architect

**Key Features**:
- Bidirectional voice communication
- Real-time audio streaming
- Live transcription
- Session management
- Voice activity detection

**State Management**:
- `session` (LiveSession | null): Active WebSocket session
- `isConnected` (boolean): Connection status
- `messages` (Message[]): Conversation history
- `isRecording` (boolean): Microphone active

**Key Functions**:
```typescript
handleConnect(): Promise<void>
  - Calls geminiService.connectToLiveArchitect()
  - Sets up WebSocket callbacks
  - Initializes audio context

handleDisconnect(): void
  - Closes WebSocket session
  - Stops audio streaming
  - Cleanup resources

onMessage(message: any): void
  - Handles incoming audio/text
  - Updates conversation history
  - Plays audio response
```

**Dependencies**:
- `geminiService.connectToLiveArchitect()`
- WebSocket API
- Web Audio API
- MediaRecorder API

**Connection Lifecycle**:
1. `onopen` - Session established
2. `onmessage` - Receive messages/audio
3. `onerror` - Handle errors
4. `onclose` - Cleanup and reconnect

---

### 6. LogicSandboxView
**File**: `views/LogicSandboxView.tsx`

**Purpose**: Simulate and test automation workflows before deployment

**Key Features**:
- Load blueprints from vault
- Input sample test data
- Dry-run workflow simulation
- Step-by-step result visualization
- Success/failure indicators
- Export simulation results

**Props**:
- `activeBlueprint` (AutomationResult | null): Pre-loaded blueprint from other views

**State Management**:
- `blueprint` (AutomationResult | null): Workflow to simulate
- `inputData` (string): Sample input (JSON format)
- `simulation` (SimulationResponse | null): Simulation results
- `loading` (boolean): Simulation in progress

**Key Functions**:
```typescript
handleSimulate(): Promise<void>
  - Validates input data (JSON)
  - Calls geminiService.simulateAutomation()
  - Displays step-by-step results

loadFromVault(blueprintId: string): Promise<void>
  - Fetches blueprint from IndexedDB
  - Loads into simulation view
```

**Dependencies**:
- `geminiService.simulateAutomation()`
- `storageService` (Blueprint repository)
- `SimulationResponse` type

**Simulation Output**:
```typescript
{
  overallStatus: 'success' | 'failure',
  summary: string,
  stepResults: [{
    stepId: number,
    status: 'success' | 'failure' | 'skipped',
    output: string,
    reasoning: string
  }]
}
```

---

### 7. AuditView
**File**: `views/AuditView.tsx`

**Purpose**: Security analysis and cost estimation for workflows

**Key Features**:
- Security score (0-100)
- Vulnerability identification (low/medium/high)
- Cost estimation (monthly)
- ROI analysis
- Optimization recommendations
- Remediation guidance

**Props**:
- `activeBlueprint` (AutomationResult | null): Blueprint to audit

**State Management**:
- `blueprint` (AutomationResult | null): Workflow being audited
- `audit` (AuditResult | null): Audit results
- `loading` (boolean): Audit in progress

**Key Functions**:
```typescript
handleAudit(): Promise<void>
  - Calls geminiService.auditAutomation()
  - Displays security score and vulnerabilities
  - Shows cost estimates

applyOptimization(tip: string): void
  - Highlights optimization in blueprint
  - Provides implementation guidance
```

**Dependencies**:
- `geminiService.auditAutomation()`
- `AuditResult` type

**Audit Checks**:
- API key exposure
- Insecure data transmission
- Missing input validation
- Rate limiting vulnerabilities
- Authentication weaknesses
- OWASP Top 10 alignment

---

### 8. DeploymentHubView
**File**: `views/DeploymentHubView.tsx`

**Purpose**: Generate deployment configurations and CI/CD pipelines

**Key Features**:
- Identify required secrets
- Generate CI/CD pipeline stages
- Export Docker, Kubernetes configs
- Environment variable templates
- Deployment readiness checklist

**Props**:
- `activeBlueprint` (AutomationResult | null): Blueprint to deploy

**State Management**:
- `blueprint` (AutomationResult | null): Workflow to deploy
- `config` (DeploymentConfig | null): Deployment configuration
- `selectedFormat` (string): Export format (Docker, K8s, etc.)
- `loading` (boolean): Configuration generation in progress

**Key Functions**:
```typescript
handleGenerateConfig(): Promise<void>
  - Calls geminiService.identifySecrets()
  - Generates deployment configuration
  - Shows secrets and pipeline

handleExport(format: string): void
  - Exports configuration in selected format
  - Downloads as file
```

**Dependencies**:
- `geminiService.identifySecrets()`
- `DeploymentConfig`, `PipelineStage` types

**Export Formats**:
- Docker Compose
- Kubernetes manifest
- GitHub Actions workflow
- GitLab CI pipeline
- Environment variable template

---

### 9. VaultView
**File**: `views/VaultView.tsx`

**Purpose**: Manage saved automation blueprints with versioning

**Key Features**:
- List all saved blueprints
- Search and filter by platform
- Sort by date, name, platform
- Load blueprint to other views
- Delete blueprints
- Export blueprints
- Version management

**State Management**:
- `blueprints` (SavedBlueprint[]): All saved blueprints
- `searchQuery` (string): Search filter
- `selectedPlatform` (Platform | 'all'): Platform filter
- `loading` (boolean): Loading blueprints from storage

**Key Functions**:
```typescript
loadBlueprints(): Promise<void>
  - Fetches all blueprints from IndexedDB
  - Applies filters and sorting

handleSearch(query: string): void
  - Filters blueprints by name or description

handleLoadBlueprint(id: string, targetView: AppView): void
  - Loads blueprint to simulation, audit, or deployment
  - Navigates to target view

handleDelete(id: string): Promise<void>
  - Deletes blueprint from IndexedDB
  - Refreshes list
```

**Dependencies**:
- `storageService` (Blueprint repository)
- `SavedBlueprint` type
- Navigation callbacks

---

### 10. ComparatorView
**File**: `views/ComparatorView.tsx`

**Purpose**: Compare automation platforms for specific use cases

**Key Features**:
- Task description input
- Multiple platform selection
- Complexity comparison (low/medium/high)
- Pros/cons analysis
- Configuration examples
- AI recommendation

**State Management**:
- `task` (string): Use case description
- `selectedPlatforms` (Platform[]): Platforms to compare
- `comparison` (ComparisonResult | null): Comparison results
- `loading` (boolean): Analysis in progress

**Key Functions**:
```typescript
handleCompare(): Promise<void>
  - Validates task and platforms
  - Calls geminiService.benchmarkPlatforms()
  - Displays comparison results

handlePlatformToggle(platform: Platform): void
  - Adds/removes platform from selection
  - Min 2, max 5 platforms
```

**Dependencies**:
- `geminiService.benchmarkPlatforms()`
- `ComparisonResult` type

**Comparison Criteria**:
- Implementation complexity
- Learning curve
- Cost efficiency
- Feature availability
- Community support
- Integration ecosystem

---

### 11. TerminalView
**File**: `views/TerminalView.tsx`

**Purpose**: Command-line interface for power users

**Key Features**:
- Command history
- Command auto-completion
- Direct AI API access
- Key management commands
- Batch operations
- Export/import commands

**State Management**:
- `entries` (TerminalEntry[]): Command history
- `input` (string): Current command
- `commandHistory` (string[]): Previous commands for ↑/↓ navigation
- `historyIndex` (number): Current position in history

**Key Functions**:
```typescript
handleCommand(cmd: string): Promise<void>
  - Parses command and arguments
  - Executes appropriate action
  - Adds response to terminal

executeBuiltinCommand(cmd: string, args: string[]): Promise<void>
  - Handles built-in commands (set-key, test-key, exec, etc.)
```

**Supported Commands**:
- `set-key <provider> <key>` - Set API key
- `test-key <provider>` - Test API connection
- `exec <description>` - Generate automation
- `list` - List saved blueprints
- `load <id>` - Load blueprint
- `help` - Show command help
- `clear` - Clear terminal

**Dependencies**:
- `geminiService` (all methods)
- `storageService` (key and blueprint management)

---

### 12. ProfileView
**File**: `views/ProfileView.tsx`

**Purpose**: User profile and preferences management

**Key Features**:
- User name and role
- Avatar generation (based on seed)
- Theme selection (light/dark/system)
- Default platform preference
- Auto-audit toggle
- Settings persistence

**State Management**:
- `profile` (UserProfile): User preferences
- `loading` (boolean): Loading/saving profile

**Key Functions**:
```typescript
loadProfile(): Promise<void>
  - Fetches profile from IndexedDB
  - Falls back to defaults if not found

saveProfile(): Promise<void>
  - Saves profile to IndexedDB
  - Updates UI with new preferences
```

**Dependencies**:
- `storageService.getProfile()`, `saveProfile()`
- `UserProfile` type

**Default Profile**:
```typescript
{
  name: 'Automation Engineer',
  role: 'Developer',
  avatarSeed: crypto.randomUUID(),
  preferences: {
    theme: 'system',
    defaultPlatform: 'zapier',
    autoAudit: true
  }
}
```

---

## Components (Reusable UI)

### 1. Header
**File**: `components/Header.tsx`

**Purpose**: Top navigation bar with view title and actions

**Props**:
- `activeView` (AppView): Current view for display

**Features**:
- View title display
- Breadcrumb navigation (future)
- User profile button
- Settings button
- Notifications (future)

**Dependencies**: None (presentational component)

---

### 2. Sidebar
**File**: `components/Sidebar.tsx`

**Purpose**: Main navigation sidebar

**Props**:
- `activeView` (AppView): Current active view
- `onNavigate` (function): Navigation callback

**Features**:
- View navigation buttons
- Active view highlighting
- Icons for each view (Lucide React)
- Collapsible on mobile
- Keyboard shortcuts (future)

**Navigation Structure**:
```
Generator      (Cpu icon)
Chatbot        (MessageSquare icon)
Image Analysis (Image icon)
TTS            (Mic icon)
Live Architect (Headphones icon)
Logic Sandbox  (Play icon)
Audit          (Shield icon)
Deployment     (Rocket icon)
Vault          (Archive icon)
Comparator     (BarChart icon)
Terminal       (Terminal icon)
Profile        (User icon)
```

**Dependencies**:
- `lucide-react` icons
- `AppView` enum

---

### 3. UI Components
**Directory**: `components/ui/`

**Purpose**: Reusable, styled UI primitives

**Components** (typical):
- Button
- Input
- Select
- Textarea
- Card
- Badge
- Alert
- Modal
- Tooltip
- Spinner/Loader

**Note**: These are assumed to exist based on typical React app structure. If not present, recommend creating with Tailwind CSS or using a library like Radix UI or Headless UI.

---

## Services (Business Logic)

### 1. geminiService
**File**: `services/geminiService.ts`

**Purpose**: All Google Gemini AI interactions

**Exports**:

#### Core Functions
```typescript
generateAutomation(platform, description): Promise<AutomationResult>
generateWorkflowDocs(blueprint): Promise<WorkflowDocumentation>
benchmarkPlatforms(description, platforms): Promise<ComparisonResult>
chatWithAssistant(message): Promise<string>
analyzeImage(base64Data, prompt, mimeType): Promise<string>
generateSpeech(text, voice): Promise<string>
generateProcedureManual(text): Promise<string>
connectToLiveArchitect(callbacks): LiveSession
simulateAutomation(blueprint, inputData): Promise<SimulationResponse>
auditAutomation(blueprint): Promise<AuditResult>
identifySecrets(blueprint): Promise<DeploymentConfig>
```

#### Utility Functions
```typescript
encode(bytes): string  // Base64 encoding
decode(base64): Uint8Array  // Base64 decoding
decodeAudioData(data, ctx, sampleRate, channels): Promise<AudioBuffer>
```

#### Internal Functions
```typescript
createAiClient(): GoogleGenAI  // Client factory
executeAiTask<T>(task, retryCount): Promise<T>  // Retry wrapper
```

**Dependencies**:
- `@google/genai` (Google GenAI SDK)
- `process.env.API_KEY` (environment variable)
- All type definitions from `types.ts`

**Error Handling**:
- Automatic retry on 429 (rate limit) and 5xx errors
- Exponential backoff (1.5s delay)
- User-friendly error messages

---

### 2. storageService
**File**: `services/storageService.ts`

**Purpose**: IndexedDB operations via Dexie

**Exports**:

#### Database Class
```typescript
class ArchitectDatabase extends Dexie {
  blueprints: Table<SavedBlueprint>
  profile: Table<UserProfile & { id: string }>
}
```

#### Storage API
```typescript
storage.getProfile(): Promise<UserProfile | null>
storage.saveProfile(profile): Promise<void>
```

**Note**: Direct Dexie operations used throughout codebase. Recommend refactoring to repository pattern (see REFACTORING.md).

**Schema**:
```typescript
{
  blueprints: 'id, name, platform, timestamp',
  profile: 'id'
}
```

**Dependencies**:
- `dexie` (IndexedDB wrapper)
- `SavedBlueprint`, `UserProfile` types

---

## Types (TypeScript Definitions)

**File**: `types.ts`

**Purpose**: Centralized type definitions for entire application

### Enums

#### AppView
```typescript
enum AppView {
  GENERATOR, CHATBOT, IMAGE_ANALYSIS, TTS, LIVE_CONSULTANT,
  LOGIC_SANDBOX, AUDIT, DEPLOYMENT, VAULT, COMPARATOR,
  TERMINAL, PROFILE
}
```

### Core Types

#### Automation
```typescript
Platform: 'zapier' | 'n8n' | 'langchain' | 'make' | ...
StepType: 'trigger' | 'action' | 'logic'

interface AutomationStep {
  id: number
  title: string
  description: string
  type: StepType
}

interface AutomationResult {
  platform: Platform
  steps: AutomationStep[]
  codeSnippet?: string
  explanation: string
  sources?: GroundingSource[]
  timestamp?: number
  documentation?: WorkflowDocumentation
}

interface SavedBlueprint extends AutomationResult {
  id: string
  name: string
  version: string
}
```

#### Workflow Analysis
```typescript
interface SimulationResponse {
  overallStatus: 'success' | 'failure'
  stepResults: StepResult[]
  summary: string
}

interface AuditResult {
  securityScore: number
  estimatedMonthlyCost: string
  vulnerabilities: Vulnerability[]
  roiAnalysis: string
  optimizationTips: string[]
}

interface DeploymentConfig {
  secrets: SecretRequirement[]
  exportFormats: string[]
  readinessCheck: string
  suggestedPipeline?: PipelineStage[]
}
```

#### User & UI
```typescript
interface UserProfile {
  name: string
  role: string
  avatarSeed: string
  preferences: {
    theme: 'light' | 'dark' | 'system'
    defaultPlatform: Platform
    autoAudit: boolean
  }
}

interface ChatMessage {
  id: string
  role: 'user' | 'model'
  content: string
  timestamp: number
}

interface TerminalEntry {
  id: string
  type: 'command' | 'response' | 'error' | 'info'
  content: string
  timestamp: number
}
```

#### Utility Types
```typescript
interface AsyncState<T> {
  data: T | null
  loading: boolean
  error: ApiError | null
}

interface ApiError {
  message: string
  code?: string | number
  details?: any
}
```

---

## PWA Infrastructure

### 1. Service Worker
**File**: `sw.js`

**Purpose**: Offline capability and asset caching

**Caching Strategy**:
- **Static Assets**: Cache-first (HTML, CSS, JS, fonts)
- **API Calls**: Network-first with fallback
- **Images**: Cache-first with network fallback

**Cache Names**:
- `autoarchitect-static-v1`
- `autoarchitect-dynamic-v1`

**Lifecycle**:
1. `install` - Precache static assets
2. `activate` - Clean up old caches
3. `fetch` - Intercept network requests

**Future Enhancements**:
- Migrate to Workbox
- Background sync
- Push notifications
- Periodic background sync

---

### 2. Manifest
**File**: `manifest.json`

**Purpose**: PWA configuration and installability

**Configuration**:
```json
{
  "name": "AutoArchitect",
  "short_name": "AutoArchitect",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#4f46e5",
  "background_color": "#ffffff",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

**Install Criteria**:
- HTTPS (or localhost)
- Valid manifest
- Service worker registered
- Icons provided

---

### 3. App Entry Point
**File**: `index.tsx`

**Purpose**: React app initialization and service worker registration

**Initialization Flow**:
```typescript
1. ReactDOM.createRoot()
2. Render <App />
3. Register service worker
4. Initialize IndexedDB
5. Load user preferences
```

**Critical Path**:
- Must load before any views
- Service worker registration asynchronous (non-blocking)
- Error boundaries at root level (recommended)

---

## Module Dependencies

### Dependency Graph

```
App.tsx
├── Sidebar
│   └── Navigation logic
├── Header
│   └── Current view display
└── Views (conditional)
    ├── AutomationGeneratorView
    │   ├── geminiService.generateAutomation()
    │   └── storageService (save blueprint)
    ├── ChatbotView
    │   └── geminiService.chatWithAssistant()
    ├── ImageAnalysisView
    │   └── geminiService.analyzeImage()
    ├── TTSView
    │   ├── geminiService.generateSpeech()
    │   └── geminiService.generateProcedureManual()
    ├── LiveArchitectView
    │   └── geminiService.connectToLiveArchitect()
    ├── LogicSandboxView
    │   ├── geminiService.simulateAutomation()
    │   └── storageService (load blueprint)
    ├── AuditView
    │   └── geminiService.auditAutomation()
    ├── DeploymentHubView
    │   └── geminiService.identifySecrets()
    ├── VaultView
    │   └── storageService (CRUD blueprints)
    ├── ComparatorView
    │   └── geminiService.benchmarkPlatforms()
    ├── TerminalView
    │   ├── geminiService (all methods)
    │   └── storageService (keys, blueprints)
    └── ProfileView
        └── storageService (profile)

Services
├── geminiService
│   ├── @google/genai SDK
│   └── process.env.API_KEY
└── storageService
    └── Dexie (IndexedDB wrapper)
```

### External Dependencies

#### Production
```json
{
  "react": "18.2.0",
  "react-dom": "18.2.0",
  "@google/genai": "1.34.0",
  "dexie": "3.2.4",
  "lucide-react": "0.263.1"
}
```

#### Development
```json
{
  "@vitejs/plugin-react": "^5.0.0",
  "@types/node": "^22.14.0",
  "typescript": "~5.8.2",
  "vite": "^6.2.0"
}
```

---

## Module Communication Patterns

### 1. Props Passing (Parent → Child)
```typescript
<VaultView onNavigate={handleNavigate} />
<LogicSandboxView activeBlueprint={blueprint} />
```

### 2. Callback Functions (Child → Parent)
```typescript
onBlueprintGenerated={(blueprint) => setActiveBlueprint(blueprint)}
```

### 3. Service Layer (Any → Service)
```typescript
const result = await generateAutomation(platform, description);
```

### 4. State Management (Component-Local)
```typescript
const [loading, setLoading] = useState(false);
```

### 5. Storage Layer (Any → IndexedDB)
```typescript
await db.blueprints.add(blueprint);
const profile = await storage.getProfile();
```

---

## Recommended Improvements

### 1. Global State Management
Implement Zustand or Jotai for:
- `activeBlueprint` (avoid prop drilling)
- `userProfile` (avoid multiple loads)
- `appSettings` (theme, preferences)
- `navigation` (back/forward history)

### 2. Service Refactoring
Split `geminiService.ts` into:
- `ai/client.ts` - Client factory
- `ai/automationAgent.ts` - Generation logic
- `ai/auditAgent.ts` - Security analysis
- `ai/simulationAgent.ts` - Sandbox logic
- `ai/deploymentAgent.ts` - CI/CD generation

### 3. Repository Pattern
Abstract storage operations:
- `repositories/BlueprintRepository`
- `repositories/ProfileRepository`
- `repositories/SettingsRepository`

### 4. Custom Hooks
Extract common patterns:
- `useAutomation()` - Generation logic
- `useAsyncState()` - Async operations
- `useBlueprint()` - Blueprint management
- `useAudio()` - Audio playback

---

## Conclusion

AutoArchitect's modular architecture provides:
- ✅ Clear separation of concerns
- ✅ Reusable components and services
- ✅ Type-safe interfaces
- ✅ Offline-first architecture
- ✅ Scalable view structure

**Key Strengths**:
- Comprehensive feature set (12 specialized views)
- Robust AI integration (11 specialized agents)
- Secure local-first design
- PWA capabilities

**Areas for Improvement**:
- Global state management
- Service layer refactoring
- Enhanced error handling
- Performance optimization

---

**Document Version**: 1.0  
**Last Updated**: December 30, 2024  
**Next Review**: January 30, 2025
