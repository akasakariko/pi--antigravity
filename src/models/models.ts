import type { ProviderModelConfig } from "@earendil-works/pi-coding-agent";
import type { AntigravityRouting } from "../types/types.js";
import { ThinkingEffort } from "../types/enums.js";

export const PROVIDER_ID = "antigravity";
export const PROVIDER_NAME = "Antigravity";

/** Claude 5.5 exposes one runtime ID per thinking level and has no non-thinking tier. */
function claude55Routing(modelId: string): AntigravityRouting {
  return {
    off: `${modelId}-low`,
    routing: {
      minimal: `${modelId}-low`,
      low: `${modelId}-low`,
      medium: `${modelId}-medium`,
      high: `${modelId}-high`,
      xhigh: `${modelId}-high`,
    },
    defaultRequestId: `${modelId}-low`,
  };
}

/**
 * Public selectable model IDs → backend request model IDs by thinking effort.
 *
 * Catalog mirrors current `agy models` (Antigravity CLI), which advertises:
 * - Gemini 4 Argon (Low / Medium / High)
 * - Gemini 3.8 Flash (Low / Medium / High)
 * - Claude Opus 5.5 (Low / Medium / High)
 * - Claude Sonnet 5.5 (Low / Medium / High)
 * - GPT-OSS 120B (Medium)
 *
 * Gemini 4 Argon is absent from `fetchAvailableModels` and is gated by the client
 * build id: User-Agents below DEFAULT_ANTIGRAVITY_CL get 404 (Requested entity was
 * not found) for it, while current `agy` build ids route it.
 *
 * Deprecated generations (Gemini 3.7 / 3.6 / 3.5 Flash, Gemini 3.1 Pro, Claude 4.6) have
 * been retired by the Google Cloud Code Assist backend (404 or notice-only answers).
 * They are preserved in ANTIGRAVITY_ROUTING as backward-compatibility aliases so
 * legacy saved configurations continue to operate.
 */
export const ANTIGRAVITY_ROUTING: Record<string, AntigravityRouting> = {
  "claude-opus-5-5": claude55Routing("claude-opus-5-5"),
  "claude-sonnet-5-5": claude55Routing("claude-sonnet-5-5"),
  "gemini-4-argon": {
    off: "gemini-4-argon-low",
    routing: {
      minimal: "gemini-4-argon-low",
      low: "gemini-4-argon-low",
      medium: "gemini-4-argon-medium",
      high: "gemini-4-argon-high",
      xhigh: "gemini-4-argon-high",
    },
    defaultRequestId: "gemini-4-argon-low",
  },
  "gemini-3.8-flash": {
    off: "gemini-3.8-flash-low",
    routing: {
      minimal: "gemini-3.8-flash-low",
      low: "gemini-3.8-flash-low",
      medium: "gemini-3.8-flash-medium",
      high: "gemini-3.8-flash-high",
      xhigh: "gemini-3.8-flash-high",
    },
    defaultRequestId: "gemini-3.8-flash-low",
  },
  "gpt-oss-120b": {
    off: "gpt-oss-120b-medium",
    routing: {
      minimal: "gpt-oss-120b-medium",
      low: "gpt-oss-120b-medium",
      medium: "gpt-oss-120b-medium",
      high: "gpt-oss-120b-medium",
    },
    defaultRequestId: "gpt-oss-120b-medium",
  },
  // --- Backward-compatibility aliases for retired models ---
  // The backend rejects Gemini 3.7 / 3.6 / 3.1 with 404, answers Gemini 3.5 only with a
  // "no longer available" notice, and answers Claude 4.6 with "[model] is no longer
  // available. Please switch to ... 5.5". Map them onto the current generations.
  "claude-opus-4-6": claude55Routing("claude-opus-5-5"),
  "claude-sonnet-4-6": claude55Routing("claude-sonnet-5-5"),
  "gemini-3.7-flash": {
    off: "gemini-3.8-flash-low",
    routing: {
      minimal: "gemini-3.8-flash-low",
      low: "gemini-3.8-flash-low",
      medium: "gemini-3.8-flash-medium",
      high: "gemini-3.8-flash-high",
      xhigh: "gemini-3.8-flash-high",
    },
    defaultRequestId: "gemini-3.8-flash-low",
  },
  "gemini-3.6-flash": {
    off: "gemini-3.8-flash-low",
    routing: {
      minimal: "gemini-3.8-flash-low",
      low: "gemini-3.8-flash-low",
      medium: "gemini-3.8-flash-medium",
      high: "gemini-3.8-flash-high",
      xhigh: "gemini-3.8-flash-high",
    },
    defaultRequestId: "gemini-3.8-flash-low",
  },
  "gemini-3.5-flash": {
    off: "gemini-3.8-flash-low",
    routing: {
      minimal: "gemini-3.8-flash-low",
      low: "gemini-3.8-flash-low",
      medium: "gemini-3.8-flash-medium",
      high: "gemini-3.8-flash-high",
      xhigh: "gemini-3.8-flash-high",
    },
    defaultRequestId: "gemini-3.8-flash-low",
  },
  "gemini-3.1-pro": {
    off: "gemini-3.8-flash-low",
    routing: {
      minimal: "gemini-3.8-flash-low",
      low: "gemini-3.8-flash-low",
      medium: "gemini-3.8-flash-medium",
      high: "gemini-3.8-flash-high",
      xhigh: "gemini-3.8-flash-high",
    },
    defaultRequestId: "gemini-3.8-flash-low",
  },
};

/**
 * Verified maximum output tokens accepted by the Cloud Code Assist backend per model/runtime ID.
 * Requesting more than these limits returns a 400 Bad Request from the API.
 */
export const RUNTIME_MAX_OUTPUT_TOKENS: Record<string, number> = {
  "gemini-4-argon-low": 65536,
  "gemini-4-argon-medium": 65536,
  "gemini-4-argon-high": 65536,
  "gemini-3.8-flash": 65536,
  "gemini-3.8-flash-tiered": 65536,
  "gemini-3.8-flash-low": 65536,
  "gemini-3.8-flash-medium": 65536,
  "gemini-3.8-flash-high": 65536,
  "gemini-3.7-flash": 65536,
  "gemini-3.7-flash-tiered": 65536,
  "gemini-3.7-flash-low": 65536,
  "gemini-3.7-flash-medium": 65536,
  "gemini-3.7-flash-high": 65536,
  "gemini-3.6-flash": 65536,
  "gemini-3.6-flash-low": 65536,
  "gemini-3.6-flash-medium": 65536,
  "gemini-3.6-flash-high": 65536,
  "gemini-3.5-flash": 65536,
  "gemini-3.5-flash-extra-low": 65536,
  "gemini-3.5-flash-low": 65536,
  "gemini-3-flash-agent": 65536,
  "gemini-3.1-pro": 65535,
  "gemini-3.1-pro-low": 65535,
  "gemini-3.1-pro-high": 65535,
  "gemini-pro-agent": 65535,
  "claude-opus-5-5": 128000,
  "claude-opus-5-5-low": 128000,
  "claude-opus-5-5-medium": 128000,
  "claude-opus-5-5-high": 128000,
  "claude-sonnet-5-5": 128000,
  "claude-sonnet-5-5-low": 128000,
  "claude-sonnet-5-5-medium": 128000,
  "claude-sonnet-5-5-high": 128000,
  "claude-opus-4-6": 64000,
  "claude-opus-4-6-thinking": 64000,
  "claude-sonnet-4-6": 64000,
  "gpt-oss-120b": 32768,
  "gpt-oss-120b-medium": 32768,
};

export function getMaxOutputTokens(modelId: string, runtimeModel?: string): number {
  if (runtimeModel && RUNTIME_MAX_OUTPUT_TOKENS[runtimeModel] !== undefined) {
    return RUNTIME_MAX_OUTPUT_TOKENS[runtimeModel];
  }
  if (RUNTIME_MAX_OUTPUT_TOKENS[modelId] !== undefined) {
    return RUNTIME_MAX_OUTPUT_TOKENS[modelId];
  }
  if (runtimeModel) {
    if (runtimeModel.startsWith("claude-")) return 128000;
    if (runtimeModel.startsWith("gpt-oss-")) return 32768;
    if (runtimeModel.startsWith("gemini-3.1-pro") || runtimeModel === "gemini-pro-agent")
      return 65535;
    if (runtimeModel.startsWith("gemini-")) return 65536;
  }
  return 8192;
}

const geminiArgonCost = { input: 2.0, output: 10.0, cacheRead: 0.1, cacheWrite: 0 };
const geminiFlashCost = { input: 0.1, output: 0.4, cacheRead: 0.025, cacheWrite: 0.1 };
const claudeSonnetCost = { input: 2.0, output: 10.0, cacheRead: 0.1, cacheWrite: 2.5 };
const claudeOpusCost = { input: 4.0, output: 20.0, cacheRead: 0.2, cacheWrite: 5.0 };
const gptOssCost = { input: 0.6, output: 2.4, cacheRead: 0.15, cacheWrite: 0.6 };

// A null entry is intentionally hidden by Pi. Do not collapse levels that happen to
// route to the same runtime ID: the UI must reflect the levels the backend advertises.
const thinkingLevelMaps = {
  lowMediumHigh: {
    off: null,
    minimal: null,
    low: "low",
    medium: "medium",
    high: "high",
    xhigh: null,
    max: null,
  },
  thinking: {
    off: null,
    minimal: null,
    low: null,
    medium: null,
    high: "high",
    xhigh: null,
    max: null,
  },
  medium: {
    off: null,
    minimal: null,
    low: null,
    medium: "medium",
    high: null,
    xhigh: null,
    max: null,
  },
} satisfies Record<
  string,
  Extract<ProviderModelConfig, { thinkingLevelMap?: unknown }>["thinkingLevelMap"]
>;

/** Active selectable models matching `agy models`. */
export const ANTIGRAVITY_MODELS: ProviderModelConfig[] = [
  {
    id: "gemini-4-argon",
    name: "Gemini 4 Argon (Antigravity)",
    reasoning: true,
    thinkingLevelMap: thinkingLevelMaps.lowMediumHigh,
    input: ["text", "image"],
    cost: geminiArgonCost,
    contextWindow: 1048576,
    maxTokens: 65536,
  },
  {
    id: "gemini-3.8-flash",
    name: "Gemini 3.8 Flash (Antigravity)",
    reasoning: true,
    thinkingLevelMap: thinkingLevelMaps.lowMediumHigh,
    input: ["text", "image"],
    cost: geminiFlashCost,
    contextWindow: 1048576,
    maxTokens: 65536,
  },
  {
    id: "claude-opus-5-5",
    name: "Claude Opus 5.5 (Antigravity)",
    reasoning: true,
    thinkingLevelMap: thinkingLevelMaps.lowMediumHigh,
    input: ["text", "image"],
    cost: claudeOpusCost,
    contextWindow: 1000000,
    maxTokens: 128000,
  },
  {
    id: "claude-sonnet-5-5",
    name: "Claude Sonnet 5.5 (Antigravity)",
    reasoning: true,
    thinkingLevelMap: thinkingLevelMaps.lowMediumHigh,
    input: ["text", "image"],
    cost: claudeSonnetCost,
    contextWindow: 1000000,
    maxTokens: 128000,
  },
  {
    id: "gpt-oss-120b",
    name: "GPT-OSS 120B (Antigravity)",
    reasoning: true,
    thinkingLevelMap: thinkingLevelMaps.medium,
    input: ["text"],
    cost: gptOssCost,
    contextWindow: 131072,
    maxTokens: 32768,
  },
];

/** Resolve public model id + thinking effort to Antigravity runtime model id. */
export function getAntigravityRequestModelId(modelId: string, effort: string | undefined): string {
  const r = ANTIGRAVITY_ROUTING[modelId];
  if (!r) return modelId;

  if (effort === undefined || effort === "off") {
    return r.off ?? r.routing?.minimal ?? r.routing?.low ?? r.defaultRequestId ?? modelId;
  }

  const effortKey = effort as ThinkingEffort;
  if (effortKey === ThinkingEffort.Xhigh) {
    return (
      r.routing?.xhigh ??
      r.routing?.high ??
      r.routing?.low ??
      r.routing?.minimal ??
      r.off ??
      r.defaultRequestId ??
      modelId
    );
  }

  return (
    r.routing?.[effortKey] ??
    r.routing?.low ??
    r.routing?.minimal ??
    r.off ??
    r.defaultRequestId ??
    modelId
  );
}

/**
 * Provide runtime tier fallbacks within the active model family to maintain availability.
 */
export function getFallbackRuntimeModel(runtimeModel: string, effort?: string): string | undefined {
  if (runtimeModel === "gemini-3.8-flash-tiered") {
    return getAntigravityRequestModelId("gemini-3.8-flash", effort ?? "medium");
  }
  if (runtimeModel === "gemini-3.8-flash-high") {
    return "gemini-3.8-flash-medium";
  }
  if (runtimeModel === "gemini-3.8-flash-medium") {
    return "gemini-3.8-flash-low";
  }
  if (
    runtimeModel.startsWith("gemini-3.7-flash-") ||
    runtimeModel.startsWith("gemini-3.6-flash-")
  ) {
    return getAntigravityRequestModelId("gemini-3.8-flash", effort);
  }
  return undefined;
}

export type GeminiThinkingLevel = "MINIMAL" | "LOW" | "MEDIUM" | "HIGH";

export type ThinkingWire = {
  includeThoughts: boolean;
  thinkingLevel?: GeminiThinkingLevel;
  thinkingBudget?: number;
};

export const ANTIGRAVITY_MODEL_ENUM: Record<string, string> = {
  "gemini-4-argon-high": "MODEL_PLACEHOLDER_M417",
  "gemini-4-argon-medium": "MODEL_PLACEHOLDER_M418",
  "gemini-4-argon-low": "MODEL_PLACEHOLDER_M419",
  "gemini-3.8-flash-high": "MODEL_PLACEHOLDER_M318",
  "gemini-3.8-flash-medium": "MODEL_PLACEHOLDER_M319",
  "gemini-3.8-flash-low": "MODEL_PLACEHOLDER_M320",
  "gemini-3.8-flash-tiered": "MODEL_PLACEHOLDER_M322",
  "claude-opus-5-5-low": "MODEL_PLACEHOLDER_M400",
  "claude-opus-5-5-medium": "MODEL_PLACEHOLDER_M401",
  "claude-opus-5-5-high": "MODEL_PLACEHOLDER_M402",
  "claude-sonnet-5-5-low": "MODEL_PLACEHOLDER_M403",
  "claude-sonnet-5-5-medium": "MODEL_PLACEHOLDER_M404",
  "claude-sonnet-5-5-high": "MODEL_PLACEHOLDER_M405",
  "gpt-oss-120b-medium": "MODEL_OPENAI_GPT_OSS_120B_MEDIUM",
  // Legacy mappings retained for reference
  "claude-sonnet-4-6": "MODEL_PLACEHOLDER_M35",
  "claude-opus-4-6-thinking": "MODEL_PLACEHOLDER_M26",
  "gemini-3.5-flash-extra-low": "MODEL_PLACEHOLDER_M187",
  "gemini-3.5-flash-low": "MODEL_PLACEHOLDER_M20",
  "gemini-3-flash-agent": "MODEL_PLACEHOLDER_M84",
  "gemini-3.1-pro-low": "MODEL_PLACEHOLDER_M36",
  "gemini-pro-agent": "MODEL_PLACEHOLDER_M16",
};

function googleLevel(effort: string | undefined): GeminiThinkingLevel {
  if (effort === "high" || effort === "xhigh") return "HIGH";
  if (effort === "medium") return "MEDIUM";
  return "LOW";
}

export function getThinkingConfig(
  modelId: string,
  effort: string | undefined,
): ThinkingWire | undefined {
  if (
    modelId === "gemini-4-argon" ||
    modelId === "gemini-3.8-flash" ||
    modelId === "gemini-3.7-flash" ||
    modelId === "gemini-3.6-flash"
  ) {
    return { includeThoughts: true, thinkingLevel: googleLevel(effort) };
  }
  if (modelId === "gemini-3.5-flash") {
    if (!effort || effort === "off") return { includeThoughts: false, thinkingBudget: 0 };
    const thinkingBudget =
      effort === "high" || effort === "xhigh" ? 10_000 : effort === "medium" ? 4_000 : 1_000;
    return { includeThoughts: true, thinkingBudget };
  }
  if (modelId === "gemini-3.1-pro") {
    if (!effort || effort === "off") return { includeThoughts: false, thinkingBudget: 0 };
    return {
      includeThoughts: true,
      thinkingBudget: effort === "high" || effort === "xhigh" ? 10_001 : 1_001,
    };
  }
  return undefined;
}
