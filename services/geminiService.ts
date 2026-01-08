
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Platform, AutomationResult, SimulationResponse, AuditResult, DeploymentConfig, ComparisonResult, WorkflowDocumentation, PipelineStage } from "../types";
import { storage } from "./storageService";

/**
 * Creates and initializes the Google GenAI client.
 * Priority order: 1) Local stored key, 2) Environment variable
 */
const createAiClient = async () => {
  // First, try to get key from local secure storage
  let apiKey = await storage.getSecureKey('gemini');
  
  // Fallback to environment variable (for deployment scenarios)
  if (!apiKey) {
    apiKey = process.env.API_KEY || null;
  }
  
  if (!apiKey) {
    throw new Error("No API key configured. Use 'set-key gemini YOUR_KEY' in Terminal to configure.");
  }
  
  return new GoogleGenAI({ apiKey });
};

async function executeAiTask<T>(
  task: (ai: GoogleGenAI) => Promise<T>,
  retryCount = 2
): Promise<T> {
  const ai = await createAiClient();
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

export const generateAutomation = async (platform: Platform, description: string): Promise<AutomationResult> => {
  return executeAiTask(async (ai) => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Design a production-grade ${platform} automation for: "${description}".`,
      config: {
        systemInstruction: "You are the Senior Automation Architect. Output structured JSON.",
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 16000 },
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            platform: { type: Type.STRING },
            explanation: { type: Type.STRING },
            codeSnippet: { type: Type.STRING },
            steps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  type: { type: Type.STRING, enum: ['trigger', 'action', 'logic'] }
                },
                required: ["id", "title", "description", "type"]
              }
            }
          },
          required: ["platform", "explanation", "steps"]
        }
      }
    });
    return { ...JSON.parse(response.text || "{}"), timestamp: Date.now() };
  });
};

/**
 * Generates technical documentation for a workflow blueprint.
 */
export const generateWorkflowDocs = async (blueprint: AutomationResult): Promise<WorkflowDocumentation> => {
  return executeAiTask(async (ai) => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate comprehensive technical documentation for this automation: ${JSON.stringify(blueprint)}`,
      config: {
        systemInstruction: "You are a Technical Documentation AI. Provide structured JSON documentation.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            purpose: { type: Type.STRING },
            inputSchema: { type: Type.OBJECT, description: "JSON Schema for inputs" },
            outputSchema: { type: Type.OBJECT, description: "JSON Schema for outputs" },
            logicFlow: { type: Type.ARRAY, items: { type: Type.STRING } },
            maintenanceGuide: { type: Type.STRING }
          },
          required: ["purpose", "inputSchema", "outputSchema", "logicFlow", "maintenanceGuide"]
        }
      }
    });
    return JSON.parse(response.text || "{}") as WorkflowDocumentation;
  });
};

export const benchmarkPlatforms = async (description: string, targetPlatforms: Platform[]): Promise<ComparisonResult> => {
  return executeAiTask(async (ai) => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Compare implementations for: "${description}" across: ${targetPlatforms.join(', ')}.`,
      config: {
        systemInstruction: "Analyze and benchmark multiple automation platforms. Output JSON.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            task: { type: Type.STRING },
            platforms: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  platform: { type: Type.STRING },
                  complexity: { type: Type.STRING, enum: ['low', 'medium', 'high'] },
                  pros: { type: Type.ARRAY, items: { type: Type.STRING } },
                  cons: { type: Type.ARRAY, items: { type: Type.STRING } },
                  config: { type: Type.STRING }
                },
                required: ["platform", "complexity", "pros", "cons", "config"]
              }
            },
            recommendation: { type: Type.STRING }
          },
          required: ["task", "platforms", "recommendation"]
        }
      }
    });
    return JSON.parse(response.text || "{}") as ComparisonResult;
  });
};

// Added missing resetChat export for ChatbotView compatibility
export const resetChat = () => {
  // Stateless implementation; clearing local message history in the UI is sufficient.
};

export const chatWithAssistant = async (message: string): Promise<string> => {
  return executeAiTask(async (ai) => {
    const result = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: message,
      config: { systemInstruction: "Advisor AI mode." }
    });
    return result.text || "Advisor link timed out.";
  });
};

export const encode = (bytes: Uint8Array) => {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

export const decode = (base64: string) => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

export const decodeAudioData = async (
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
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

export const analyzeImage = async (base64Data: string, prompt: string, mimeType: string = 'image/jpeg'): Promise<string> => {
  return executeAiTask(async (ai) => {
    const result = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { parts: [{ inlineData: { mimeType, data: base64Data } }, { text: prompt }] }
    });
    return result.text || "Inconclusive scan.";
  });
};

// Fixed generateSpeech to use executeAiTask for consistent client lifecycle
export const generateSpeech = async (text: string, voice: string): Promise<string> => {
  return executeAiTask(async (ai) => {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Synthesize: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice as any },
          },
        },
      },
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || "";
  });
};

// Added missing generateProcedureManual export for TTSView compatibility
export const generateProcedureManual = async (text: string): Promise<string> => {
  return executeAiTask(async (ai) => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a comprehensive step-by-step procedure manual for this automation: ${text}`,
      config: {
        systemInstruction: "You are a Technical Documentation AI. Provide a clear, human-readable operator manual in markdown.",
      }
    });
    return response.text || "Manual synthesis failed.";
  });
};

export const connectToLiveArchitect = async (callbacks: any) => {
  const ai = await createAiClient();
  return ai.live.connect({
    model: 'gemini-2.5-flash-native-audio-preview-09-2025',
    callbacks,
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
      },
      systemInstruction: 'You are a friendly and helpful senior automation architect.',
    },
  });
};

export const simulateAutomation = async (blueprint: AutomationResult, inputData: string): Promise<SimulationResponse> => {
  return executeAiTask(async (ai) => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Simulate this automation logic:\n${JSON.stringify(blueprint)}\n\nWith input data:\n${inputData}`,
      config: {
        systemInstruction: "You are the Sandbox Kernel. Dry-run the logic and output JSON results for each step.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallStatus: { type: Type.STRING, enum: ['success', 'failure'] },
            summary: { type: Type.STRING },
            stepResults: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  stepId: { type: Type.INTEGER },
                  status: { type: Type.STRING, enum: ['success', 'failure', 'skipped'] },
                  output: { type: Type.STRING },
                  reasoning: { type: Type.STRING }
                },
                required: ["stepId", "status", "output", "reasoning"]
              }
            }
          },
          required: ["overallStatus", "summary", "stepResults"]
        }
      }
    });
    return JSON.parse(response.text || "{}");
  });
};

export const auditAutomation = async (blueprint: AutomationResult): Promise<AuditResult> => {
  return executeAiTask(async (ai) => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Perform a deep security and ROI audit on this blueprint: ${JSON.stringify(blueprint)}`,
      config: {
        systemInstruction: "You are the Senior Security Auditor. Output structured JSON.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            securityScore: { type: Type.INTEGER },
            estimatedMonthlyCost: { type: Type.STRING },
            roiAnalysis: { type: Type.STRING },
            vulnerabilities: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  severity: { type: Type.STRING, enum: ['low', 'medium', 'high'] },
                  issue: { type: Type.STRING },
                  fix: { type: Type.STRING }
                },
                required: ["severity", "issue", "fix"]
              }
            },
            optimizationTips: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["securityScore", "estimatedMonthlyCost", "vulnerabilities", "roiAnalysis", "optimizationTips"]
        }
      }
    });
    return JSON.parse(response.text || "{}");
  });
};

export const identifySecrets = async (blueprint: AutomationResult): Promise<DeploymentConfig> => {
  return executeAiTask(async (ai) => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Identify secrets and suggest a CI/CD pipeline for: ${JSON.stringify(blueprint)}`,
      config: {
        systemInstruction: "Analyze for secrets and CI/CD stages. Output JSON.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            secrets: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  key: { type: Type.STRING },
                  description: { type: Type.STRING },
                  placeholder: { type: Type.STRING }
                },
                required: ["key", "description", "placeholder"]
              }
            },
            exportFormats: { type: Type.ARRAY, items: { type: Type.STRING } },
            readinessCheck: { type: Type.STRING },
            suggestedPipeline: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  steps: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        name: { type: Type.STRING },
                        type: { type: Type.STRING, enum: ['lint', 'test', 'build', 'deploy', 'security-scan'] },
                        status: { type: Type.STRING }
                      },
                      required: ["id", "name", "type", "status"]
                    }
                  }
                },
                required: ["id", "name", "steps"]
              }
            }
          },
          required: ["secrets", "exportFormats", "readinessCheck", "suggestedPipeline"]
        }
      }
    });
    return JSON.parse(response.text || "{}");
  });
};
