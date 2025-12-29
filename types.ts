export enum AppView {
  GENERATOR = 'GENERATOR',
  CHATBOT = 'CHATBOT',
  IMAGE_ANALYSIS = 'IMAGE_ANALYSIS',
  TTS = 'TTS',
  LIVE_CONSULTANT = 'LIVE_CONSULTANT',
  LOGIC_SANDBOX = 'LOGIC_SANDBOX',
  AUDIT = 'AUDIT',
  DEPLOYMENT = 'DEPLOYMENT',
  VAULT = 'VAULT',
  COMPARATOR = 'COMPARATOR',
  TERMINAL = 'TERMINAL',
  PROFILE = 'PROFILE'
}

export type Platform = 'zapier' | 'n8n' | 'langchain' | 'make' | 'pipedream' | 'google-sheets' | 'airtable' | 'shopify' | 'openai' | 'anthropic';

export type StepType = 'trigger' | 'action' | 'logic';

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface AutomationStep {
  id: number;
  title: string;
  description: string;
  type: StepType;
}

export interface AutomationResult {
  platform: Platform;
  steps: AutomationStep[];
  codeSnippet?: string;
  explanation: string;
  sources?: GroundingSource[];
  timestamp?: number;
  documentation?: WorkflowDocumentation;
}

export interface WorkflowDocumentation {
  purpose: string;
  inputSchema: any;
  outputSchema: any;
  logicFlow: string[];
  maintenanceGuide: string;
}

export interface PipelineStep {
  id: string;
  name: string;
  type: 'lint' | 'test' | 'build' | 'deploy' | 'security-scan';
  status: 'pending' | 'active' | 'success' | 'failed';
}

export interface PipelineStage {
  id: string;
  name: string;
  steps: PipelineStep[];
}

export interface ComparisonResult {
  task: string;
  platforms: {
    platform: Platform;
    complexity: 'low' | 'medium' | 'high';
    pros: string[];
    cons: string[];
    config: string;
  }[];
  recommendation: string;
}

export interface SavedBlueprint extends AutomationResult {
  id: string;
  name: string;
  version: string;
}

export interface UserProfile {
  name: string;
  role: string;
  avatarSeed: string;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    defaultPlatform: Platform;
    autoAudit: boolean;
  };
}

export interface TerminalEntry {
  id: string;
  type: 'command' | 'response' | 'error' | 'info';
  content: string;
  timestamp: number;
}

export interface SecretRequirement {
  key: string;
  description: string;
  placeholder: string;
}

export interface DeploymentConfig {
  secrets: SecretRequirement[];
  exportFormats: string[];
  readinessCheck: string;
  suggestedPipeline?: PipelineStage[];
}

export interface AuditResult {
  securityScore: number;
  estimatedMonthlyCost: string;
  vulnerabilities: {
    severity: 'low' | 'medium' | 'high';
    issue: string;
    fix: string;
  }[];
  roiAnalysis: string;
  optimizationTips: string[];
}

export interface SimulationResponse {
  overallStatus: 'success' | 'failure';
  stepResults: {
    stepId: number;
    status: 'success' | 'failure' | 'skipped';
    output: string;
    reasoning: string;
  }[];
  summary: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

export interface VoiceModel {
  id: string;
  name: string;
  description: string;
  type: string;
}

export interface ApiError {
  message: string;
  code?: string | number;
  details?: any;
}

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
}
