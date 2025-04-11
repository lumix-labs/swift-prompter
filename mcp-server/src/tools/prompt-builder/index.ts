import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { PromptBuilder } from './prompt-builder.js';
import { PromptBuilderTool } from './prompt-builder-tool.js';
import { TemplateStore } from '../template-store/store.js';
import { ContextTracker } from '../context-manager/context-tracker.js';
import { logInfo } from '../../utils/logFormatter.js';

export * from './prompt-builder.js';

export function registerPromptBuilderTools(
  server: McpServer,
  promptBuilder: PromptBuilder,
  templateStore: TemplateStore,
  registeredTools: string[] = []
): void {
  const SERVICE_NAME = 'swift-prompter-mcp-service';
  const SERVICE_VERSION = '1.0.0';

  logInfo('Registering prompt builder tools', SERVICE_NAME, SERVICE_VERSION);

  // Create and register the prompt builder tool
  const promptBuilderTool = new PromptBuilderTool(promptBuilder, templateStore);
  promptBuilderTool.register(server);
  registeredTools.push('build-prompt');

  logInfo('Prompt builder tools registered successfully', SERVICE_NAME, SERVICE_VERSION);
}
