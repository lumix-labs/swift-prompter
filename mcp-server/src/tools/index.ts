import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { TemplateStore, registerTemplateStoreTools } from './template-store/index.js';
import { ContextTracker, registerContextManagerTools } from './context-manager/index.js';
import { PromptBuilder, registerPromptBuilderTools } from './prompt-builder/index.js';
import { logInfo, logError } from '../utils/logFormatter.js';

/**
 * Register all tools with the MCP server
 * 
 * This function is the central place to register all tools
 * with the MCP server.
 * 
 * @param server - The MCP server instance
 * @param registeredTools - Array to track registered tool names
 */
export async function registerAllTools(
  server: McpServer, 
  templateStore: TemplateStore,
  registeredTools: string[] = []
): Promise<void> {
  const SERVICE_NAME = 'swift-prompter-mcp-service';
  const SERVICE_VERSION = '1.0.0';

  try {
    // Create shared instances
    const contextTracker = new ContextTracker();
    const promptBuilder = new PromptBuilder(contextTracker);
    
    logInfo('Created shared service instances', SERVICE_NAME, SERVICE_VERSION);

    // Register template store tools
    await registerTemplateStoreTools(server, templateStore, registeredTools);
    
    // Register context manager tools
    registerContextManagerTools(server, contextTracker, registeredTools);
    
    // Register prompt builder tools
    registerPromptBuilderTools(server, promptBuilder, templateStore, registeredTools);
    
    logInfo('All tools registered successfully', SERVICE_NAME, SERVICE_VERSION, {
      context: {
        registeredTools
      }
    });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logError('Error registering tools', SERVICE_NAME, SERVICE_VERSION, err);
    throw err;
  }
}

export { TemplateStore } from './template-store/index.js';
export { ContextTracker } from './context-manager/index.js';
export { PromptBuilder } from './prompt-builder/index.js';
