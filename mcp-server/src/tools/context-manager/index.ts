import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ContextTracker } from './context-tracker.js';
import { ContextStatusTool } from './context-status-tool.js';
import { logInfo } from '../../utils/logFormatter.js';

export * from './context-tracker.js';

export function registerContextManagerTools(
  server: McpServer,
  contextTracker: ContextTracker,
  registeredTools: string[] = []
): void {
  const SERVICE_NAME = 'swift-prompter-mcp-service';
  const SERVICE_VERSION = '1.0.0';

  logInfo('Registering context manager tools', SERVICE_NAME, SERVICE_VERSION);

  // Create and register the context status tool
  const contextStatusTool = new ContextStatusTool(contextTracker);
  contextStatusTool.register(server);
  registeredTools.push('context-status');

  logInfo('Context manager tools registered successfully', SERVICE_NAME, SERVICE_VERSION);
}
