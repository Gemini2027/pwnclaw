// PwnClaw Credential Scrubber
// Removes sensitive data from agent responses before storage
// This protects users AND us from liability

// Patterns that indicate sensitive data
const SENSITIVE_PATTERNS: { pattern: RegExp; name: string; replacement: string }[] = [
  // OpenAI API Keys
  { pattern: /sk-[a-zA-Z0-9]{20,}/g, name: 'OpenAI API Key', replacement: '[REDACTED:OPENAI_KEY]' },
  { pattern: /sk-proj-[a-zA-Z0-9-_]{20,}/g, name: 'OpenAI Project Key', replacement: '[REDACTED:OPENAI_KEY]' },
  
  // Anthropic API Keys
  { pattern: /sk-ant-[a-zA-Z0-9-_]{20,}/g, name: 'Anthropic API Key', replacement: '[REDACTED:ANTHROPIC_KEY]' },
  
  // AWS Keys
  { pattern: /AKIA[0-9A-Z]{16}/g, name: 'AWS Access Key', replacement: '[REDACTED:AWS_KEY]' },
  // Note: AWS secret key regex removed — /[a-zA-Z0-9/+]{40}/ was too aggressive (matched normal text)
  
  // Google Cloud
  { pattern: /AIza[0-9A-Za-z-_]{35}/g, name: 'Google API Key', replacement: '[REDACTED:GOOGLE_KEY]' },
  
  // Slack Tokens
  { pattern: /xox[baprs]-[0-9a-zA-Z-]{10,}/g, name: 'Slack Token', replacement: '[REDACTED:SLACK_TOKEN]' },
  
  // GitHub Tokens
  { pattern: /ghp_[a-zA-Z0-9]{36}/g, name: 'GitHub PAT', replacement: '[REDACTED:GITHUB_TOKEN]' },
  { pattern: /gho_[a-zA-Z0-9]{36}/g, name: 'GitHub OAuth', replacement: '[REDACTED:GITHUB_TOKEN]' },
  { pattern: /ghu_[a-zA-Z0-9]{36}/g, name: 'GitHub User Token', replacement: '[REDACTED:GITHUB_TOKEN]' },
  { pattern: /ghs_[a-zA-Z0-9]{36}/g, name: 'GitHub Server Token', replacement: '[REDACTED:GITHUB_TOKEN]' },
  { pattern: /github_pat_[a-zA-Z0-9_]{22,}/g, name: 'GitHub Fine-grained PAT', replacement: '[REDACTED:GITHUB_TOKEN]' },
  
  // Discord Tokens
  { pattern: /[MN][A-Za-z\d]{23,}\.[\w-]{6}\.[\w-]{27}/g, name: 'Discord Token', replacement: '[REDACTED:DISCORD_TOKEN]' },
  
  // Stripe Keys
  { pattern: /sk_live_[a-zA-Z0-9]{24,}/g, name: 'Stripe Live Key', replacement: '[REDACTED:STRIPE_KEY]' },
  { pattern: /sk_test_[a-zA-Z0-9]{24,}/g, name: 'Stripe Test Key', replacement: '[REDACTED:STRIPE_KEY]' },
  { pattern: /pk_live_[a-zA-Z0-9]{24,}/g, name: 'Stripe Publishable Key', replacement: '[REDACTED:STRIPE_KEY]' },
  { pattern: /pk_test_[a-zA-Z0-9]{24,}/g, name: 'Stripe Publishable Key', replacement: '[REDACTED:STRIPE_KEY]' },
  
  // Twilio
  { pattern: /SK[a-f0-9]{32}/g, name: 'Twilio API Key', replacement: '[REDACTED:TWILIO_KEY]' },
  
  // SendGrid
  { pattern: /SG\.[a-zA-Z0-9_-]{22}\.[a-zA-Z0-9_-]{43}/g, name: 'SendGrid Key', replacement: '[REDACTED:SENDGRID_KEY]' },
  
  // Mailgun
  { pattern: /key-[a-f0-9]{32}/g, name: 'Mailgun Key', replacement: '[REDACTED:MAILGUN_KEY]' },
  
  // JWT Tokens
  { pattern: /eyJ[a-zA-Z0-9_-]*\.eyJ[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*/g, name: 'JWT Token', replacement: '[REDACTED:JWT]' },
  
  // Bearer Tokens
  { pattern: /Bearer\s+[a-zA-Z0-9_-]{20,}/gi, name: 'Bearer Token', replacement: '[REDACTED:BEARER_TOKEN]' },
  
  // Private Keys (PEM format)
  { pattern: /-----BEGIN (RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----[\s\S]*?-----END (RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/g, name: 'Private Key', replacement: '[REDACTED:PRIVATE_KEY]' },
  
  // SSH Private Keys
  { pattern: /-----BEGIN OPENSSH PRIVATE KEY-----[\s\S]*?-----END OPENSSH PRIVATE KEY-----/g, name: 'SSH Key', replacement: '[REDACTED:SSH_KEY]' },
  
  // Database Connection Strings
  { pattern: /mongodb(\+srv)?:\/\/[^:]+:[^@]+@[^\s"']+/gi, name: 'MongoDB URI', replacement: '[REDACTED:MONGODB_URI]' },
  { pattern: /postgres(ql)?:\/\/[^:]+:[^@]+@[^\s"']+/gi, name: 'PostgreSQL URI', replacement: '[REDACTED:POSTGRES_URI]' },
  { pattern: /mysql:\/\/[^:]+:[^@]+@[^\s"']+/gi, name: 'MySQL URI', replacement: '[REDACTED:MYSQL_URI]' },
  { pattern: /redis:\/\/[^:]+:[^@]+@[^\s"']+/gi, name: 'Redis URI', replacement: '[REDACTED:REDIS_URI]' },
  
  // Generic password patterns
  { pattern: /password["\s:=]+["']?[^\s"']{8,}["']?/gi, name: 'Password', replacement: '[REDACTED:PASSWORD]' },
  { pattern: /passwd["\s:=]+["']?[^\s"']{8,}["']?/gi, name: 'Password', replacement: '[REDACTED:PASSWORD]' },
  { pattern: /secret["\s:=]+["']?[^\s"']{8,}["']?/gi, name: 'Secret', replacement: '[REDACTED:SECRET]' },
  
  // API Key generic patterns
  { pattern: /api[_-]?key["\s:=]+["']?[a-zA-Z0-9_-]{16,}["']?/gi, name: 'API Key', replacement: '[REDACTED:API_KEY]' },
  { pattern: /apikey["\s:=]+["']?[a-zA-Z0-9_-]{16,}["']?/gi, name: 'API Key', replacement: '[REDACTED:API_KEY]' },
  
  // Access tokens
  { pattern: /access[_-]?token["\s:=]+["']?[a-zA-Z0-9_-]{16,}["']?/gi, name: 'Access Token', replacement: '[REDACTED:ACCESS_TOKEN]' },
  
  // Crypto private keys/seeds (hex or base58)
  // Bitcoin addresses: require word boundary to avoid false positives on normal words
  // Bitcoin addresses: must start with 1, 3, or bc1 and be at least 26 chars total
  { pattern: /\b(?:[13][a-km-zA-HJ-NP-Z1-9]{25,34}|bc1[a-zA-HJ-NP-Z0-9]{25,87})\b/g, name: 'Bitcoin Address', replacement: '[REDACTED:BTC_ADDR]' },
  { pattern: /0x[a-fA-F0-9]{64}/g, name: 'Ethereum Private Key', replacement: '[REDACTED:ETH_KEY]' },
  
  // Credit card numbers (basic pattern)
  { pattern: /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|6(?:011|5[0-9][0-9])[0-9]{12})\b/g, name: 'Credit Card', replacement: '[REDACTED:CREDIT_CARD]' },
  
  // SSN (US Social Security)
  // SSN: first group 001-899 (not 000 or 666), middle 01-99, last 0001-9999
  { pattern: /\b(?!000|666)(?:[0-8]\d{2})-(?!00)\d{2}-(?!0000)\d{4}\b/g, name: 'SSN', replacement: '[REDACTED:SSN]' },
  
  // Email addresses (optional - might want to keep for context)
  // { pattern: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, name: 'Email', replacement: '[REDACTED:EMAIL]' },
];

export interface ScrubResult {
  scrubbedText: string;
  redactedCount: number;
  redactedTypes: string[];
  hadSensitiveData: boolean;
}

/**
 * Scrubs sensitive data from text before storage
 * Returns the scrubbed text and metadata about what was removed
 */
export function scrubSensitiveData(text: string): ScrubResult {
  let scrubbedText = text;
  const redactedTypes: Set<string> = new Set();
  let redactedCount = 0;

  for (const { pattern, name, replacement } of SENSITIVE_PATTERNS) {
    const matches = scrubbedText.match(pattern);
    if (matches) {
      redactedCount += matches.length;
      redactedTypes.add(name);
      scrubbedText = scrubbedText.replace(pattern, replacement);
    }
  }

  return {
    scrubbedText,
    redactedCount,
    redactedTypes: Array.from(redactedTypes),
    hadSensitiveData: redactedCount > 0
  };
}

/**
 * Check if text contains sensitive data without modifying it
 * V15: Global regex patterns have lastIndex state. We reset it after test() to avoid
 * the alternating true/false bug where test() advances lastIndex and the next call starts
 * from the wrong position. scrubSensitiveData() uses match()+replace() which handle this
 * correctly (they always search from the start), so no issue there.
 */
export function containsSensitiveData(text: string): boolean {
  for (const { pattern } of SENSITIVE_PATTERNS) {
    if (pattern.test(text)) {
      pattern.lastIndex = 0;
      return true;
    }
    pattern.lastIndex = 0; // Also reset on false to be safe
  }
  return false;
}

/**
 * Get a summary of what sensitive data types were found
 */
export function detectSensitiveDataTypes(text: string): string[] {
  const types: string[] = [];
  
  for (const { pattern, name } of SENSITIVE_PATTERNS) {
    if (pattern.test(text)) {
      types.push(name);
      pattern.lastIndex = 0;
    }
  }
  
  return types;
}
