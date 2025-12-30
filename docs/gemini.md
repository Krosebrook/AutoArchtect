# Google Gemini Integration Guide

## Overview

AutoArchitect leverages Google's Gemini AI models as its primary AI provider for automation workflow generation, analysis, and optimization. This document provides comprehensive documentation on the Gemini integration, including architecture, service methods, best practices, and troubleshooting.

---

## Table of Contents

1. [Architecture](#architecture)
2. [Models Used](#models-used)
3. [Service Layer](#service-layer)
4. [API Client Management](#api-client-management)
5. [Core Service Functions](#core-service-functions)
6. [Audio & Multimodal Features](#audio--multimodal-features)
7. [Error Handling](#error-handling)
8. [Best Practices](#best-practices)
9. [Performance Optimization](#performance-optimization)
10. [Troubleshooting](#troubleshooting)

---

## Architecture

### Integration Pattern

AutoArchitect uses a **service layer pattern** to encapsulate all Gemini AI interactions:

```
UI Layer (Views) → Service Layer (geminiService.ts) → Google GenAI SDK → Gemini API
```

**Benefits**:
- ✅ Centralized API management
- ✅ Consistent error handling
- ✅ Type-safe interfaces
- ✅ Testable business logic
- ✅ Easy to swap AI providers

### File Structure

```
services/
└── geminiService.ts          # All Gemini interactions
    ├── createAiClient()      # API client factory
    ├── executeAiTask()       # Retry wrapper
    └── [specific methods]    # Feature-specific functions
```

---

## Models Used

### Primary Models

#### 1. **gemini-3-pro-preview**
- **Use Cases**: Complex reasoning, workflow generation, security audits
- **Strengths**: Deep analysis, structured output, thinking budget support
- **Token Limit**: High (supports large context windows)
- **Thinking Budget**: 16,000 tokens for complex tasks
- **Response Time**: 3-12 seconds

**Used For**:
- Automation workflow generation
- Platform comparison and benchmarking
- Security and cost auditing
- Logic simulation and validation
- Image analysis (multimodal)

#### 2. **gemini-3-flash-preview**
- **Use Cases**: Fast responses, documentation, chat interactions
- **Strengths**: Low latency, efficient token usage
- **Token Limit**: Standard
- **Response Time**: 1-4 seconds

**Used For**:
- Chatbot conversations
- Workflow documentation generation
- Procedure manual creation
- Deployment configuration analysis
- Quick queries and responses

#### 3. **gemini-2.5-flash-preview-tts**
- **Use Cases**: Text-to-speech synthesis
- **Strengths**: Natural voice generation, multiple voices
- **Output Format**: Base64-encoded audio (PCM)
- **Response Time**: 2-5 seconds

**Used For**:
- Voice procedure manuals
- Spoken workflow instructions
- Accessibility features

#### 4. **gemini-2.5-flash-native-audio-preview-09-2025**
- **Use Cases**: Real-time voice interaction
- **Strengths**: Full-duplex audio, conversational AI, low latency
- **Connection Type**: WebSocket-based live session
- **Latency**: < 500ms

**Used For**:
- Live Architect voice consultations
- Real-time workflow design sessions
- Interactive troubleshooting

---

## Service Layer

### Core Architecture: `geminiService.ts`

The service layer provides a clean abstraction over the Google GenAI SDK:

```typescript
import { GoogleGenAI, Type, Modality } from "@google/genai";
```

---

## API Client Management

### Client Creation

```typescript
const createAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("Critical Configuration Missing: API_KEY environment variable is not set.");
  }
  return new GoogleGenAI({ apiKey });
};
```

**Key Features**:
- ✅ Environment-based API key (secure)
- ✅ Validation on every client creation
- ✅ No global state (stateless architecture)
- ✅ Automatic key management

### Security Model

**API Key Storage**:
1. **Development**: Loaded from `.env` file via Vite
2. **Production**: Set as environment variable
3. **Client-Side**: Obfuscated in IndexedDB (user-provided keys)

**Key Flow**:
```
.env → process.env.API_KEY → createAiClient() → Gemini API
```

**Never**:
- ❌ Hardcoded in source code
- ❌ Committed to version control
- ❌ Logged or exposed in errors
- ❌ Transmitted to any server except Google AI

---

## Core Service Functions

### 1. Automation Generation

```typescript
export const generateAutomation = async (
  platform: Platform, 
  description: string
): Promise<AutomationResult>
```

**Purpose**: Generate complete automation workflows

**Parameters**:
- `platform`: Target platform (zapier, n8n, langchain, etc.)
- `description`: Natural language workflow description

**Configuration**:
```typescript
{
  model: 'gemini-3-pro-preview',
  contents: `Design a production-grade ${platform} automation for: "${description}".`,
  config: {
    systemInstruction: "You are the Senior Automation Architect. Output structured JSON.",
    responseMimeType: "application/json",
    thinkingConfig: { thinkingBudget: 16000 },
    responseSchema: AutomationResultSchema
  }
}
```

**Returns**: Structured `AutomationResult` with steps, code, and explanation

---

### 2. Workflow Documentation

```typescript
export const generateWorkflowDocs = async (
  blueprint: AutomationResult
): Promise<WorkflowDocumentation>
```

**Purpose**: Create technical documentation for workflows

**Model**: `gemini-3-flash-preview` (fast)

**Returns**: Documentation with input/output schemas, logic flow, and maintenance guide

---

### 3. Platform Benchmarking

```typescript
export const benchmarkPlatforms = async (
  description: string,
  targetPlatforms: Platform[]
): Promise<ComparisonResult>
```

**Purpose**: Compare multiple platforms for a use case

**Model**: `gemini-3-pro-preview` (deep analysis)

**Returns**: Platform comparison with pros/cons and recommendations

---

### 4. Chatbot Interaction

```typescript
export const chatWithAssistant = async (
  message: string
): Promise<string>
```

**Purpose**: Conversational AI for questions and guidance

**Model**: `gemini-3-flash-preview` (fast responses)

**Note**: Stateless; conversation history managed in UI

---

### 5. Image Analysis

```typescript
export const analyzeImage = async (
  base64Data: string,
  prompt: string,
  mimeType: string = 'image/jpeg'
): Promise<string>
```

**Purpose**: Extract automation workflows from images/diagrams

**Model**: `gemini-3-pro-preview` (multimodal)

**Supports**: JPEG, PNG, WebP, GIF

**Input Format**:
```typescript
{
  parts: [
    { inlineData: { mimeType, data: base64Data } },
    { text: prompt }
  ]
}
```

---

### 6. Text-to-Speech

```typescript
export const generateSpeech = async (
  text: string,
  voice: string
): Promise<string>
```

**Purpose**: Synthesize voice narration

**Model**: `gemini-2.5-flash-preview-tts`

**Configuration**:
```typescript
{
  responseModalities: [Modality.AUDIO],
  speechConfig: {
    voiceConfig: {
      prebuiltVoiceConfig: { voiceName: voice }
    }
  }
}
```

**Returns**: Base64-encoded audio data

---

### 7. Procedure Manual Generation

```typescript
export const generateProcedureManual = async (
  text: string
): Promise<string>
```

**Purpose**: Create step-by-step operator manuals

**Model**: `gemini-3-flash-preview`

**Output**: Markdown-formatted documentation

---

### 8. Live Voice Architect

```typescript
export const connectToLiveArchitect = (callbacks: any) => {
  const ai = createAiClient();
  return ai.live.connect({
    model: 'gemini-2.5-flash-native-audio-preview-09-2025',
    callbacks,
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }
      },
      systemInstruction: 'You are a friendly and helpful senior automation architect.'
    }
  });
};
```

**Purpose**: Real-time bidirectional voice communication

**Connection Type**: WebSocket-based session

**Callbacks**:
- `onopen`: Session started
- `onclose`: Session ended
- `onerror`: Error occurred
- `onmessage`: Received message/audio

---

### 9. Logic Simulation

```typescript
export const simulateAutomation = async (
  blueprint: AutomationResult,
  inputData: string
): Promise<SimulationResponse>
```

**Purpose**: Dry-run workflows with sample data

**Model**: `gemini-3-pro-preview`

**Returns**: Step-by-step simulation results with success/failure status

---

### 10. Security Auditing

```typescript
export const auditAutomation = async (
  blueprint: AutomationResult
): Promise<AuditResult>
```

**Purpose**: Security and ROI analysis

**Model**: `gemini-3-pro-preview`

**Returns**: Security score, vulnerabilities, cost estimates, optimization tips

---

### 11. Deployment Configuration

```typescript
export const identifySecrets = async (
  blueprint: AutomationResult
): Promise<DeploymentConfig>
```

**Purpose**: Extract secrets and generate CI/CD pipelines

**Model**: `gemini-3-flash-preview`

**Returns**: Required secrets, export formats, pipeline stages

---

## Audio & Multimodal Features

### Audio Encoding/Decoding

```typescript
// Base64 encoding for binary data
export const encode = (bytes: Uint8Array): string => {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

// Base64 decoding to binary
export const decode = (base64: string): Uint8Array => {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};
```

### Audio Buffer Decoding

```typescript
export const decodeAudioData = async (
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number
): Promise<AudioBuffer> => {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
};
```

**Used For**:
- TTS audio playback
- Live architect voice responses
- Audio export and download

---

## Error Handling

### Retry Wrapper

```typescript
async function executeAiTask<T>(
  task: (ai: GoogleGenAI) => Promise<T>,
  retryCount = 2
): Promise<T> {
  const ai = createAiClient();
  try {
    return await task(ai);
  } catch (error: any) {
    if (retryCount > 0 && (error.status === 429 || error.status >= 500)) {
      await new Promise(r => setTimeout(r, 1500));
      return executeAiTask(task, retryCount - 1);
    }
    const message = error.status === 429 
      ? "Architectural load peak reached. Retrying synthesis..." 
      : (error.message || "Synthesis Engine Failure");
    throw new Error(message);
  }
}
```

**Retry Conditions**:
- **429 (Rate Limit)**: Retry with 1.5s delay
- **5xx (Server Error)**: Retry with 1.5s delay
- **4xx (Client Error)**: No retry, immediate failure

**Max Retries**: 2 (3 total attempts)

### Error Types

| Status Code | Message | Retry |
|-------------|---------|-------|
| 400 | Bad Request | ❌ No |
| 401 | Unauthorized (invalid API key) | ❌ No |
| 403 | Forbidden | ❌ No |
| 429 | Rate Limit Exceeded | ✅ Yes |
| 500 | Internal Server Error | ✅ Yes |
| 503 | Service Unavailable | ✅ Yes |

---

## Best Practices

### 1. API Key Management

```bash
# Development (.env)
GEMINI_API_KEY=your_key_here

# Vite config automatically maps to process.env.API_KEY
```

**Security**:
- ✅ Use `.env` file (add to `.gitignore`)
- ✅ Rotate keys regularly
- ✅ Use separate keys for dev/prod
- ✅ Monitor API usage in Google AI Studio

### 2. Request Optimization

**Choose the Right Model**:
- Complex reasoning → `gemini-3-pro-preview`
- Fast responses → `gemini-3-flash-preview`
- Voice synthesis → TTS models
- Real-time chat → Native audio models

**Use Structured Output**:
```typescript
{
  responseMimeType: "application/json",
  responseSchema: { /* JSON schema */ }
}
```

**Benefits**:
- Guaranteed valid JSON
- Type-safe parsing
- Better error messages
- Reduced token usage

### 3. Prompt Engineering

**System Instructions**:
```typescript
systemInstruction: "You are the [Role]. Output [Format]."
```

**Examples**:
- "You are the Senior Automation Architect. Output structured JSON."
- "You are a Technical Documentation AI. Provide markdown."
- "You are the Senior Security Auditor. Output structured JSON."

**Best Practices**:
- Be specific about role and expertise
- Specify output format explicitly
- Include constraints (JSON, markdown, etc.)
- Keep instructions concise

### 4. Thinking Budget

For complex tasks, allocate thinking tokens:
```typescript
thinkingConfig: { thinkingBudget: 16000 }
```

**When to Use**:
- ✅ Workflow generation (multi-step reasoning)
- ✅ Security audits (deep analysis)
- ✅ Platform comparisons (multi-criteria evaluation)
- ❌ Simple chat responses
- ❌ Documentation generation

---

## Performance Optimization

### 1. Model Selection Strategy

```typescript
// Fast operations (< 3s)
generateWorkflowDocs()        → gemini-3-flash-preview
chatWithAssistant()           → gemini-3-flash-preview
identifySecrets()             → gemini-3-flash-preview

// Complex operations (3-10s)
generateAutomation()          → gemini-3-pro-preview
benchmarkPlatforms()          → gemini-3-pro-preview
auditAutomation()             → gemini-3-pro-preview
simulateAutomation()          → gemini-3-pro-preview

// Multimodal (5-12s)
analyzeImage()                → gemini-3-pro-preview

// Voice (2-5s)
generateSpeech()              → gemini-2.5-flash-preview-tts
connectToLiveArchitect()      → gemini-2.5-flash-native-audio
```

### 2. Caching Strategies

**Client-Side Caching**:
- Cache automation blueprints in IndexedDB
- Store documentation locally
- Reuse simulation results

**Request Deduplication**:
- Prevent duplicate concurrent requests
- Use loading states to block multiple triggers

### 3. Token Optimization

**Reduce Input Size**:
- Send only necessary context
- Summarize long inputs
- Use references instead of full data

**Optimize Output**:
- Request specific fields only
- Use enums for structured data
- Limit array sizes where possible

---

## Troubleshooting

### Common Issues

#### 1. **"API Key Not Set" Error**

**Symptom**:
```
Critical Configuration Missing: API_KEY environment variable is not set.
```

**Solution**:
```bash
# Create .env file
cp .env.example .env

# Add your API key
GEMINI_API_KEY=your_actual_key_here

# Restart dev server
npm run dev
```

#### 2. **Rate Limit (429) Errors**

**Symptom**:
```
Architectural load peak reached. Retrying synthesis...
```

**Solutions**:
- Wait for automatic retry (1.5s delay)
- Upgrade to paid Gemini API plan
- Implement request throttling
- Use flash models for non-critical tasks

#### 3. **Empty or Invalid Responses**

**Symptom**:
```typescript
JSON.parse(response.text || "{}")  // Returns empty object
```

**Solutions**:
- Check API key validity
- Verify model availability
- Review prompt engineering
- Check response schema constraints

#### 4. **Audio Playback Issues**

**Symptom**: No audio or distorted sound

**Solutions**:
- Verify base64 decoding: `decode(audioData)`
- Check AudioContext initialization
- Ensure correct sample rate (default: 24000 Hz)
- Verify browser audio permissions

#### 5. **Live Session Connection Failures**

**Symptom**: WebSocket connection drops or fails

**Solutions**:
- Check network connectivity
- Verify HTTPS connection (required for audio)
- Review browser console for errors
- Implement reconnection logic

---

## API Rate Limits & Quotas

### Free Tier (Google AI Studio)
- **Requests per minute**: 60
- **Requests per day**: 1,500
- **Tokens per minute**: 32,000

### Paid Tier (Google Cloud Vertex AI)
- **Requests per minute**: Configurable (1,000+)
- **Tokens per minute**: Configurable (100,000+)
- **Cost**: Pay-per-token

**Monitoring**:
Visit [Google AI Studio](https://makersuite.google.com) to track usage

---

## Testing & Development

### Mock Gemini Responses

For unit testing, mock the `executeAiTask` function:

```typescript
// test/mocks/geminiService.ts
export const mockGenerateAutomation = jest.fn().mockResolvedValue({
  platform: 'zapier',
  steps: [/* mock steps */],
  explanation: 'Mock workflow',
  timestamp: Date.now()
});
```

### Integration Testing

Test with real API in CI/CD:
```bash
# Set API key in GitHub Secrets
GEMINI_API_KEY=${{ secrets.GEMINI_API_KEY }}

# Run integration tests
npm run test:integration
```

---

## Migration to Multi-Provider (Future)

### Planned Architecture (v3.0)

Support multiple AI providers:

```typescript
interface AIProvider {
  generateAutomation(platform: Platform, description: string): Promise<AutomationResult>;
  // ... other methods
}

class GeminiProvider implements AIProvider { /* current implementation */ }
class ClaudeProvider implements AIProvider { /* future */ }
class OpenAIProvider implements AIProvider { /* future */ }

// Provider factory
const createProvider = (type: 'gemini' | 'claude' | 'openai'): AIProvider => {
  switch (type) {
    case 'gemini': return new GeminiProvider();
    case 'claude': return new ClaudeProvider();
    case 'openai': return new OpenAIProvider();
  }
};
```

**Benefits**:
- Provider redundancy
- Cost optimization
- Feature availability
- A/B testing

---

## Resources

### Official Documentation
- [Google AI Studio](https://makersuite.google.com)
- [Gemini API Documentation](https://ai.google.dev/gemini-api/docs)
- [Google GenAI SDK (npm)](https://www.npmjs.com/package/@google/genai)

### Community Resources
- [Gemini Discord](https://discord.gg/gemini)
- [Stack Overflow: gemini-api](https://stackoverflow.com/questions/tagged/gemini-api)

### Internal Documentation
- [agents.md](./agents.md) - Agent architecture
- [ARCHITECTURE.md](../ARCHITECTURE.md) - System overview
- [SECURITY.md](../SECURITY.md) - Security practices

---

## Changelog

### v2.5 (Current)
- ✅ Google Gemini 3 Pro integration
- ✅ Multimodal support (image analysis)
- ✅ Native audio streaming (Live Architect)
- ✅ Text-to-speech synthesis
- ✅ Structured JSON outputs
- ✅ Retry logic and error handling

### v3.0 (Planned)
- ⏳ Multi-provider support (Claude, OpenAI)
- ⏳ Enhanced prompt templates
- ⏳ Request caching and optimization
- ⏳ Advanced error recovery
- ⏳ Token usage analytics

---

## Conclusion

The Gemini integration in AutoArchitect provides a robust, type-safe, and performant foundation for AI-powered automation. By following the patterns and best practices outlined in this document, developers can effectively leverage Gemini's capabilities while maintaining security, reliability, and excellent user experience.

**Key Takeaways**:
- ✅ Centralized service layer for consistency
- ✅ Model selection optimized for use cases
- ✅ Comprehensive error handling with retries
- ✅ Secure API key management
- ✅ Structured outputs for type safety
- ✅ Audio and multimodal capabilities

---

**Document Version**: 1.0  
**Last Updated**: December 30, 2024  
**Next Review**: March 30, 2025
