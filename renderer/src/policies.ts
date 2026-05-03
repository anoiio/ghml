import yaml from 'js-yaml';
import noneYaml from '../../policy/examples/none.policy.yaml?raw';
import defaultYaml from '../../policy/examples/default.policy.yaml?raw';
import strictYaml from '../../policy/examples/strict.policy.yaml?raw';

export interface Policy {
  id: string;
  description?: string;
  model_allowlist: string[];
  cost_caps: {
    max_tokens_per_request: number;
    max_requests_per_session: number;
    max_total_tokens_per_session: number;
  };
}

function parsePolicy(raw: string): Policy {
  const doc = yaml.load(raw) as Record<string, unknown>;
  const caps = (doc.cost_caps ?? {}) as Record<string, unknown>;
  return {
    id: String(doc.id ?? 'unknown'),
    description: doc.description ? String(doc.description) : undefined,
    model_allowlist: Array.isArray(doc.model_allowlist)
      ? doc.model_allowlist.map(String)
      : [],
    cost_caps: {
      max_tokens_per_request: Number(caps.max_tokens_per_request ?? 4096),
      max_requests_per_session: Number(caps.max_requests_per_session ?? Infinity),
      max_total_tokens_per_session: Number(caps.max_total_tokens_per_session ?? Infinity),
    },
  };
}

export const POLICIES: Record<string, Policy> = {
  none: parsePolicy(noneYaml),
  default: parsePolicy(defaultYaml),
  strict: parsePolicy(strictYaml),
};

export const POLICY_IDS = ['none', 'default', 'strict'] as const;
export type PolicyId = typeof POLICY_IDS[number];
