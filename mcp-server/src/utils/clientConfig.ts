import { logInfo, logWarn } from './logFormatter.js';

// Define the service information
const SERVICE_NAME = 'swift-prompter-mcp-service';
const SERVICE_VERSION = '1.0.0';

// Define the required tools for client exposure
export const REQUIRED_CLIENT_TOOLS = [
  'list-templates',
  'get-template',
  'build-prompt',
  'context-status'
];

/**
 * Validate tool registration for client exposure
 * 
 * @param registeredTools - Array of registered tool IDs
 * @returns Validation results
 */
export function validateClientToolExposure(registeredTools: string[]): {
  allToolsExposed: boolean;
  missingTools: string[];
} {
  // Check if all required tools are registered
  const missingTools = REQUIRED_CLIENT_TOOLS.filter(
    (toolId) => !registeredTools.includes(toolId)
  );
  
  const allToolsExposed = missingTools.length === 0;
  
  return {
    allToolsExposed,
    missingTools
  };
}

/**
 * Log validation results
 * 
 * @param results - Validation results
 */
export function logClientToolValidation(results: {
  allToolsExposed: boolean;
  missingTools: string[];
}): void {
  if (results.allToolsExposed) {
    logInfo(
      'All required tools are properly registered for client exposure',
      SERVICE_NAME,
      SERVICE_VERSION,
      {
        context: {
          requiredTools: REQUIRED_CLIENT_TOOLS
        }
      }
    );
  } else {
    logWarn(
      'Some required tools are missing for client exposure',
      SERVICE_NAME,
      SERVICE_VERSION,
      undefined,
      {
        context: {
          missingTools: results.missingTools,
          requiredTools: REQUIRED_CLIENT_TOOLS
        }
      }
    );
  }
}
