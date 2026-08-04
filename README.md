# mcp-data-nl

Netherlands Open Data (data.overheid.nl/data) CKAN MCP.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `search_datasets` | Search Netherlands Open Data (Netherlands) for datasets by keyword. Returns each dataset's id/name, title, organization, and its resources (each with a resource_id for query_resource). |
| `dataset` | Show full metadata for one Netherlands Open Data dataset by id or name (from search_datasets), including all resources and their resource_ids. |
| `query_resource` | Pull rows from a tabular Netherlands Open Data resource (CKAN DataStore) by resource_id (from a dataset's resources). Optional full-text q, limit, offset. Note: only resources with the DataStore enabled are queryable. |

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "data-nl": {
      "url": "https://gateway.pipeworx.io/data-nl/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Data Nl data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
