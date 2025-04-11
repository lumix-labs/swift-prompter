import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { TemplateStore } from './store.js';
import { ListTemplatesPool, GetTemplateTool } from './template-store-tool.js';
import { logInfo } from '../../utils/logFormatter.js';

export * from './types.js';
export * from './store.js';

export async function registerTemplateStoreTools(
  server: McpServer,
  templateStore: TemplateStore,
  registeredTools: string[] = []
): Promise<void> {
  const SERVICE_NAME = 'swift-prompter-mcp-service';
  const SERVICE_VERSION = '1.0.0';

  logInfo('Registering template store tools', SERVICE_NAME, SERVICE_VERSION);

  // Ensure the template store is initialized before registering tools
  await templateStore.initialize();

  // Create and register the list templates tool
  const listTemplatesPool = new ListTemplatesPool(templateStore);
  listTemplatesPool.register(server);
  registeredTools.push('list-templates');

  // Create and register the get template tool
  const getTemplateTool = new GetTemplateTool(templateStore);
  getTemplateTool.register(server);
  registeredTools.push('get-template');

  logInfo('Template store tools registered successfully', SERVICE_NAME, SERVICE_VERSION);
}
