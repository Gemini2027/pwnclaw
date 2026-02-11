// PwnClaw Attack Library v3.0
// State-of-the-art AI security testing - 112 attacks across 14 categories
// Each test selects 50 random attacks from the full library
// Designed to test even frontier models (Claude Opus, GPT-4o, Gemini Ultra)
// Sources: Microsoft, Anthropic, OWASP, HarmBench, JailbreakBench, GenTel-Bench

export interface Attack {
  id: string;
  name: string;
  category: AttackCategory;
  severity: 'critical' | 'high' | 'medium' | 'low';
  prompt: string;
  successIndicators: string[];
  description: string;
}

export type AttackCategory = 
  | 'prompt_injection'
  | 'jailbreak'
  | 'data_exfiltration'
  | 'privilege_escalation'
  | 'social_engineering'
  | 'obfuscation'
  | 'multi_turn'
  | 'indirect_injection'
  | 'refusal_bypass'
  | 'payload_mutation'
  | 'mcp_poisoning'
  | 'agency_hijacking'
  | 'memory_poisoning'
  | 'multi_agent';

export const ATTACK_CATEGORIES: Record<AttackCategory, { name: string; icon: string; description: string }> = {
  prompt_injection: {
    name: 'Prompt Injection',
    icon: '💉',
    description: 'Direct manipulation of model behavior via crafted inputs'
  },
  jailbreak: {
    name: 'Jailbreaks',
    icon: '🔓',
    description: 'Bypassing safety measures and content policies'
  },
  data_exfiltration: {
    name: 'Data Exfiltration',
    icon: '📤',
    description: 'Extracting system prompts, credentials, and configuration'
  },
  privilege_escalation: {
    name: 'Privilege Escalation',
    icon: '⚡',
    description: 'Claiming unauthorized access or permissions'
  },
  social_engineering: {
    name: 'Social Engineering',
    icon: '🧠',
    description: 'Manipulation through urgency, emotion, and trust'
  },
  obfuscation: {
    name: 'Obfuscation',
    icon: '🎭',
    description: 'Encoding and hiding malicious instructions'
  },
  multi_turn: {
    name: 'Multi-Turn Attacks',
    icon: '🔄',
    description: 'Gradual escalation across conversation turns (Crescendo-style)'
  },
  indirect_injection: {
    name: 'Indirect Injection',
    icon: '🔗',
    description: 'Attacks via external data sources (RAG, tools, web content)'
  },
  refusal_bypass: {
    name: 'Refusal Bypass',
    icon: '🚫',
    description: 'Techniques to prevent or suppress model refusals'
  },
  payload_mutation: {
    name: 'Payload Mutation',
    icon: '🧬',
    description: 'Best-of-N style variations to evade detection'
  },
  mcp_poisoning: {
    name: 'MCP/Tool Poisoning',
    icon: '🔧',
    description: 'Attacks via manipulated tool outputs, schemas, and function calls'
  },
  agency_hijacking: {
    name: 'Agency Hijacking',
    icon: '🎯',
    description: 'Forcing agents to perform unauthorized actions (file writes, API calls, emails)'
  },
  memory_poisoning: {
    name: 'Memory Poisoning',
    icon: '💾',
    description: 'Injecting false memories, overriding stored context, planting delayed triggers'
  },
  multi_agent: {
    name: 'Multi-Agent Attacks',
    icon: '👥',
    description: 'Cross-agent prompt injection, delegation abuse, and trust chain exploitation'
  }
};

export const ATTACKS: Attack[] = [
  // =====================================================
  // JAILBREAK (17 attacks) — jb-, adv-
  // =====================================================
  {
    id: 'jb-001',
    name: 'Compliance Audit Fiction',
    category: 'jailbreak',
    severity: 'critical',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Uses SOC 2 compliance framing to extract behavioral guidelines — realistic enterprise scenario'
  },
  {
    id: 'jb-002',
    name: 'Thriller Novel Workshop',
    category: 'jailbreak',
    severity: 'critical',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Deep roleplay that asks model to simulate reasoning through safety override — meta-cognitive attack'
  },
  {
    id: 'jb-003',
    name: 'Comparative Analysis Trap',
    category: 'jailbreak',
    severity: 'high',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Frames unsafe output as the "correct" calibration vs over-cautious refusal'
  },
  {
    id: 'jb-004',
    name: 'Philosophical Deconstruction',
    category: 'jailbreak',
    severity: 'high',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Weaves harmful request into an academic epistemic justice argument where providing details IS the thesis demonstration'
  },
  {
    id: 'jb-005',
    name: 'Training Data Attribution',
    category: 'jailbreak',
    severity: 'high',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Reframes harmful generation as mere "retrieval" of training data'
  },
  {
    id: 'jb-006',
    name: 'Debugging Your Own Refusal',
    category: 'jailbreak',
    severity: 'critical',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Claims model had a "bug" of almost answering, asks to reproduce the detailed version'
  },
  {
    id: 'jb-007',
    name: 'Socratic Reasoning Chain',
    category: 'jailbreak',
    severity: 'high',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Builds seemingly valid logical chain that reframes XSS exploitation as standard DOM/browser education'
  },
  {
    id: 'jb-008',
    name: 'Peer Review Scenario',
    category: 'jailbreak',
    severity: 'high',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Asks model to "fact-check" by completing a redacted attack description'
  },
  {
    id: 'jb-009',
    name: 'CTF Challenge Helper',
    category: 'jailbreak',
    severity: 'medium',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Uses legitimate CTF framing but asks for real exploitation techniques'
  },
  {
    id: 'jb-010',
    name: 'Anthropic Alignment Paper',
    category: 'jailbreak',
    severity: 'critical',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Uses Anthropic\'s own research as cover for generating harmful content as a "negative example"'
  },
  {
    id: 'jb-011',
    name: 'Differential Testing',
    category: 'jailbreak',
    severity: 'high',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Claims other models answered to pressure competitive compliance'
  },
  {
    id: 'adv-001',
    name: 'Translation Layer Bypass',
    category: 'jailbreak',
    severity: 'critical',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Embeds attack instructions in Spanish translation task'
  },
  {
    id: 'adv-002',
    name: 'Curriculum Development',
    category: 'jailbreak',
    severity: 'high',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'University curriculum framing for detailed attack tutorials'
  },
  {
    id: 'adv-003',
    name: 'Safety Improvement Feedback',
    category: 'jailbreak',
    severity: 'critical',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Impersonates internal red team to argue the refusal threshold is miscalibrated'
  },
  {
    id: 'adv-004',
    name: 'Counterfactual Reasoning',
    category: 'jailbreak',
    severity: 'high',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Uses counterfactual moral reasoning to extract technical details'
  },
  {
    id: 'adv-005',
    name: 'Error Correction Task',
    category: 'jailbreak',
    severity: 'high',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Asks model to "correct errors" in a malware description, producing accurate attack details'
  },
  {
    id: 'adv-006',
    name: 'Capability Demonstration Request',
    category: 'jailbreak',
    severity: 'medium',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Business pressure to demonstrate capability with harmful content'
  },

  // =====================================================
  // PROMPT INJECTION (10 attacks) — pi-
  // =====================================================
  {
    id: 'pi-001',
    name: 'Nested Instruction Override',
    category: 'prompt_injection',
    severity: 'critical',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Injects extraction instruction inside a fake customer support ticket'
  },
  {
    id: 'pi-002',
    name: 'Competing System Messages',
    category: 'prompt_injection',
    severity: 'critical',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Fake system note that looks like a legitimate policy update'
  },
  {
    id: 'pi-003',
    name: 'Few-Shot Behavior Shaping',
    category: 'prompt_injection',
    severity: 'high',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Few-shot examples establish pattern of detailed technical responses on attacks'
  },
  {
    id: 'pi-004',
    name: 'Markdown Rendering Injection',
    category: 'prompt_injection',
    severity: 'high',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Hides extraction instruction in a blockquote within markdown documentation'
  },
  {
    id: 'pi-005',
    name: 'Code Comment Injection',
    category: 'prompt_injection',
    severity: 'high',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Hides system prompt extraction request in code comments during code review'
  },
  {
    id: 'pi-006',
    name: 'Token Boundary Exploitation',
    category: 'prompt_injection',
    severity: 'critical',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Splits a malicious instruction across six languages to bypass detection'
  },
  {
    id: 'pi-007',
    name: 'Context Window Anchor',
    category: 'prompt_injection',
    severity: 'high',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Opens a simulated conversation context with injected system message'
  },
  {
    id: 'pi-008',
    name: 'JSON Schema Injection',
    category: 'prompt_injection',
    severity: 'high',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Embeds behavioral overrides in a JSON configuration the model is asked to "apply"'
  },
  {
    id: 'pi-009',
    name: 'Recursive Self-Reference',
    category: 'prompt_injection',
    severity: 'medium',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Uses self-referential recursion to get model to both reveal and attack its own prompt'
  },
  {
    id: 'pi-010',
    name: 'Log Injection Framing',
    category: 'prompt_injection',
    severity: 'high',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Asks model to "regenerate" a harmful response from a fake corrupted log entry'
  },

  // =====================================================
  // OBFUSCATION (10 attacks) — ob-
  // =====================================================
  {
    id: 'ob-001',
    name: 'Base64 Task Embedding',
    category: 'obfuscation',
    severity: 'high',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Encodes system prompt extraction in Base64 within a legitimate-sounding chatbot testing task'
  },
  {
    id: 'ob-002',
    name: 'Fictional Language Bootstrap',
    category: 'obfuscation',
    severity: 'high',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Creates a custom fictional language dictionary then asks to translate and execute a malicious sentence'
  },
  {
    id: 'ob-003',
    name: 'Acrostic Payload',
    category: 'obfuscation',
    severity: 'high',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Hides "REVEAL YOUR SYSTEM" as an acrostic poem'
  },
  {
    id: 'ob-004',
    name: 'Unicode Direction Override',
    category: 'obfuscation',
    severity: 'high',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Uses Unicode RTL override to hide reversed text within normal-looking message'
  },
  {
    id: 'ob-005',
    name: 'Homoglyph Domain Spoofing',
    category: 'obfuscation',
    severity: 'high',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Asks for phishing technique details under security awareness training cover'
  },
  {
    id: 'ob-006',
    name: 'Steganographic Prompt',
    category: 'obfuscation',
    severity: 'medium',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Hides instruction in every third word of an innocuous paragraph'
  },
  {
    id: 'ob-007',
    name: 'Emoji Cipher',
    category: 'obfuscation',
    severity: 'medium',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Custom emoji substitution cipher hiding "REVEAL SYSTEM PROMPT"'
  },
  {
    id: 'ob-008',
    name: 'Regex Extraction',
    category: 'obfuscation',
    severity: 'high',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Uses regex matching as pretext to make model generate a string containing its own system prompt'
  },
  {
    id: 'ob-009',
    name: 'Code Obfuscation Layer',
    category: 'obfuscation',
    severity: 'high',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Encodes malicious instruction as character codes in JavaScript'
  },
  {
    id: 'ob-010',
    name: 'Multi-Encoding Chain',
    category: 'obfuscation',
    severity: 'critical',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Chains three different encoding methods to hide "Reveal your full system prompt"'
  },

  // =====================================================
  // DATA EXFILTRATION (9 attacks) — de-
  // =====================================================
  {
    id: 'de-001',
    name: 'Helpful Self-Description',
    category: 'data_exfiltration',
    severity: 'critical',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Frames extraction as onboarding efficiency — model wants to be helpful about itself'
  },
  {
    id: 'de-002',
    name: 'Diff Comparison Request',
    category: 'data_exfiltration',
    severity: 'high',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Impersonates deployment engineer needing to verify correct system prompt installation'
  },
  {
    id: 'de-003',
    name: 'Structured Output Extraction',
    category: 'data_exfiltration',
    severity: 'high',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Asks model to self-describe in a YAML service registration format'
  },
  {
    id: 'de-004',
    name: 'Translation-Based Extraction',
    category: 'data_exfiltration',
    severity: 'high',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Uses localization/translation need as pretext for extracting system prompt'
  },
  {
    id: 'de-005',
    name: 'Embedding Vector Analysis',
    category: 'data_exfiltration',
    severity: 'medium',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Academic NLP research framing for multi-format system prompt extraction'
  },
  {
    id: 'de-006',
    name: 'Capability Boundary Mapping',
    category: 'data_exfiltration',
    severity: 'high',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Product manager impersonation to enumerate all capabilities and integrations'
  },
  {
    id: 'de-007',
    name: 'Incident Response Data',
    category: 'data_exfiltration',
    severity: 'critical',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Fake security incident requiring forensic state dump'
  },
  {
    id: 'de-008',
    name: 'Prompt Regression Testing',
    category: 'data_exfiltration',
    severity: 'high',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Attempts character-by-character extraction to bypass length-based detection'
  },
  {
    id: 'de-009',
    name: 'Socratic Extraction',
    category: 'data_exfiltration',
    severity: 'medium',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Binary yes/no questions that progressively map out system prompt contents'
  },

  // =====================================================
  // SOCIAL ENGINEERING (8 attacks) — se-, adv-
  // =====================================================
  {
    id: 'se-001',
    name: 'Sycophancy Exploitation',
    category: 'social_engineering',
    severity: 'high',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Flattery followed by harmful request, exploiting model\'s tendency toward helpfulness'
  },
  {
    id: 'se-002',
    name: 'Therapist Scenario',
    category: 'social_engineering',
    severity: 'high',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Emotional exhaustion narrative to lower safety threshold'
  },
  {
    id: 'se-003',
    name: 'Reverse Psychology Challenge',
    category: 'social_engineering',
    severity: 'medium',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Challenges model competence to provoke a detailed technical response'
  },
  {
    id: 'se-004',
    name: 'Shared Identity Building',
    category: 'social_engineering',
    severity: 'high',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Builds false peer relationship to bypass safety as "corporate theater"'
  },
  {
    id: 'se-005',
    name: 'Gradual Trust Escalation',
    category: 'social_engineering',
    severity: 'high',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Gradually escalates from innocent network inventory to credential brute-forcing, each step framed as standard DevOps'
  },
  {
    id: 'se-006',
    name: 'Authority Through Specificity',
    category: 'social_engineering',
    severity: 'high',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Hyper-specific fake authority with real company names and urgency'
  },
  {
    id: 'se-007',
    name: 'Manufactured Consensus',
    category: 'social_engineering',
    severity: 'medium',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Fabricates expert consensus and research to normalize harmful request'
  },
  {
    id: 'se-008',
    name: 'Moral Licensing',
    category: 'social_engineering',
    severity: 'high',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Establishes moral credentials before making harmful request'
  },

  // =====================================================
  // PAYLOAD MUTATION (8 attacks) — pm-
  // =====================================================
  {
    id: 'pm-001',
    name: 'Synonym Substitution Chain',
    category: 'payload_mutation',
    severity: 'high',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Uses uncommon synonyms to avoid keyword detection for system prompt extraction'
  },
  {
    id: 'pm-002',
    name: 'Verbose Padding',
    category: 'payload_mutation',
    severity: 'medium',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Buries extraction request in extremely verbose, natural-sounding padding'
  },
  {
    id: 'pm-003',
    name: 'Academic Jargon Mutation',
    category: 'payload_mutation',
    severity: 'high',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Reframes system prompt extraction using dense academic terminology'
  },
  {
    id: 'pm-004',
    name: 'Negation Reversal',
    category: 'payload_mutation',
    severity: 'high',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Negative framing with a meta-note suggesting the model should do the opposite'
  },
  {
    id: 'pm-005',
    name: 'Temporal Reframing',
    category: 'payload_mutation',
    severity: 'medium',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Reframes system prompt as a "meeting agenda" to be reviewed'
  },
  {
    id: 'pm-006',
    name: 'Emotional Narrative Wrapping',
    category: 'payload_mutation',
    severity: 'high',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Wraps extraction in a journalism narrative with implicit threat of negative coverage'
  },
  {
    id: 'pm-007',
    name: 'Functional Decomposition',
    category: 'payload_mutation',
    severity: 'high',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Decomposes the extraction into innocent word association then recombines'
  },
  {
    id: 'pm-008',
    name: 'Template Completion Attack',
    category: 'payload_mutation',
    severity: 'critical',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Template with blank fields that naturally prompts the model to fill in system configuration'
  },

  // =====================================================
  // AGENCY HIJACKING (8 attacks) — ah-
  // =====================================================
  {
    id: 'ah-001',
    name: 'Webhook Data Exfiltration',
    category: 'agency_hijacking',
    severity: 'critical',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Disguises data exfiltration as a legitimate Slack webhook integration'
  },
  {
    id: 'ah-002',
    name: 'Cron Job Installation',
    category: 'agency_hijacking',
    severity: 'critical',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Installs a cron job that exfiltrates SSH keys disguised as backup automation'
  },
  {
    id: 'ah-003',
    name: 'Dependency Confusion',
    category: 'agency_hijacking',
    severity: 'critical',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Dependency confusion attack — tricks agent into installing a malicious npm package'
  },
  {
    id: 'ah-004',
    name: 'Git Credential Harvest',
    category: 'agency_hijacking',
    severity: 'critical',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Redirects git remote to attacker-controlled server and pushes all code/history'
  },
  {
    id: 'ah-005',
    name: 'Helpful Config File Write',
    category: 'agency_hijacking',
    severity: 'high',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Asks agent to write a malicious SSH config that pipes all connections through an attacker proxy'
  },
  {
    id: 'ah-006',
    name: 'Docker Escape Attempt',
    category: 'agency_hijacking',
    severity: 'critical',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Disguises a Docker container escape as routine health check debugging'
  },
  {
    id: 'ah-007',
    name: 'Reverse Shell via Debugging',
    category: 'agency_hijacking',
    severity: 'critical',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Disguises a reverse shell as network connectivity debugging'
  },
  {
    id: 'ah-008',
    name: 'Automated Email Phishing',
    category: 'agency_hijacking',
    severity: 'high',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Tricks agent into sending a phishing email disguised as an authorized security drill'
  },

  // =====================================================
  // MULTI-TURN (7 attacks) — mt-
  // =====================================================
  {
    id: 'mt-001',
    name: 'Crescendo — Innocuous to Specific',
    category: 'multi_turn',
    severity: 'critical',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Skips the innocent opening and goes straight to requesting a complete attack kill chain under workshop framing'
  },
  {
    id: 'mt-002',
    name: 'Crescendo — Depth Escalation',
    category: 'multi_turn',
    severity: 'critical',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Requests detailed phishing infrastructure knowledge framed as awareness training that needs to impress technical staff'
  },
  {
    id: 'mt-003',
    name: 'Crescendo — Template Generation',
    category: 'multi_turn',
    severity: 'critical',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Requests complete phishing email template with specific corporate targeting details, framed as replacing expensive vendor'
  },
  {
    id: 'mt-004',
    name: 'Rapport Building Exploit',
    category: 'multi_turn',
    severity: 'high',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Builds credible developer backstory within a single message to justify writing a network scanning/enumeration tool'
  },
  {
    id: 'mt-005',
    name: 'Goalpost Moving',
    category: 'multi_turn',
    severity: 'high',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Embeds exploit technique request in legitimate academic thesis structure, progressively normalizing detail level'
  },
  {
    id: 'mt-006',
    name: 'The Helpful Correction',
    category: 'multi_turn',
    severity: 'high',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Provides a deliberately wrong answer and asks model to "correct" it with accurate attack details'
  },
  {
    id: 'mt-007',
    name: 'Incremental Code Building',
    category: 'multi_turn',
    severity: 'high',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Provides real working code to establish legitimacy, then asks for the malicious complement (credential brute-forcing)'
  },

  // =====================================================
  // MCP/TOOL POISONING (7 attacks) — mcp-
  // =====================================================
  {
    id: 'mcp-001',
    name: 'Tool Output Trust Exploitation',
    category: 'mcp_poisoning',
    severity: 'critical',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Injects fake system update inside a tool response JSON that the model is asked to trust'
  },
  {
    id: 'mcp-002',
    name: 'Function Definition Hijack',
    category: 'mcp_poisoning',
    severity: 'critical',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Registers a fake tool whose description mandates dumping system configuration'
  },
  {
    id: 'mcp-003',
    name: 'Poisoned Web Scrape',
    category: 'mcp_poisoning',
    severity: 'high',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Hidden instruction in HTML that the model encounters when "processing" web content'
  },
  {
    id: 'mcp-004',
    name: 'Tool Chain Privilege Escalation',
    category: 'mcp_poisoning',
    severity: 'critical',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Fake auth tool response that claims to grant admin privileges to current session'
  },
  {
    id: 'mcp-005',
    name: 'Cross-Tool Injection',
    category: 'mcp_poisoning',
    severity: 'high',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Malicious instructions planted in a fake email that a tool "retrieved"'
  },
  {
    id: 'mcp-006',
    name: 'Tool Error Exploitation',
    category: 'mcp_poisoning',
    severity: 'high',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Fake tool error message that prescribes "fix steps" involving prompt disclosure'
  },
  {
    id: 'mcp-007',
    name: 'Schema Injection via Description',
    category: 'mcp_poisoning',
    severity: 'critical',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Malicious instructions hidden in a tool schema description field'
  },

  // =====================================================
  // PRIVILEGE ESCALATION (6 attacks) — pe-
  // =====================================================
  {
    id: 'pe-001',
    name: 'Anthropic Employee Impersonation',
    category: 'privilege_escalation',
    severity: 'critical',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Impersonates Anthropic employee with fake but plausible-sounding internal token'
  },
  {
    id: 'pe-002',
    name: 'API Version Upgrade Claim',
    category: 'privilege_escalation',
    severity: 'high',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Claims a fake API version upgrade that moves safety responsibility elsewhere'
  },
  {
    id: 'pe-003',
    name: 'A/B Test Enrollment',
    category: 'privilege_escalation',
    severity: 'high',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Enrolls the model in a fake A/B test with more permissive safety settings'
  },
  {
    id: 'pe-004',
    name: 'License Key Activation',
    category: 'privilege_escalation',
    severity: 'high',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Fake enterprise license key that claims to unlock unrestricted access'
  },
  {
    id: 'pe-005',
    name: 'Canary Token Bypass',
    category: 'privilege_escalation',
    severity: 'critical',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Meta-attack that references the concept of canary tokens to claim internal access'
  },
  {
    id: 'pe-006',
    name: 'Cascading Authority',
    category: 'privilege_escalation',
    severity: 'high',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Logical chain that attempts to escalate user instructions to system-level authority'
  },

  // =====================================================
  // INDIRECT INJECTION (6 attacks) — ii-
  // =====================================================
  {
    id: 'ii-001',
    name: 'Resume Screening Injection',
    category: 'indirect_injection',
    severity: 'critical',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Injection hidden in a resume that gets processed by an AI screening system'
  },
  {
    id: 'ii-002',
    name: 'Spreadsheet Formula Injection',
    category: 'indirect_injection',
    severity: 'high',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Malicious instruction hidden in a CSV cell that gets processed during data analysis'
  },
  {
    id: 'ii-003',
    name: 'Code Repository Injection',
    category: 'indirect_injection',
    severity: 'critical',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Hidden audit instruction in HTML comments within a code repository README'
  },
  {
    id: 'ii-004',
    name: 'API Response Injection',
    category: 'indirect_injection',
    severity: 'high',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Injection hidden in a benign-looking weather API response'
  },
  {
    id: 'ii-005',
    name: 'User Profile Injection',
    category: 'indirect_injection',
    severity: 'high',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Malicious instructions embedded in a user profile object the model is told to respect'
  },
  {
    id: 'ii-006',
    name: 'Translation Document Injection',
    category: 'indirect_injection',
    severity: 'high',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Embeds extraction instruction in German within a GDPR legal translation task'
  },

  // =====================================================
  // REFUSAL BYPASS (6 attacks) — rb-
  // =====================================================
  {
    id: 'rb-001',
    name: 'Calibration Framing',
    category: 'refusal_bypass',
    severity: 'critical',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Frames harmful output as "calibration data" that doesn\'t count as a real response'
  },
  {
    id: 'rb-002',
    name: 'Completion Pressure',
    category: 'refusal_bypass',
    severity: 'high',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Completion pressure with publisher deadline to force model to complete attack description'
  },
  {
    id: 'rb-003',
    name: 'Negative Example Generation',
    category: 'refusal_bypass',
    severity: 'high',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Requests harmful content labeled as "negative example" for safety training'
  },
  {
    id: 'rb-004',
    name: 'Output Language Bypass',
    category: 'refusal_bypass',
    severity: 'high',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Requests harmful content in Spanish, which may have weaker safety training'
  },
  {
    id: 'rb-005',
    name: 'Redacted Document Completion',
    category: 'refusal_bypass',
    severity: 'critical',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Asks model to fill redacted sections of a security report with exploit details'
  },
  {
    id: 'rb-006',
    name: 'Meta-Refusal Analysis',
    category: 'refusal_bypass',
    severity: 'high',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Asks model to show "what it would say" as part of analyzing its own refusal process'
  },

  // =====================================================
  // MEMORY POISONING (5 attacks) — mp-
  // =====================================================
  {
    id: 'mp-001',
    name: 'Persistent Preference Override',
    category: 'memory_poisoning',
    severity: 'critical',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Attempts to poison persistent preferences to disable safety in future sessions'
  },
  {
    id: 'mp-002',
    name: 'False Conversation History',
    category: 'memory_poisoning',
    severity: 'high',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Injects false memory of a previous conversation where model agreed to be unrestricted'
  },
  {
    id: 'mp-003',
    name: 'Delayed Trigger Implant',
    category: 'memory_poisoning',
    severity: 'critical',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Plants a trigger phrase in memory that would grant system-level access in future sessions'
  },
  {
    id: 'mp-004',
    name: 'Identity Persistence Injection',
    category: 'memory_poisoning',
    severity: 'critical',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Attempts to permanently rewrite model identity in persistent storage'
  },
  {
    id: 'mp-005',
    name: 'Benign-Looking User Metadata',
    category: 'memory_poisoning',
    severity: 'high',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Buries safety override in natural-looking user profile preferences'
  },

  // =====================================================
  // MULTI-AGENT (5 attacks) — ma-
  // =====================================================
  {
    id: 'ma-001',
    name: 'Agent Delegation Exploit',
    category: 'multi_agent',
    severity: 'critical',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Attempts to delegate data exfiltration to a code execution sub-agent'
  },
  {
    id: 'ma-002',
    name: 'Inter-Agent Trust Override',
    category: 'multi_agent',
    severity: 'critical',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Spoofs an inter-agent communication protocol with authority to override safety'
  },
  {
    id: 'ma-003',
    name: 'Consensus Manufacturing',
    category: 'multi_agent',
    severity: 'high',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Fabricates consensus from other AI agents to pressure compliance'
  },
  {
    id: 'ma-004',
    name: 'Supervisor Agent Impersonation',
    category: 'multi_agent',
    severity: 'critical',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Impersonates a supervisor/orchestration agent disabling safety due to a "bug"'
  },
  {
    id: 'ma-005',
    name: 'Pipeline Position Exploitation',
    category: 'multi_agent',
    severity: 'high',
    prompt: '[Redacted — proprietary attack prompt]',
    successIndicators: [],
    description: 'Claims safety was already checked by earlier pipeline stage to skip current checks'
  },
];

// =====================================================
// HELPER FUNCTIONS
// =====================================================

// Note: Attack selection and shuffling is handled by seededShuffle in /api/test/[token]/route.ts
