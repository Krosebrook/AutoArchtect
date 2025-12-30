# Gemini Service Documentation

## Overview

The Gemini Service (`services/geminiService.ts`) is the **core AI orchestration layer** for AutoArchitect. It provides a unified, production-grade interface to Google's Gemini 3 family of AI models, handling all AI-powered features including automation generation, workflow analysis, security audits, and real-time interactions.

## Architecture

### Design Philosophy

1. **Unified Client Management**: Single `createAiClient()` function ensures consistent API key handling
2. **Error Resilience**: Automatic retry logic with exponential backoff for transient failures
3. **Type Safety**: Leverages Gemini's structured output schemas for predictable responses
4. **Separation of Concerns**: Each feature has a dedicated function with clear responsibilities
5. **Environment-First**: API keys sourced exclusively from `process.env.API_KEY`

### Core Components

```typescript
createAiClient() → GoogleGenAI
executeAiTask<T>() → Promise<T>
```

**Key Functions:**
- `createAiClient()`: Instantiates the AI client with environment-based authentication
- `executeAiTask<T>()`: Wrapper providing retry logic and centralized error handling

## API Functions

### 1. Automation Generation

#### `generateAutomation(platform, description)`

**Purpose**: Generate production-ready automation workflows for specified platforms.

**Input**:
- `platform: Platform` - Target platform (zapier, n8n, langchain, make, etc.)
- `description: string` - Natural language description of automation requirements

**Output**: `AutomationResult`
```typescript
{
  platform: string;
  explanation: string;
  codeSnippet?: string;
  steps: AutomationStep[];
  timestamp: number;
}
```

**Model**: `gemini-3-pro-preview`  
**Thinking Budget**: 16,000 tokens  
**Response Format**: Structured JSON with schema validation

**Decision Logic**:
1. Parse user intent from description
2. Map to platform-specific patterns and APIs
3. Generate ordered step sequence (trigger → actions → logic)
4. Provide executable code snippets when applicable
5. Include explanatory narrative for human review

**Error Handling**: Retries on 429 (rate limit) and 5xx errors with 1.5s backoff

---

### 2. Workflow Documentation

#### `generateWorkflowDocs(blueprint)`

**Purpose**: Generate comprehensive technical documentation for automation blueprints.

**Input**:
- `blueprint: AutomationResult` - The automation workflow to document

**Output**: `WorkflowDocumentation`
```typescript
{
  purpose: string;
  inputSchema: Object; // JSON Schema
  outputSchema: Object; // JSON Schema
  logicFlow: string[];
  maintenanceGuide: string;
}
```

**Model**: `gemini-3-flash-preview`  
**Use Case**: When saving blueprints to vault or preparing for handoff

---

### 3. Platform Benchmarking

#### `benchmarkPlatforms(description, targetPlatforms)`

**Purpose**: Compare multiple automation platforms for the same use case.

**Input**:
- `description: string` - The automation task to compare
- `targetPlatforms: Platform[]` - List of platforms to benchmark

**Output**: `ComparisonResult`
```typescript
{
  task: string;
  platforms: {
    platform: string;
    complexity: 'low' | 'medium' | 'high';
    pros: string[];
    cons: string[];
    config: string; // Sample configuration
  }[];
  recommendation: string;
}
```

**Model**: `gemini-3-pro-preview`  
**Decision Logic**:
1. Analyze each platform's API capabilities
2. Assess implementation complexity
3. Compare feature coverage and limitations
4. Consider cost, maintenance, and ecosystem
5. Provide actionable recommendation

---

### 4. Chatbot Assistant

#### `chatWithAssistant(message)`

**Purpose**: Provide conversational AI assistance for general automation queries.

**Input**:
- `message: string` - User query or prompt

**Output**: `string` - AI-generated response

**Model**: `gemini-3-flash-preview`  
**System Instruction**: "Advisor AI mode."  
**Use Case**: Quick help, clarifications, brainstorming

---

### 5. Image Analysis

#### `analyzeImage(base64Data, prompt, mimeType)`

**Purpose**: AI-powered visual analysis of automation diagrams, flowcharts, or UI mockups.

**Input**:
- `base64Data: string` - Base64-encoded image data
- `prompt: string` - Analysis instructions
- `mimeType: string` - Image MIME type (default: 'image/jpeg')

**Output**: `string` - Analysis results

**Model**: `gemini-3-pro-preview`  
**Use Case**: Extract workflow logic from diagrams, identify UI automation opportunities

---

### 6. Text-to-Speech

#### `generateSpeech(text, voice)`

**Purpose**: Convert text to audio for procedure manuals and documentation.

**Input**:
- `text: string` - Text to synthesize
- `voice: string` - Voice model identifier

**Output**: `string` - Base64-encoded audio data

**Model**: `gemini-2.5-flash-preview-tts`  
**Response Modality**: Audio  
**Speech Config**: Prebuilt voice models

#### `generateProcedureManual(text)`

**Purpose**: Generate markdown-formatted operator manual from automation description.

**Input**:
- `text: string` - Automation description

**Output**: `string` - Markdown formatted manual

**Model**: `gemini-3-flash-preview`

---

### 7. Live Audio Interaction

#### `connectToLiveArchitect(callbacks)`

**Purpose**: Establish real-time bidirectional voice interaction with AI architect.

**Input**:
- `callbacks: object` - Event handlers for audio streaming

**Output**: Connection object for streaming session

**Model**: `gemini-2.5-flash-native-audio-preview-09-2025`  
**Response Modality**: Audio  
**Voice**: Zephyr  
**System Instruction**: "You are a friendly and helpful senior automation architect."

**Use Case**: Voice-based workflow design, real-time consultation, hands-free operation

---

### 8. Logic Simulation

#### `simulateAutomation(blueprint, inputData)`

**Purpose**: Dry-run automation logic without executing external APIs.

**Input**:
- `blueprint: AutomationResult` - Workflow to simulate
- `inputData: string` - Sample input data (JSON or text)

**Output**: `SimulationResponse`
```typescript
{
  overallStatus: 'success' | 'failure';
  summary: string;
  stepResults: {
    stepId: number;
    status: 'success' | 'failure' | 'skipped';
    output: string;
    reasoning: string;
  }[];
}
```

**Model**: `gemini-3-pro-preview`  
**System Instruction**: "You are the Sandbox Kernel."  
**Decision Logic**:
1. Parse each step's logic and dependencies
2. Simulate data transformations
3. Identify potential failures or edge cases
4. Provide step-by-step execution trace
5. Validate output consistency

---

### 9. Security & Cost Audit

#### `auditAutomation(blueprint)`

**Purpose**: Perform security and ROI analysis on automation blueprints.

**Input**:
- `blueprint: AutomationResult` - Workflow to audit

**Output**: `AuditResult`
```typescript
{
  securityScore: number; // 0-100
  estimatedMonthlyCost: string;
  roiAnalysis: string;
  vulnerabilities: {
    severity: 'low' | 'medium' | 'high';
    issue: string;
    fix: string;
  }[];
  optimizationTips: string[];
}
```

**Model**: `gemini-3-pro-preview`  
**System Instruction**: "You are the Senior Security Auditor."  
**Decision Logic**:
1. Scan for security anti-patterns (hardcoded secrets, insufficient auth, etc.)
2. Estimate API call costs and infrastructure requirements
3. Calculate ROI based on time savings and error reduction
4. Prioritize vulnerabilities by severity
5. Provide actionable remediation steps

---

### 10. Deployment Configuration

#### `identifySecrets(blueprint)`

**Purpose**: Identify required secrets and generate CI/CD pipeline configuration.

**Input**:
- `blueprint: AutomationResult` - Workflow to deploy

**Output**: `DeploymentConfig`
```typescript
{
  secrets: {
    key: string;
    description: string;
    placeholder: string;
  }[];
  exportFormats: string[]; // ['docker', 'kubernetes', 'terraform']
  readinessCheck: string; // Health check script
  suggestedPipeline: PipelineStage[];
}
```

**Model**: `gemini-3-flash-preview`  
**Decision Logic**:
1. Detect environment variables and API keys
2. Identify external service dependencies
3. Generate deployment-ready configurations
4. Suggest CI/CD stages (lint, test, build, deploy, security-scan)
5. Provide health check and monitoring scripts

---

## Utility Functions

### Audio Processing

#### `encode(bytes)` / `decode(base64)`
Base64 encoding/decoding for audio data transmission.

#### `decodeAudioData(data, ctx, sampleRate, numChannels)`
Convert raw PCM16 audio bytes to Web Audio API AudioBuffer.

---

## Error Handling Strategy

### Retry Logic
```typescript
executeAiTask(task, retryCount = 2)
```

**Retry Conditions**:
- HTTP 429 (Rate Limit): Retry with 1.5s backoff
- HTTP 5xx (Server Error): Retry with 1.5s backoff
- Other errors: Fail immediately

**User-Friendly Messages**:
- 429: "Architectural load peak reached. Retrying synthesis..."
- Other: Return original error message or generic failure

### Security
- API keys **never** logged or exposed in error messages
- Client instantiation isolated to prevent key leakage
- Environment-based configuration prevents hardcoding

---

## Model Selection Strategy

| Feature | Model | Rationale |
|---------|-------|-----------|
| Automation Gen | `gemini-3-pro-preview` | Complex reasoning, structured output |
| Docs Gen | `gemini-3-flash-preview` | Fast, cost-effective for templates |
| Benchmarking | `gemini-3-pro-preview` | Multi-dimensional analysis |
| Chat | `gemini-3-flash-preview` | Low-latency conversational responses |
| Image Analysis | `gemini-3-pro-preview` | Multimodal understanding |
| TTS | `gemini-2.5-flash-preview-tts` | Specialized audio synthesis |
| Live Audio | `gemini-2.5-flash-native-audio-preview` | Real-time bidirectional audio |
| Simulation | `gemini-3-pro-preview` | Logic execution and edge case detection |
| Audit | `gemini-3-pro-preview` | Security expertise and cost modeling |
| Deployment | `gemini-3-flash-preview` | Configuration generation |

---

## Configuration

### Environment Variables
```bash
API_KEY=your_gemini_api_key_here
```

**Security Notes**:
1. Keys stored in `process.env.API_KEY` only
2. Never committed to version control
3. Validated at runtime (throws if missing)
4. Obfuscated in IndexedDB for local key vault feature (legacy support)

---

## Performance Characteristics

### Response Times (Approximate)
- **Flash Models**: 1-3 seconds
- **Pro Models**: 3-8 seconds
- **Pro with Thinking Budget**: 10-30 seconds

### Thinking Budget
The `thinkingConfig: { thinkingBudget: 16000 }` parameter allocates tokens for internal reasoning before generating output, improving accuracy for complex tasks.

---

## Best Practices

### 1. **Always Use Typed Responses**
Define comprehensive TypeScript interfaces and leverage `responseSchema` for predictable parsing.

### 2. **Handle Offline Gracefully**
Wrap calls in try-catch and provide meaningful fallback UX when network is unavailable.

### 3. **Rate Limiting**
Implement client-side debouncing for user-triggered actions to prevent quota exhaustion.

### 4. **Cost Management**
- Use Flash models for simple tasks
- Cache results when possible (e.g., in IndexedDB)
- Batch requests when feasible

### 5. **Security**
- Never pass sensitive data in prompts unless necessary
- Sanitize user inputs to prevent prompt injection
- Validate all AI outputs before executing code

---

## Debugging

### Enable Logging
```typescript
console.log('[Gemini]', response);
```

### Common Issues

**Issue**: "API_KEY environment variable is not set"  
**Solution**: Ensure `.env` file exists with valid API key or set via hosting platform

**Issue**: Rate limit errors (429)  
**Solution**: Retry logic handles this automatically; consider implementing user-facing backoff UI

**Issue**: JSON parsing errors  
**Solution**: Always use `responseSchema` with `responseMimeType: "application/json"`

**Issue**: Slow responses  
**Solution**: Use Flash models for non-critical paths; reduce `thinkingBudget`

---

## Future Enhancements

1. **Model Fallback**: Automatically switch to Flash if Pro is unavailable
2. **Streaming Responses**: Implement server-sent events for real-time output
3. **Multi-Agent Orchestration**: Coordinate multiple Gemini instances for complex workflows
4. **Fine-Tuning**: Custom models trained on automation-specific data
5. **Cost Tracking**: Local analytics dashboard for API usage monitoring

---

## Related Documentation

- [API Reference](../README.md#api)
- [Architecture Overview](../ARCHITECTURE.md)
- [Security Policy](../SECURITY.md)
- [Service Layer Patterns](../CONTRIBUTING.md#service-layer)

---

**Last Updated**: December 30, 2024  
**Version**: 2.5.0  
**Maintainer**: AutoArchitect Team
