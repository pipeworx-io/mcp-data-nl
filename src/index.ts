interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * Netherlands Open Data (data.overheid.nl/data) CKAN MCP.
 *
 * Netherlands Open Data — Dutch national & local government open data via the CKAN Action API. Keyless. search_datasets
 * finds datasets (each lists resources with resource_id) -> dataset shows full
 * metadata -> query_resource pulls rows from a tabular (DataStore) resource.
 */


const BASE = 'https://data.overheid.nl/data';
const UA = 'pipeworx-mcp-data-nl/1.0 (+https://pipeworx.io)';

const tools: McpToolExport['tools'] = [
  {
    name: 'search_datasets',
    description: 'Search Netherlands Open Data (Netherlands) for datasets by keyword. Returns each dataset\'s id/name, title, organization, and its resources (each with a resource_id for query_resource).',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Keyword(s); blank/"*" lists all.' },
        limit: { type: 'number', description: 'Max datasets (1-100, default 20).' },
        offset: { type: 'number', description: 'Pagination offset.' },
      },
    },
  },
  {
    name: 'dataset',
    description: 'Show full metadata for one Netherlands Open Data dataset by id or name (from search_datasets), including all resources and their resource_ids.',
    inputSchema: {
      type: 'object',
      properties: { id: { type: 'string', description: 'Dataset id or name (from search_datasets).' } },
      required: ['id'],
    },
  },
  {
    name: 'query_resource',
    description: 'Pull rows from a tabular Netherlands Open Data resource (CKAN DataStore) by resource_id (from a dataset\'s resources). Optional full-text q, limit, offset. Note: only resources with the DataStore enabled are queryable.',
    inputSchema: {
      type: 'object',
      properties: {
        resource_id: { type: 'string', description: 'A resource_id from dataset/search_datasets.' },
        q: { type: 'string', description: 'Optional full-text filter over the rows.' },
        limit: { type: 'number', description: 'Max rows (default 100).' },
        offset: { type: 'number', description: 'Pagination offset.' },
      },
      required: ['resource_id'],
    },
  },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case 'search_datasets': {
      const p = new URLSearchParams({ q: (typeof args.query === 'string' && args.query.trim()) ? String(args.query) : '*:*', rows: String(clamp(numArg(args.limit, 20), 1, 100)), start: String(Math.max(0, numArg(args.offset, 0))) });
      return ckan(`/api/3/action/package_search?${p}`);
    }
    case 'dataset':
      return ckan(`/api/3/action/package_show?id=${encodeURIComponent(reqStr(args, 'id', '"some-dataset"'))}`);
    case 'query_resource': {
      const p = new URLSearchParams({ resource_id: reqStr(args, 'resource_id', '"abc-123"'), limit: String(clamp(numArg(args.limit, 100), 1, 1000)), offset: String(Math.max(0, numArg(args.offset, 0))) });
      if (typeof args.q === 'string' && args.q.trim()) p.set('q', String(args.q));
      return ckan(`/api/3/action/datastore_search?${p}`);
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

async function ckan(path: string): Promise<unknown> {
  const res = await fetch(`${BASE}${path}`, { headers: { Accept: 'application/json', 'User-Agent': UA } });
  if (!res.ok) throw new Error(`Netherlands Open Data: ${res.status} ${await res.text().then((t) => t.slice(0, 160))}`);
  return res.json();
}

function reqStr(args: Record<string, unknown>, key: string, example: string): string {
  const v = args[key];
  if (typeof v !== 'string' || !v.trim()) throw new Error(`Required argument "${key}" is missing. Pass a string like ${example}.`);
  return v;
}
function numArg(v: unknown, dflt: number): number { const n = typeof v === 'number' ? v : typeof v === 'string' ? Number(v) : NaN; return Number.isFinite(n) ? n : dflt; }
function clamp(n: number, lo: number, hi: number): number { return Math.max(lo, Math.min(hi, Math.trunc(n))); }

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
