import { z } from 'zod';
import { BaseTool } from '../base-tool.js';
import { TemplateStore } from './store.js';
import { TemplateQuery, TemplateListResponse, Template, TemplateGet } from './types.js';
import { logError, logInfo } from '../../utils/logFormatter.js';

/**
 * List Templates Tool
 * 
 * MCP tool for listing available templates with filtering.
 */
export class ListTemplatesPool extends BaseTool<TemplateQuery, TemplateListResponse> {
  private templateStore: TemplateStore;

  /**
   * Create a new list templates tool
   * 
   * @param templateStore - Template store instance
   */
  constructor(templateStore: TemplateStore) {
    super(
      'list-templates',
      '1.0.0',
      'Lists available prompt templates with optional filtering'
    );
    
    this.templateStore = templateStore;
  }

  /**
   * Get the Zod schema for this tool
   */
  protected getSchema(): Record<string, z.ZodType<any>> {
    return {
      tag: z.string().optional().describe('Filter templates by tag'),
      search: z.string().optional().describe('Search in template names and descriptions')
    };
  }

  /**
   * Execute the tool
   * 
   * @param input - Query parameters
   * @returns List of matching templates
   */
  protected async execute(input: TemplateQuery): Promise<TemplateListResponse> {
    try {
      logInfo(`Executing list-templates with input: ${JSON.stringify(input)}`, this.serviceNamespace, this.serviceVersion);
      return await this.templateStore.queryTemplates(input);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logError('Error listing templates', this.serviceNamespace, this.serviceVersion, err);
      throw err;
    }
  }

  /**
   * Format the response for better readability
   */
  protected formatResponse(result: TemplateListResponse): any {
    const templates = result.templates.map(template => ({
      id: template.template_id,
      name: template.name,
      description: template.description,
      tags: template.tags.join(', '),
      execution_mode: template.execution.mode
    }));
    
    return {
      content: [
        {
          type: "text",
          text: `Found ${result.count} templates:\n\n${
            templates.map(t => `- ${t.name} (${t.id}): ${t.description}`).join('\n')
          }\n\nAvailable tags: ${result.tags.join(', ')}`
        }
      ],
      results: result
    };
  }
}

/**
 * Get Template Tool
 * 
 * MCP tool for retrieving a specific template by ID.
 */
export class GetTemplateTool extends BaseTool<TemplateGet, Template | null> {
  private templateStore: TemplateStore;

  /**
   * Create a new get template tool
   * 
   * @param templateStore - Template store instance
   */
  constructor(templateStore: TemplateStore) {
    super(
      'get-template',
      '1.0.0',
      'Gets a specific prompt template by ID'
    );
    
    this.templateStore = templateStore;
  }

  /**
   * Get the Zod schema for this tool
   */
  protected getSchema(): Record<string, z.ZodType<any>> {
    return {
      template_id: z.string().describe('ID of the template to retrieve')
    };
  }

  /**
   * Execute the tool
   * 
   * @param input - Template ID
   * @returns Template or null if not found
   */
  protected async execute(input: TemplateGet): Promise<Template | null> {
    try {
      logInfo(`Executing get-template with template_id: ${input.template_id}`, this.serviceNamespace, this.serviceVersion);
      return await this.templateStore.getTemplate(input.template_id);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logError('Error retrieving template', this.serviceNamespace, this.serviceVersion, err);
      throw err;
    }
  }

  /**
   * Format the response for better readability
   */
  protected formatResponse(result: Template | null): any {
    if (!result) {
      return {
        content: [
          {
            type: "text",
            text: "Template not found"
          }
        ],
        results: null
      };
    }
    
    const inputsList = result.inputs.map(input => {
      const details = [
        `Type: ${input.type}`,
        `Required: ${input.required ? 'Yes' : 'No'}`
      ];
      
      if (input.default !== undefined) {
        details.push(`Default: ${input.default}`);
      }
      
      if (input.options) {
        details.push(`Options: ${input.options.join(', ')}`);
      }
      
      return `- ${input.name}: ${details.join(' | ')}`;
    }).join('\n');
    
    return {
      content: [
        {
          type: "text",
          text: `# ${result.name}\n\n${result.description}\n\nTags: ${result.tags.join(', ')}\n\n## Inputs\n${inputsList}\n\n## Pattern\n\`\`\`\n${result.pattern}\n\`\`\``
        }
      ],
      results: result
    };
  }
}
