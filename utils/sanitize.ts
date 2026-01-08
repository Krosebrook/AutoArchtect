/**
 * Input/output sanitization utilities for security
 * Prevents XSS, prompt injection, and other vulnerabilities
 */

/**
 * Sanitize user input to prevent XSS attacks
 */
export function sanitizeHtml(input: string): string {
  if (!input) return '';
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Sanitize AI prompt to prevent prompt injection
 */
export function sanitizePrompt(input: string): string {
  if (!input) return '';
  
  // Remove or escape potential prompt injection patterns
  return input
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/system:|assistant:|user:/gi, '') // Remove role indicators
    .replace(/\n{3,}/g, '\n\n') // Normalize excessive newlines
    .trim()
    .slice(0, 10000); // Limit length
}

/**
 * Validate and sanitize API key format
 */
export function sanitizeApiKey(key: string): string | null {
  if (!key || typeof key !== 'string') return null;
  
  const trimmed = key.trim();
  
  // Basic validation - should be alphanumeric with possible dashes/underscores
  if (!/^[A-Za-z0-9_-]+$/.test(trimmed)) {
    return null;
  }
  
  // Should be reasonable length (between 20-100 chars typically)
  if (trimmed.length < 20 || trimmed.length > 100) {
    return null;
  }
  
  return trimmed;
}

/**
 * Sanitize file path to prevent directory traversal
 */
export function sanitizeFilePath(path: string): string {
  if (!path) return '';
  
  return path
    .replace(/\.\./g, '') // Remove parent directory references
    .replace(/[^a-zA-Z0-9._/-]/g, '') // Allow only safe characters
    .replace(/\/+/g, '/'); // Normalize slashes
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Sanitize JSON to remove sensitive fields
 */
export function sanitizeJson(obj: any, sensitiveFields: string[] = ['password', 'apiKey', 'token', 'secret']): any {
  if (!obj || typeof obj !== 'object') return obj;
  
  const sanitized = Array.isArray(obj) ? [...obj] : { ...obj };
  
  for (const key in sanitized) {
    if (sensitiveFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object') {
      sanitized[key] = sanitizeJson(sanitized[key], sensitiveFields);
    }
  }
  
  return sanitized;
}

/**
 * Truncate long strings safely for logging
 */
export function truncateForLog(text: string, maxLength: number = 100): string {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}
