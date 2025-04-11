import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerSwiftPrompt } from './swift-prompt.js';
import { logInfo, logError } from '../utils/logFormatter.js';

/**
 * Register all prompt templates with the MCP server
 * 
 * This function is the central place to register all prompts
 * with the MCP server.
 * 
 * @param server - The MCP server instance
 * @param registeredPrompts - Optional array to track registered prompt names
 */
export function registerAllPrompts(
  server: McpServer,
  registeredPrompts: string[] = []
): void {
  const SERVICE_NAME = 'swift-prompter-mcp-service';
  const SERVICE_VERSION = '1.0.0';

  try {
    // Register individual prompts
    registerSwiftPrompt(server);
    registeredPrompts.push('swift-prompt');
    
    logInfo('All prompts registered successfully', SERVICE_NAME, SERVICE_VERSION, {
      context: {
        registeredPrompts
      }
    });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logError('Error registering prompts', SERVICE_NAME, SERVICE_VERSION, err);
    throw err;
  }
}

export { registerSwiftPrompt } from './swift-prompt.js';
