import path from 'path';
import { fileURLToPath } from 'url';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerAllTools, TemplateStore } from './tools/index.js';
import { registerAllPrompts } from './prompts/index.js';
import { LogLevel, logInfo, logError, logDebug } from './utils/logFormatter.js';
import { validateClientToolExposure, logClientToolValidation, REQUIRED_CLIENT_TOOLS } from './utils/clientConfig.js';
import { CustomStdioServerTransport } from './utils/customStdioTransport.js';

/**
 * Redirect console output to stderr to avoid contaminating the transport stream
 */
function setupConsoleRedirection() {
  // Store original console methods
  const originalConsole = {
    log: console.log,
    info: console.info,
    warn: console.warn,
    error: console.error,
    debug: console.debug
  };

  // Override console methods to use stderr
  console.log = (...args) => process.stderr.write(`${args.join(' ')}\n`);
  console.info = (...args) => process.stderr.write(`[INFO] ${args.join(' ')}\n`);
  console.warn = (...args) => process.stderr.write(`[WARN] ${args.join(' ')}\n`);
  console.error = (...args) => process.stderr.write(`[ERROR] ${args.join(' ')}\n`);
  console.debug = (...args) => process.stderr.write(`[DEBUG] ${args.join(' ')}\n`);
  
  logDebug('Console output redirected to stderr', 'swift-prompter-mcp-service', '1.0.0');
}

/**
 * Main entry point for the MCP service
 * 
 * This initializes the MCP server and registers all available tools.
 */
async function main() {
  const SERVICE_NAME = 'swift-prompter-mcp-service';
  const SERVICE_VERSION = '1.0.0';
  
  // Ensure all console output goes to stderr, not stdout
  setupConsoleRedirection();
  
  try {
    logInfo('Starting Swift Prompter MCP service...', SERVICE_NAME, SERVICE_VERSION);

    // Determine the templates directory path
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const templatesDir = path.resolve(__dirname, '../templates');
    
    logInfo(`Templates directory: ${templatesDir}`, SERVICE_NAME, SERVICE_VERSION);

    // Initialize the template store
    const templateStore = new TemplateStore(templatesDir);
    await templateStore.initialize();

    // Create a new MCP server instance
    const server = new McpServer({
      name: SERVICE_NAME,
      version: SERVICE_VERSION,
      description: 'Swift Prompter MCP Server for Prompt Engineering'
    });

    // Track registered tools manually since McpServer doesn't expose getTools()
    const registeredTools: string[] = [];
    
    // Register all tools and track them manually
    await registerAllTools(server, templateStore, registeredTools);
    
    // Register all prompts
    const registeredPrompts: string[] = [];
    registerAllPrompts(server, registeredPrompts);
    
    // Verify tool registration for client exposure
    const validationResults = validateClientToolExposure(registeredTools);
    logClientToolValidation(validationResults);
    
    // If any required tools are missing, log an error but continue startup
    if (!validationResults.allToolsExposed) {
      logError(
        'One or more required tools are not properly registered for client exposure',
        SERVICE_NAME,
        SERVICE_VERSION,
        new Error('Tool registration validation failed'),
        {
          context: {
            missingTools: validationResults.missingTools,
            registeredTools
          }
        }
      );
    }
    
    // Create a custom transport mechanism that properly filters messages
    const transport = new CustomStdioServerTransport();
    
    // Set up error handling for the transport
    process.on('uncaughtException', (error) => {
      logError('Uncaught Exception', SERVICE_NAME, SERVICE_VERSION, error, {
        context: { type: 'uncaughtException' }
      });
    });
    
    process.on('unhandledRejection', (reason, promise) => {
      const error = reason instanceof Error ? reason : new Error(String(reason));
      logError('Unhandled Promise Rejection', SERVICE_NAME, SERVICE_VERSION, error, {
        context: { type: 'unhandledRejection' }
      });
    });
    
    // Connect the server with the transport
    await server.connect(transport);
    
    logInfo('MCP service started successfully', SERVICE_NAME, SERVICE_VERSION);
    logInfo(`Available tools: ${registeredTools.join(', ')}`, SERVICE_NAME, SERVICE_VERSION);
    logInfo(`Available prompts: ${registeredPrompts.join(', ')}`, SERVICE_NAME, SERVICE_VERSION);
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logError('Failed to start MCP service', SERVICE_NAME, SERVICE_VERSION, err);
    process.exit(1);
  }
}

// Start the application
main();
