# Claude Integration Documentation

## Current Status

**Integration Status**: ⚠️ **Platform Reference Only**  
**Version**: 2.5.0  
**Last Updated**: December 30, 2024

---

## Overview

Currently, **Claude/Anthropic is not directly integrated** as an AI service provider in AutoArchitect. The codebase references Anthropic/Claude exclusively as a **target automation platform** for workflow generation, not as an alternative to Google Gemini for powering the AutoArchitect application itself.

### What This Means

✅ **Supported**: AutoArchitect can **generate automation workflows** that integrate with Anthropic's Claude API  
❌ **Not Supported**: AutoArchitect does not use Claude as the underlying AI engine (it uses Google Gemini exclusively)

---

## Anthropic as a Target Platform

### Purpose

When users select **Anthropic** as their target platform in the Automation Generator, the system generates workflows that:

1. **Authenticate** with Anthropic's API using API keys
2. **Send prompts** to Claude models (Claude 3 Opus, Sonnet, Haiku)
3. **Process responses** for document analysis, reasoning tasks, or content generation
4. **Integrate** Claude into multi-step automation flows (e.g., Zapier → Claude → Airtable)

### Platform Configuration

**File**: `views/AutomationGeneratorView.tsx` (lines 60-69)

```typescript
{
  id: 'anthropic',
  label: 'Anthropic',
  tagline: 'Constitutional Reasoning',
  logo: 'https://images.unsplash.com/photo-1620712943543-bcc4628c71d5',
  brandIcon: 'https://logo.clearbit.com/anthropic.com',
  color: 'bg-[#cc9b7a]',
  tier: 'Enterprise AI',
  tooltip: 'High-trust Claude-3 logic for complex document processing and reliable multi-step reasoning.'
}
```

### Use Cases for Anthropic-Target Workflows

1. **Document Intelligence**: Generate workflows that send PDFs/contracts to Claude for analysis
2. **Content Moderation**: Automate content review using Claude's constitutional AI principles
3. **Code Review**: Create automation that submits code to Claude for security/quality analysis
4. **Research Synthesis**: Aggregate data and send to Claude for summarization
5. **Multi-Agent Orchestration**: Combine Claude with other AI services (OpenAI, LangChain) in a single workflow

### Example Generated Workflow

When a user requests: *"Analyze customer support tickets with Claude and categorize them"*

**Generated Automation Steps**:
```json
{
  "platform": "anthropic",
  "steps": [
    {
      "id": 1,
      "title": "Trigger: New Support Ticket",
      "description": "Monitor helpdesk for new ticket creation",
      "type": "trigger"
    },
    {
      "id": 2,
      "title": "Extract Ticket Content",
      "description": "Parse ticket body, subject, and metadata",
      "type": "action"
    },
    {
      "id": 3,
      "title": "Analyze with Claude 3",
      "description": "Send ticket to Claude for sentiment + category analysis",
      "type": "action"
    },
    {
      "id": 4,
      "title": "Route Based on Urgency",
      "description": "If urgent, escalate; else, queue for agent",
      "type": "logic"
    }
  ],
  "codeSnippet": "// Pseudo-code for Anthropic API integration\nconst response = await anthropic.messages.create({\n  model: 'claude-3-opus-20240229',\n  max_tokens: 1024,\n  messages: [{ role: 'user', content: ticketText }]\n});"
}
```

---

## Why Only Gemini for AutoArchitect's AI?

### Current Architecture Decision

AutoArchitect uses **Google Gemini** exclusively because:

1. **Unified API Surface**: Gemini provides consistent structured output schemas, audio synthesis, and vision in a single SDK
2. **Thinking Budget**: Gemini 3 Pro's `thinkingConfig` enables deep reasoning for complex workflow generation
3. **Multimodal Native**: Seamless image analysis and audio I/O without service switching
4. **Cost Efficiency**: Gemini Flash models offer competitive pricing for high-volume operations
5. **Development Focus**: Maintaining one AI provider reduces integration complexity

### Trade-Offs

**Advantages of Current Approach**:
- Simpler codebase (one SDK to maintain)
- Consistent error handling and retry logic
- Unified authentication
- Faster time-to-market

**Potential Benefits of Claude Integration** (future):
- Model diversity for better results on specific tasks
- Redundancy if Gemini experiences outages
- User choice for preferred AI provider
- Cost optimization by routing tasks to cheapest model

---

## Future Claude Integration Roadmap

### Phase 1: Dual-Model Support (v3.0)

**Goal**: Allow users to choose between Gemini and Claude as the underlying AI engine.

**Implementation**:
1. **Abstraction Layer**: Create `AIProvider` interface
   ```typescript
   interface AIProvider {
     generateAutomation(platform: Platform, description: string): Promise<AutomationResult>;
     chatWithAssistant(message: string): Promise<string>;
     analyzeImage(base64: string, prompt: string): Promise<string>;
     // ... other methods
   }
   ```
2. **Provider Implementations**:
   - `GeminiProvider` (existing)
   - `ClaudeProvider` (new)
3. **User Configuration**: Add provider selection to Profile view
4. **API Key Management**: Support multiple API keys (Gemini + Anthropic)
5. **Feature Parity**: Ensure Claude can handle all AutoArchitect features

**Challenges**:
- Claude lacks native TTS/audio → Need fallback to Gemini or third-party service
- Different structured output formats → Adapter pattern required
- Cost implications → Need usage tracking per provider

---

### Phase 2: Intelligent Model Routing (v3.5)

**Goal**: Automatically route requests to the best model for each task.

**Routing Logic**:
| Task | Best Model | Rationale |
|------|-----------|-----------|
| Complex reasoning | Claude 3 Opus | Superior logic for multi-step problems |
| Fast chat | Gemini Flash | Low latency, cost-effective |
| Image analysis | Gemini Pro | Native multimodal |
| Code generation | Claude 3 Sonnet | Strong coding capabilities |
| Audio synthesis | Gemini TTS | Native audio support |
| Long documents | Claude 3 Opus | 200K token context window |

**Implementation**:
```typescript
async function routeRequest(task: AITask): Promise<AIProvider> {
  const rules: RoutingRule[] = [
    { condition: (t) => t.type === 'audio', provider: 'gemini' },
    { condition: (t) => t.complexity === 'high', provider: 'claude' },
    { condition: (t) => t.priority === 'cost', provider: 'gemini-flash' },
    // ... more rules
  ];
  return selectProvider(task, rules);
}
```

---

### Phase 3: Multi-Agent Collaboration (v4.0)

**Goal**: Use both Gemini and Claude together in a single request for better results.

**Example**: Workflow Generation with Dual Review
1. **Claude generates workflow** (strong reasoning)
2. **Gemini performs security audit** (fast iteration)
3. **Claude refines based on audit** (self-correction)
4. **Return best version to user**

**Implementation**:
```typescript
async function collaborativeGeneration(description: string): Promise<AutomationResult> {
  const claudeResult = await claudeProvider.generateAutomation(platform, description);
  const audit = await geminiProvider.auditAutomation(claudeResult);
  
  if (audit.securityScore < 80) {
    return claudeProvider.refineAutomation(claudeResult, audit.vulnerabilities);
  }
  
  return claudeResult;
}
```

---

## API Key Management for Claude

### Current State

The `.env.example` file only includes `API_KEY` (for Gemini):
```bash
API_KEY=your_gemini_api_key_here
```

### Future State

For dual-provider support, the configuration would expand:
```bash
# Primary AI Provider (gemini or claude)
AI_PROVIDER=gemini

# Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Anthropic Claude API Key (optional)
ANTHROPIC_API_KEY=your_claude_api_key_here

# Model Routing Strategy (auto, gemini-only, claude-only, hybrid)
MODEL_ROUTING_STRATEGY=auto
```

### Security Considerations

- Both keys stored in IndexedDB with obfuscation
- Never transmitted to backend (client-side only)
- User can revoke/rotate keys in Profile view
- Separate key scopes prevent cross-contamination
- Rate limiting per provider to avoid quota exhaustion

---

## Anthropic API Integration Guide (For Future Implementation)

### 1. Install SDK

```bash
npm install @anthropic-ai/sdk
```

### 2. Create Provider Class

```typescript
import Anthropic from '@anthropic-ai/sdk';

class ClaudeProvider implements AIProvider {
  private client: Anthropic;

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
  }

  async generateAutomation(platform: Platform, description: string): Promise<AutomationResult> {
    const response = await this.client.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: `Design a production-grade ${platform} automation for: "${description}". Output as JSON with fields: platform, explanation, steps (array of {id, title, description, type}), codeSnippet.`
      }]
    });

    const result = JSON.parse(response.content[0].text);
    return { ...result, timestamp: Date.now() };
  }

  // Implement other AIProvider methods...
}
```

### 3. Handle Structured Output

Unlike Gemini's native JSON schema support, Claude requires:
- **Explicit prompting**: "Output as JSON with the following structure..."
- **Post-processing**: Validate and sanitize Claude's JSON responses
- **Retry logic**: If JSON parsing fails, retry with stricter instructions

### 4. Feature Gaps & Workarounds

| Feature | Gemini | Claude | Workaround |
|---------|--------|--------|-----------|
| Structured Output | ✅ Native | ❌ Prompt-based | Strict prompts + validation |
| Audio Synthesis | ✅ TTS models | ❌ None | Use Gemini TTS or ElevenLabs |
| Live Audio | ✅ Real-time | ❌ None | Use Gemini Live Architect |
| Vision | ✅ Multimodal | ✅ Image support | Both work well |
| Long Context | ✅ 2M tokens | ✅ 200K tokens | Use Claude for documents |

---

## Testing Strategy for Dual-Provider Support

### Unit Tests
```typescript
describe('AIProvider Interface', () => {
  it('should generate automation with Gemini', async () => {
    const gemini = new GeminiProvider(process.env.GEMINI_API_KEY!);
    const result = await gemini.generateAutomation('zapier', 'Send email on form submit');
    expect(result.steps.length).toBeGreaterThan(0);
  });

  it('should generate automation with Claude', async () => {
    const claude = new ClaudeProvider(process.env.ANTHROPIC_API_KEY!);
    const result = await claude.generateAutomation('zapier', 'Send email on form submit');
    expect(result.steps.length).toBeGreaterThan(0);
  });
});
```

### Integration Tests
- Verify both providers return same structure
- Test failover (if Gemini fails, try Claude)
- Validate cost tracking per provider

### A/B Testing
- Route 50% of users to each provider
- Measure quality (user satisfaction scores)
- Measure latency (response time)
- Measure cost (API spend per user)

---

## Cost Comparison

### Gemini Pricing (as of 2024)
- **Flash**: $0.0002/1K tokens (input), $0.0006/1K tokens (output)
- **Pro**: $0.001/1K tokens (input), $0.003/1K tokens (output)

### Claude Pricing (as of 2024)
- **Haiku**: $0.00025/1K tokens (input), $0.00125/1K tokens (output)
- **Sonnet**: $0.003/1K tokens (input), $0.015/1K tokens (output)
- **Opus**: $0.015/1K tokens (input), $0.075/1K tokens (output)

### Cost Optimization Strategy

For a typical AutoArchitect workflow generation (2K input, 3K output tokens):

| Model | Input Cost | Output Cost | Total |
|-------|-----------|-------------|-------|
| Gemini Flash | $0.0004 | $0.0018 | **$0.0022** ✅ Cheapest |
| Gemini Pro | $0.002 | $0.009 | $0.011 |
| Claude Haiku | $0.0005 | $0.00375 | $0.00425 |
| Claude Sonnet | $0.006 | $0.045 | $0.051 |
| Claude Opus | $0.03 | $0.225 | $0.255 ❌ Most expensive |

**Recommendation**: Use Gemini Flash for 80% of tasks, Claude Sonnet for complex reasoning (10%), Gemini Pro for multimodal (10%).

---

## Migration Path

### Step 1: Refactor geminiService.ts
- Extract interface: `AIProvider`
- Rename to `providers/gemini.ts`
- Keep existing functions as GeminiProvider methods

### Step 2: Implement ClaudeProvider
- Create `providers/claude.ts`
- Implement AIProvider interface
- Handle Claude-specific quirks (no native JSON schema)

### Step 3: Add Provider Factory
```typescript
// providers/factory.ts
export function createAIProvider(type: 'gemini' | 'claude'): AIProvider {
  const apiKey = type === 'gemini' 
    ? process.env.GEMINI_API_KEY 
    : process.env.ANTHROPIC_API_KEY;
  
  return type === 'gemini' 
    ? new GeminiProvider(apiKey) 
    : new ClaudeProvider(apiKey);
}
```

### Step 4: Update Views
- Replace `import { generateAutomation } from '../services/geminiService'`
- With: `const provider = createAIProvider(userPreference)`
- Minimal changes to view logic

### Step 5: Update Configuration
- Add provider selection to ProfileView
- Update .env.example with both keys
- Document migration in CHANGELOG.md

---

## Conclusion

While AutoArchitect currently uses Google Gemini exclusively, the architecture is **designed for extensibility**. Adding Claude/Anthropic as an alternative AI provider is a planned enhancement for v3.0+. The current implementation references Anthropic only as a **target platform** for automation workflows, not as the underlying AI engine.

For users who want to **generate workflows that integrate with Claude's API**, AutoArchitect already supports this. For users who want to **power AutoArchitect itself with Claude**, this feature is on the roadmap and will be prioritized based on community demand.

---

## Related Documentation

- [Gemini Service Documentation](./gemini.md) - Current AI provider details
- [Architecture Overview](./ARCHITECTURE.md) - System design patterns
- [Roadmap](./ROADMAP.md) - Future development plans
- [Contributing Guide](./CONTRIBUTING.md) - How to add new AI providers

---

**Status**: 📋 **Documentation Only** (No Active Integration)  
**Priority**: 🔵 **Medium** (Planned for v3.0)  
**Community Interest**: Open for discussion in [GitHub Discussions](https://github.com/Krosebrook/AutoArchtect/discussions)

---

**Last Updated**: December 30, 2024  
**Version**: 2.5.0  
**Maintainer**: AutoArchitect Team
