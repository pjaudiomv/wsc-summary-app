interface Env {
  GITHUB_TOKEN: string;
  GITHUB_REPO: string; // e.g. "pjaudiomv/na-wsc"
}

interface MotionRef {
  year: number;
  motion_number: string | null;
  motion_text: string;
}

interface CorrectionPayload {
  issue_type: string;
  description: string;
  correction?: string | null;
  source?: string | null;
  contact?: string | null;
  motion?: MotionRef | null;
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400'
};

const ISSUE_TYPE_LABELS: Record<string, string> = {
  incorrect_text: 'Incorrect motion text',
  wrong_result: 'Wrong result',
  wrong_votes: 'Wrong vote count',
  wrong_maker: 'Wrong maker or second',
  wrong_year: 'Wrong year',
  missing_data: 'Missing data',
  other: 'Other'
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
  });
}

function buildTitle(payload: CorrectionPayload): string {
  const label = ISSUE_TYPE_LABELS[payload.issue_type] ?? payload.issue_type;
  if (payload.motion) {
    return `[Correction] ${payload.motion.year} Motion ${payload.motion.motion_number ?? 'N/A'} – ${label}`;
  }
  return `[Correction] ${label}`;
}

function buildBody(payload: CorrectionPayload): string {
  const lines: string[] = ['## Correction Report', ''];

  lines.push(`**Type:** ${ISSUE_TYPE_LABELS[payload.issue_type] ?? payload.issue_type}`, '');

  if (payload.motion) {
    lines.push(`**Motion:** ${payload.motion.year} WSC, Motion ${payload.motion.motion_number ?? 'N/A'}`, '');
    lines.push('**Current text (excerpt):**');
    lines.push(`> ${payload.motion.motion_text}`, '');
  }

  lines.push('### What is incorrect', payload.description, '');

  if (payload.correction?.trim()) {
    lines.push('### Suggested correction', payload.correction, '');
  }

  if (payload.source?.trim()) {
    lines.push('### Source / Reference', payload.source, '');
  }

  lines.push('---');
  lines.push('*Submitted via WSC Decisions Archive correction form*');

  if (payload.contact?.trim()) {
    lines.push(`*Contact for follow-up: ${payload.contact}*`);
  }

  return lines.join('\n');
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    if (request.method !== 'POST') {
      return json({ error: 'Method not allowed' }, 405);
    }

    if (!env.GITHUB_TOKEN || !env.GITHUB_REPO) {
      return json({ error: 'Worker not configured — set GITHUB_TOKEN and GITHUB_REPO' }, 500);
    }

    let payload: CorrectionPayload;
    try {
      payload = (await request.json()) as CorrectionPayload;
    } catch {
      return json({ error: 'Invalid JSON body' }, 400);
    }

    if (!payload.description?.trim()) {
      return json({ error: 'description is required' }, 400);
    }

    const ghRes = await fetch(`https://api.github.com/repos/${env.GITHUB_REPO}/issues`, {
      method: 'POST',
      headers: {
        Authorization: `token ${env.GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
        'User-Agent': 'wsc-corrections-worker/1.0'
      },
      body: JSON.stringify({
        title: buildTitle(payload),
        body: buildBody(payload),
        labels: ['correction']
      })
    });

    if (!ghRes.ok) {
      const text = await ghRes.text();
      console.error('GitHub API error', ghRes.status, text);
      return json({ error: 'Failed to create GitHub issue' }, 502);
    }

    const issue = (await ghRes.json()) as { html_url: string; number: number };
    return json({ ok: true, issue_url: issue.html_url, issue_number: issue.number });
  }
};
