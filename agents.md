# Agents & Modules Documentation

## Overview

AutoArchitect is organized as a **suite of specialized agents** (views), each designed to handle a specific aspect of the automation architecture lifecycle. This document provides a comprehensive breakdown of each agent's purpose, input/output contracts, decision logic, and integration points.

---

## Table of Contents

1. [Automation Generator](#1-automation-generator)
2. [Logic Sandbox](#2-logic-sandbox)
3. [Audit View](#3-audit-view)
4. [Deployment Hub](#4-deployment-hub)
5. [Blueprint Vault](#5-blueprint-vault)
6. [Platform Comparator](#6-platform-comparator)
7. [API Terminal](#7-api-terminal)
8. [Chatbot Assistant](#8-chatbot-assistant)
9. [Image Analysis](#9-image-analysis)
10. [Text-to-Speech (TTS)](#10-text-to-speech-tts)
11. [Live Architect](#11-live-architect)
12. [Profile Manager](#12-profile-manager)

---

## 1. Automation Generator

**File**: `views/AutomationGeneratorView.tsx`  
**Purpose**: Primary workflow creation interface with AI-powered automation generation for 10+ platforms.

### Input

- **Platform Selection**: User chooses from:
  - AI Platforms: OpenAI, Anthropic, LangChain
  - Integration Platforms: Zapier, Make, n8n, Pipedream
  - Data Platforms: Google Sheets, Airtable
  - E-commerce: Shopify
- **Natural Language Description**: Free-text prompt describing desired automation
- **Optional Refinement**: Conversational follow-up via embedded chat

### Output

- **AutomationResult** object:
  ```typescript
  {
    platform: Platform;
    steps: AutomationStep[]; // Ordered workflow steps
    codeSnippet?: string; // Executable code (if applicable)
    explanation: string; // Human-readable summary
    timestamp: number;
    documentation?: WorkflowDocumentation;
  }
  ```

### Decision Logic

1. **Platform Analysis**: Determine optimal implementation pattern for selected platform
2. **Step Decomposition**: Break complex workflows into atomic steps (trigger → action → logic)
3. **Code Generation**: Produce platform-specific configuration or code
4. **Validation**: Ensure logical flow and dependency resolution
5. **Documentation**: Auto-generate technical docs via `generateWorkflowDocs()`

### Features

- **Visual Platform Cards**: Rich preview with branding, tier labels, and tooltips
- **Embedded Chat**: Refine requirements conversationally without leaving the view
- **Real-Time Generation**: Streaming-style UI updates during AI synthesis
- **Quick Actions**:
  - 🔬 Test in Sandbox
  - 🛡️ Security Audit
  - 🚀 Deploy
  - 💾 Save to Vault
  - 📋 Copy to Clipboard

### Integration Points

- **Gemini Service**: `generateAutomation()`, `chatWithAssistant()`, `generateWorkflowDocs()`
- **Storage Service**: Saves blueprints to IndexedDB via Vault
- **Navigation**: Routes to Sandbox, Audit, or Deployment with active blueprint context

### UI/UX Patterns

- **Platform Grid**: 3-column responsive layout with hover effects
- **Step Visualizer**: Color-coded badges (Trigger=blue, Action=purple, Logic=emerald)
- **Code Block**: Syntax-highlighted with copy button
- **Chat Drawer**: Toggleable side panel for refinement
- **Loading States**: Skeleton loaders and spinner animations

---

## 2. Logic Sandbox

**File**: `views/LogicSandboxView.tsx`  
**Purpose**: Dry-run automation workflows with sample data to validate logic before deployment.

### Input

- **Active Blueprint**: Passed from Generator or Vault
- **Input Data**: JSON or plain text representing workflow trigger payload

### Output

- **SimulationResponse**:
  ```typescript
  {
    overallStatus: 'success' | 'failure';
    summary: string;
    stepResults: {
      stepId: number;
      status: 'success' | 'failure' | 'skipped';
      output: string;
      reasoning: string; // AI explanation of step behavior
    }[];
  }
  ```

### Decision Logic

1. **Load Blueprint**: Retrieve from active context or select from vault
2. **Parse Input**: Validate and structure sample data
3. **Simulate Steps**: AI interprets each step's logic and predicts output
4. **Dependency Tracking**: Detect if steps rely on prior outputs
5. **Error Detection**: Identify edge cases, null handling, or logical flaws
6. **Trace Generation**: Provide step-by-step execution log

### Features

- **Blueprint Loader**: Dropdown to select saved blueprints
- **Input Editor**: Multi-line textarea with JSON syntax hints
- **Step-by-Step Trace**: Accordion view of each step's execution
- **Status Indicators**: ✅ Success, ❌ Failure, ⏭️ Skipped
- **AI Reasoning**: Explanation of why each step passed/failed
- **Export Results**: Download simulation report as JSON

### Integration Points

- **Gemini Service**: `simulateAutomation()`
- **Vault**: Loads blueprints from IndexedDB
- **Navigation**: Receives blueprint from Generator or Vault

### Use Cases

1. **Pre-Production Testing**: Validate logic before deploying to live APIs
2. **Edge Case Discovery**: Identify scenarios not covered in initial design
3. **Documentation**: Generate test cases from simulation results
4. **Training**: Teach users how automation will behave with real data

---

## 3. Audit View

**File**: `views/AuditView.tsx`  
**Purpose**: Security analysis and ROI estimation for automation blueprints.

### Input

- **Active Blueprint**: Workflow to audit

### Output

- **AuditResult**:
  ```typescript
  {
    securityScore: number; // 0-100
    estimatedMonthlyCost: string; // "$50-200"
    roiAnalysis: string; // Narrative assessment
    vulnerabilities: {
      severity: 'low' | 'medium' | 'high';
      issue: string;
      fix: string;
    }[];
    optimizationTips: string[];
  }
  ```

### Decision Logic

1. **Security Scan**:
   - Detect hardcoded secrets or credentials
   - Check for insufficient authentication
   - Identify excessive permissions
   - Validate data sanitization
2. **Cost Estimation**:
   - Calculate API call frequency
   - Estimate compute resource usage
   - Factor in third-party service costs
3. **ROI Analysis**:
   - Measure time savings (manual hours replaced)
   - Calculate error reduction benefits
   - Consider maintenance overhead
4. **Optimization Recommendations**:
   - Caching strategies
   - Batch processing opportunities
   - Alternative implementation patterns

### Features

- **Security Score Gauge**: Visual 0-100 score with color gradient
- **Vulnerability List**: Severity badges with expandable fix details
- **Cost Breakdown**: Monthly estimate with breakdown by service
- **ROI Timeline**: Visual projection of cost savings over time
- **Actionable Fixes**: Copy-paste code snippets for remediation

### Integration Points

- **Gemini Service**: `auditAutomation()`
- **Navigation**: Receives blueprint from Generator, Sandbox, or Vault

### Security Standards

- OWASP Top 10 coverage
- OAuth 2.0 / JWT best practices
- API key management validation
- Data encryption at rest/transit checks

---

## 4. Deployment Hub

**File**: `views/DeploymentHubView.tsx`  
**Purpose**: Generate deployment configurations, CI/CD pipelines, and infrastructure-as-code.

### Input

- **Active Blueprint**: Workflow to deploy
- **Secret Configuration**: User-provided API keys and credentials
- **Deployment Target**: Docker, Kubernetes, Serverless, etc.

### Output

- **DeploymentConfig**:
  ```typescript
  {
    secrets: SecretRequirement[]; // Required env vars
    exportFormats: string[]; // ['docker', 'kubernetes', 'terraform']
    readinessCheck: string; // Health check script
    suggestedPipeline: PipelineStage[]; // CI/CD stages
  }
  ```

### Decision Logic

1. **Secret Detection**: Identify all API keys, tokens, and credentials
2. **Infrastructure Selection**: Recommend deployment target based on blueprint complexity
3. **Pipeline Generation**:
   - Lint: Code quality checks
   - Test: Unit/integration tests
   - Build: Docker image or artifact creation
   - Security Scan: Dependency vulnerability checks
   - Deploy: Platform-specific deployment script
4. **Health Check**: Generate monitoring/alerting scripts
5. **Export Formats**: Dockerfiles, Kubernetes manifests, Terraform configs

### Features

- **Secret Manager**: Secure form for entering credentials
- **Pipeline Visualizer**: Drag-and-drop stage editor (read-only in current version)
- **Multi-Format Export**: Download configurations for various platforms
- **Readiness Checklist**: Pre-flight validation before deployment
- **One-Click Deploy**: Integration with Vercel/Netlify (future)

### Integration Points

- **Gemini Service**: `identifySecrets()`
- **Storage Service**: Securely store deployment configs (obfuscated)

### Security Considerations

- Secrets encrypted at rest in IndexedDB
- Never transmitted to AI (masked in prompts)
- Clear warnings about credential management
- Option to use environment variables instead of inline

---

## 5. Blueprint Vault

**File**: `views/VaultView.tsx`  
**Purpose**: Centralized storage and management of automation blueprints.

### Input

- **Search Query**: Filter blueprints by name, platform, or description
- **Import File**: JSON file containing blueprints

### Output

- **Blueprint List**: Array of `SavedBlueprint` objects
- **Export File**: JSON dump of all saved blueprints

### Decision Logic

1. **Load from Storage**: Fetch blueprints from localStorage (legacy) or IndexedDB
2. **Filter**: Real-time search across name, platform, and explanation fields
3. **CRUD Operations**:
   - Create: Save from Generator
   - Read: Display in grid/list view
   - Update: Version management (future)
   - Delete: Confirm and remove from storage
4. **Import/Export**:
   - Export: JSON.stringify with pretty-print
   - Import: Parse JSON, merge by ID to prevent duplicates

### Features

- **Search Bar**: Instant filtering with debounce
- **Grid Layout**: Responsive 1-3 column layout
- **Blueprint Cards**: Name, version, platform, timestamp, actions
- **Quick Actions**:
  - 🚀 Launch in Deployment Hub
  - 🗑️ Delete
- **Bulk Operations**: Export all, import from file
- **Storage Stats**: Display count and total size

### Integration Points

- **Storage Service**: localStorage (current) or IndexedDB (future migration)
- **Navigation**: Passes blueprints to Deployment, Sandbox, or Audit

### Data Format

```json
{
  "id": "uuid-v4",
  "name": "Shopify Order Processor",
  "version": "1.0.0",
  "platform": "zapier",
  "steps": [...],
  "explanation": "...",
  "timestamp": 1704067200000
}
```

### Future Enhancements

- Version history and rollback
- Collaboration (share blueprints via URL)
- Tags and categories
- Star/favorite system
- Duplicate detection

---

## 6. Platform Comparator

**File**: `views/ComparatorView.tsx`  
**Purpose**: Side-by-side comparison of automation platforms for a given use case.

### Input

- **Task Description**: What you want to automate
- **Platform Selection**: Choose 2-4 platforms to compare

### Output

- **ComparisonResult**:
  ```typescript
  {
    task: string;
    platforms: {
      platform: Platform;
      complexity: 'low' | 'medium' | 'high';
      pros: string[];
      cons: string[];
      config: string; // Sample code/configuration
    }[];
    recommendation: string; // AI's best choice with rationale
  }
  ```

### Decision Logic

1. **Task Analysis**: Extract key requirements (real-time vs batch, data volume, integrations needed)
2. **Platform Capabilities**: Map each platform's API surface and feature set
3. **Complexity Assessment**:
   - Low: No-code, pre-built connectors
   - Medium: Some custom logic or transformations
   - High: Advanced scripting, custom APIs
4. **Pros/Cons**: Objective evaluation based on:
   - Ease of use
   - Cost
   - Scalability
   - Ecosystem
   - Support
5. **Recommendation**: Weighted scoring with explanation

### Features

- **Platform Selector**: Multi-select dropdown
- **Comparison Table**: Side-by-side matrix view
- **Complexity Badges**: Color-coded difficulty indicators
- **Sample Configs**: Code snippets for each platform
- **AI Recommendation**: Highlighted "winner" with reasoning
- **Export Report**: PDF or JSON download (future)

### Integration Points

- **Gemini Service**: `benchmarkPlatforms()`

### Use Cases

- **Platform Selection**: Help users choose the right tool
- **Migration Planning**: Compare current vs proposed platforms
- **Cost Optimization**: Identify cheaper alternatives
- **Team Training**: Educate on platform differences

---

## 7. API Terminal

**File**: `views/TerminalView.tsx`  
**Purpose**: Command-line interface for direct Gemini API interaction and power users.

### Input

- **Commands**: Text-based instructions
  - `help`: Display command menu
  - `clear`: Wipe terminal history
  - `exec <prompt>`: Direct AI execution

### Output

- **Terminal Entries**: Array of command/response/error logs with timestamps

### Decision Logic

1. **Command Parsing**: Split input into action and arguments
2. **Routing**:
   - Built-in commands: `help`, `clear`
   - Default: Pass to `executeAI()` for Gemini execution
3. **AI Execution**: Direct call to `gemini-3-flash-preview` with raw prompt
4. **Response Formatting**: Color-coded output (command=blue, response=green, error=red)

### Features

- **Unix-Style Prompt**: `arch@vault:~$` prefix
- **Command History**: Navigate with up/down arrows (future)
- **Syntax Highlighting**: Different colors for command types
- **Auto-Scroll**: Always show latest output
- **Keyboard Shortcuts**: Enter to submit, Ctrl+L to clear (future)
- **Secure Execution**: Uses environment API_KEY, never logs keys

### Integration Points

- **Gemini Service**: Direct `GoogleGenAI` instantiation for flexibility
- **Storage Service**: Could log session history (future)

### Use Cases

- **Rapid Prototyping**: Test prompts without UI overhead
- **Debugging**: Inspect raw AI responses
- **Power Users**: Keyboard-first workflow
- **Automation Scripts**: Batch execution (future)

### Security Notes

- API key sourced from `process.env.API_KEY` only
- No local key storage or caching
- Error messages sanitized to prevent key leakage

---

## 8. Chatbot Assistant

**File**: `views/ChatbotView.tsx`  
**Purpose**: Conversational AI assistant for general automation advice and brainstorming.

### Input

- **User Messages**: Free-text questions or prompts

### Output

- **Chat History**: Array of `ChatMessage` objects
  ```typescript
  {
    id: string;
    role: 'user' | 'model';
    content: string;
    timestamp: number;
  }
  ```

### Decision Logic

1. **Message Reception**: Capture user input
2. **Context Preservation**: Maintain conversation history
3. **AI Response**: Call `chatWithAssistant()` with full context
4. **Streaming Display**: Animate response arrival (future)
5. **Error Handling**: Graceful fallback for API failures

### Features

- **Chat Bubbles**: User (right-aligned, blue) vs AI (left-aligned, gray)
- **Typing Indicator**: Shows when AI is generating response
- **Markdown Support**: Format AI responses with bold, lists, code blocks
- **Clear History**: Reset conversation
- **Export Chat**: Download conversation as JSON or text (future)

### Integration Points

- **Gemini Service**: `chatWithAssistant()`

### Use Cases

- **Onboarding**: Help new users understand the platform
- **Brainstorming**: Generate automation ideas
- **Troubleshooting**: Debug workflow issues
- **Learning**: Ask "how-to" questions

---

## 9. Image Analysis

**File**: `views/ImageAnalysisView.tsx`  
**Purpose**: AI-powered visual analysis of automation diagrams, flowcharts, and UI mockups.

### Input

- **Image Upload**: JPG, PNG, WebP (drag-and-drop or file picker)
- **Analysis Prompt**: What to extract from the image
  - "Convert this flowchart to Zapier steps"
  - "Extract API endpoints from this screenshot"
  - "Identify automation opportunities in this UI"

### Output

- **Text Analysis**: Structured description of visual elements
- **Extracted Workflow**: Optionally generate `AutomationResult` from diagram

### Decision Logic

1. **Image Encoding**: Convert file to base64 + detect MIME type
2. **Vision Analysis**: Send to `gemini-3-pro-preview` with multimodal prompt
3. **Structured Extraction**: Identify:
   - Shapes and connectors (flowchart logic)
   - Text labels (step descriptions)
   - Color codes (conditional branches)
   - Icons (platform integrations)
4. **Workflow Reconstruction**: Generate equivalent automation blueprint

### Features

- **Drag-and-Drop Upload**: Visual drop zone
- **Image Preview**: Thumbnail with zoom
- **Prompt Templates**: Pre-defined analysis types
- **Export Results**: Save extracted workflow to Vault

### Integration Points

- **Gemini Service**: `analyzeImage()`
- **Generator**: Can pass extracted workflow for further refinement

### Use Cases

- **Legacy Documentation**: Digitize printed flowcharts
- **UI Automation**: Identify clickable elements from screenshots
- **Whiteboard Capture**: Convert brainstorming sessions to workflows
- **Compliance**: Extract process documentation from diagrams

---

## 10. Text-to-Speech (TTS)

**File**: `views/TTSView.tsx`  
**Purpose**: Generate voice procedure manuals for automation workflows.

### Input

- **Text or Blueprint**: Either raw text or automation description
- **Voice Model**: Select from available Gemini TTS voices

### Output

- **Audio File**: Base64-encoded audio (playable in browser)
- **Procedure Manual**: Markdown-formatted operator guide

### Decision Logic

1. **Text Generation**: If blueprint provided, generate manual with `generateProcedureManual()`
2. **Voice Selection**: Choose appropriate voice model
3. **TTS Synthesis**: Call `generateSpeech()` with text and voice
4. **Audio Playback**: Decode base64 and create Audio object
5. **Download Option**: Export as MP3/WAV

### Features

- **Voice Previews**: Sample each voice before generating
- **Manual Editor**: Edit generated text before synthesis
- **Audio Player**: Built-in controls (play, pause, download)
- **Batch Generation**: Process multiple workflows (future)

### Integration Points

- **Gemini Service**: `generateSpeech()`, `generateProcedureManual()`

### Use Cases

- **Accessibility**: Audio guides for visually impaired users
- **Training**: Onboarding materials for new team members
- **Documentation**: Voice-over tutorials
- **Compliance**: Auditable procedure records

---

## 11. Live Architect

**File**: `views/LiveArchitectView.tsx`  
**Purpose**: Real-time bidirectional voice interaction with AI automation consultant.

### Input

- **Voice Input**: User speaks via microphone
- **Context**: Ongoing conversation state

### Output

- **Voice Response**: AI replies via audio stream
- **Transcript**: Text version of conversation (optional)

### Decision Logic

1. **Audio Capture**: Request microphone permission
2. **Streaming Connection**: Establish WebSocket-like connection to Gemini
3. **Real-Time Processing**:
   - Send audio chunks as they're captured
   - Receive audio responses as they're generated
4. **Context Maintenance**: AI remembers conversation flow
5. **Graceful Disconnection**: Save transcript, release resources

### Features

- **Push-to-Talk**: Hold to speak button
- **Voice Activity Detection**: Auto-detect when user stops speaking (future)
- **Transcript View**: Real-time text of conversation
- **Save Session**: Export conversation to Vault as blueprint
- **Background Noise Cancellation**: Filter out ambient noise (future)

### Integration Points

- **Gemini Service**: `connectToLiveArchitect()`

### Use Cases

- **Hands-Free Design**: Create workflows while multitasking
- **Complex Requirements**: Explain nuanced needs conversationally
- **Accessibility**: Alternative to typing for users with disabilities
- **Mobile First**: Better UX on mobile devices

### Technical Notes

- Uses WebRTC for low-latency audio
- Requires HTTPS for microphone access
- Model: `gemini-2.5-flash-native-audio-preview`
- Voice: Zephyr (friendly, professional tone)

---

## 12. Profile Manager

**File**: `views/ProfileView.tsx`  
**Purpose**: User personalization and application preferences.

### Input

- **User Data**: Name, role, avatar
- **Preferences**:
  - Theme: light/dark/system
  - Default platform
  - Auto-audit enabled/disabled

### Output

- **UserProfile** object saved to IndexedDB

### Decision Logic

1. **Load Profile**: Fetch from storage or initialize defaults
2. **Form Validation**: Ensure required fields filled
3. **Avatar Generation**: Use `avatarSeed` to generate consistent avatar
4. **Preference Application**: Update UI based on theme, etc.
5. **Persistence**: Save to IndexedDB via `storage.saveProfile()`

### Features

- **Avatar Customizer**: DiceBear-style avatar generator
- **Theme Switcher**: Light/Dark/Auto
- **Platform Preset**: Set favorite platform for quick access
- **Auto-Audit Toggle**: Enable security checks on every generation
- **Export Profile**: Backup settings as JSON (future)

### Integration Points

- **Storage Service**: `getProfile()`, `saveProfile()`
- **App Context**: Apply theme and preferences globally

### Data Schema

```typescript
{
  name: string;
  role: string;
  avatarSeed: string; // For consistent avatar generation
  preferences: {
    theme: 'light' | 'dark' | 'system';
    defaultPlatform: Platform;
    autoAudit: boolean;
  };
}
```

---

## Cross-Agent Integration

### Navigation Flow

```
Generator → Sandbox → Audit → Deployment → Vault
     ↓         ↑        ↑         ↑          ↓
Comparator → Terminal → Chatbot → Live Architect
```

### Shared Context

- **Active Blueprint**: Passed between Generator, Sandbox, Audit, Deployment
- **User Profile**: Globally available preferences
- **API Key**: Centralized via `process.env.API_KEY`

### Event System

- Blueprint creation triggers Vault update
- Audit completion suggests Deployment next step
- Simulation failure prompts Generator refinement

---

## Common Patterns

### Loading States
All agents use consistent loading UX:
- Skeleton loaders for content areas
- Spinner animations for AI operations
- Progress bars for multi-step processes

### Error Handling
- User-friendly error messages (no stack traces)
- Retry buttons where applicable
- Fallback to cached data when offline

### Responsive Design
- Mobile-first Tailwind CSS
- Touch-friendly buttons (min 44x44px)
- Collapsible sidebars on small screens

---

## Architecture Principles

1. **Single Responsibility**: Each agent handles one primary use case
2. **Loose Coupling**: Agents communicate via props/navigation, not direct imports
3. **Progressive Enhancement**: Core features work without JavaScript (future)
4. **Offline-First**: Cached data available even without network
5. **Accessibility**: ARIA labels, keyboard navigation, screen reader support

---

## Future Roadmap

### Short-Term (v2.6-2.7)
- [ ] Agent collaboration (pass data between agents seamlessly)
- [ ] Workflow templates library
- [ ] Batch operations in Vault

### Mid-Term (v3.0)
- [ ] Multi-agent orchestration (combine agents for complex tasks)
- [ ] Custom agent creation (user-defined agents)
- [ ] Plugin system for community extensions

### Long-Term (v4.0+)
- [ ] Federated learning across users (privacy-preserving)
- [ ] Agent marketplace (buy/sell custom agents)
- [ ] Enterprise agent management (RBAC, audit logs)

---

**Last Updated**: December 30, 2024  
**Version**: 2.5.0  
**Maintainer**: AutoArchitect Team
