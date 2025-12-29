
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Platform, AutomationResult, SimulationResponse, AuditResult, DeploymentConfig, ComparisonResult } from "../types";
import { storage } from "./storageService";

/**
 * Creates and initializes the Google GenAI client using the API key from storage or environment.
 */
const createAiClient = async () => {
  const storedKey = await storage.getKey('gemini');
  const apiKey = storedKey || process.env.API_KEY;
  if (!apiKey) {
    throw new Error("Critical Configuration Missing: API Key required from Terminal (set-key gemini <key>) or environment.");
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Utility wrapper to handle common AI task logic including retries and client creation.
 */
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

/**
 * Generates an automation blueprint for a specific platform and description.
 */
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
 * Compares and benchmarks multiple automation platforms for a given task.
 */
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

/**
 * Simple advisor chat without history state persistence in service.
 */
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

/**
 * Resets the chat session (stateless at service level, handled by UI).
 */
export const resetChat = () => {
  // UI maintains the message history; service is currently stateless.
};

/**
 * Encodes bytes to base64 string.
 */
export const encode = (bytes: Uint8Array) => {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

/**
 * Decodes base64 string to Uint8Array.
 */
export const decode = (base64: string) => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

/**
 * Decodes raw PCM audio data into an AudioBuffer.
 */
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

/**
 * Analyzes an image and extracts text description.
 */
export const analyzeImage = async (base64Data: string, prompt: string, mimeType: string = 'image/jpeg'): Promise<string> => {
  return executeAiTask(async (ai) => {
    const result = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { parts: [{ inlineData: { mimeType, data: base64Data } }, { text: prompt }] }
    });
    return result.text || "Inconclusive scan.";
  });
};

/**
 * Generates speech audio from text using the TTS model.
 */
export const generateSpeech = async (text: string, voice: string): Promise<string> => {
  const ai = await createAiClient();
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
};

/**
 * Generates a technical operator manual for a description.
 */
export const generateProcedureManual = async (text: string): Promise<string> => {
  return executeAiTask(async (ai) => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Write a technical operator manual for this automation: ${text}`,
      config: { systemInstruction: "Technical Writer mode." }
    });
    return response.text || "Manual generation failed.";
  });
};

/**
 * Connects to the Gemini Live API for real-time audio design.
 */
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

/**
 * Simulates automation logic within a dry-run kernel.
 */
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

/**
 * Audits a blueprint for security and cost efficiency.
 */
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

/**
 * Scans a blueprint to identify required secrets for deployment.
 */
export const identifySecrets = async (blueprint: AutomationResult): Promise<DeploymentConfig> => {
  return executeAiTask(async (ai) => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Identify all environmental secrets and export formats for: ${JSON.stringify(blueprint)}`,
      config: {
        systemInstruction: "Scan for OAuth, API keys, and sensitive vars. Output JSON.",
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
            readinessCheck: { type: Type.STRING }
          },
          required: ["secrets", "exportFormats", "readinessCheck"]
        }
      }
    });
    return JSON.parse(response.text || "{}");
  });
};
