import fs from 'fs-extra';
import path from 'path';
import yaml from 'js-yaml';
import { glob } from 'glob';
import { 
  Template, 
  TemplateSchema, 
  TemplateSummary, 
  TemplateQuery,
  TemplateListResponse
} from './types.js';
import { logInfo, logError } from '../../utils/logFormatter.js';

/**
 * Template Store
 * 
 * Manages the storage and retrieval of prompt templates from the file system.
 */
export class TemplateStore {
  private templatesDir: string;
  private templates: Map<string, Template> = new Map();
  private templateTags: Set<string> = new Set();
  private serviceNamespace = 'swift-prompter-mcp-service';
  private serviceVersion = '1.0.0';
  private initialized = false;

  /**
   * Create a new template store
   * 
   * @param templatesDir - Directory containing template YAML files
   */
  constructor(templatesDir: string) {
    this.templatesDir = templatesDir;
  }

  /**
   * Initialize the template store
   * 
   * Loads all templates from the templates directory
   */
  public async initialize(): Promise<void> {
    try {
      logInfo('Initializing template store', this.serviceNamespace, this.serviceVersion, {
        context: { templatesDir: this.templatesDir }
      });

      // Ensure templates directory exists
      await fs.ensureDir(this.templatesDir);

      // Find all YAML files in the templates directory
      const templateFiles = await glob('**/*.y?(a)ml', { cwd: this.templatesDir });

      logInfo(`Found ${templateFiles.length} template files`, this.serviceNamespace, this.serviceVersion);

      // Load each template file
      for (const file of templateFiles) {
        try {
          await this.loadTemplateFile(file);
        } catch (error) {
          const err = error instanceof Error ? error : new Error(String(error));
          logError(`Error loading template file: ${file}`, this.serviceNamespace, this.serviceVersion, err);
        }
      }

      this.initialized = true;
      
      logInfo(
        `Template store initialized with ${this.templates.size} templates and ${this.templateTags.size} tags`,
        this.serviceNamespace,
        this.serviceVersion,
        {
          context: {
            templateCount: this.templates.size,
            tagCount: this.templateTags.size,
            tags: Array.from(this.templateTags)
          }
        }
      );
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logError('Error initializing template store', this.serviceNamespace, this.serviceVersion, err);
      throw err;
    }
  }

  /**
   * Ensure the template store is initialized
   * If not already initialized, initialize it
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  /**
   * Load a template file
   * 
   * @param filePath - Path to the template file relative to the templates directory
   */
  private async loadTemplateFile(filePath: string): Promise<void> {
    const fullPath = path.join(this.templatesDir, filePath);
    const content = await fs.readFile(fullPath, 'utf-8');
    
    try {
      // Parse YAML content
      const data = yaml.load(content) as Record<string, unknown>;
      
      // Validate template schema
      const template = TemplateSchema.parse(data);
      
      // Store template
      this.templates.set(template.template_id, template);
      
      // Record tags
      template.tags.forEach(tag => this.templateTags.add(tag));
      
      logInfo(`Loaded template: ${template.template_id}`, this.serviceNamespace, this.serviceVersion, {
        context: {
          templateId: template.template_id,
          name: template.name,
          tags: template.tags
        }
      });
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logError(`Error parsing template file: ${filePath}`, this.serviceNamespace, this.serviceVersion, err);
      throw err;
    }
  }

  /**
   * Get all templates
   * 
   * @returns Array of template summaries
   */
  public getAllTemplates(): TemplateSummary[] {
    return Array.from(this.templates.values()).map(template => {
      // Create a template summary without the pattern field
      const { pattern, ...summary } = template;
      return summary;
    });
  }

  /**
   * Get a template by ID
   * 
   * @param templateId - Template ID
   * @returns Template or null if not found
   */
  public async getTemplate(templateId: string): Promise<Template | null> {
    await this.ensureInitialized();
    return this.templates.get(templateId) || null;
  }

  /**
   * Query templates
   * 
   * @param query - Query parameters
   * @returns Template list response
   */
  public async queryTemplates(query: TemplateQuery): Promise<TemplateListResponse> {
    await this.ensureInitialized();
    
    // Log query parameters for debugging
    logInfo(`Querying templates with params: ${JSON.stringify(query)}`, this.serviceNamespace, this.serviceVersion);
    
    let filteredTemplates = Array.from(this.templates.values());
    
    // Filter by tag if provided
    if (query.tag) {
      const tagLower = query.tag.toLowerCase();
      filteredTemplates = filteredTemplates.filter(template => 
        template.tags.some(tag => tag.toLowerCase() === tagLower)
      );
    }
    
    // Filter by search term if provided
    if (query.search) {
      const searchTerm = query.search.toLowerCase();
      filteredTemplates = filteredTemplates.filter(template =>
        template.name.toLowerCase().includes(searchTerm) ||
        template.description.toLowerCase().includes(searchTerm) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
        template.template_id.toLowerCase().includes(searchTerm)
      );
    }
    
    // Log filtering results for debugging
    logInfo(`Filtered to ${filteredTemplates.length} templates`, this.serviceNamespace, this.serviceVersion);
    
    // Create summaries without patterns
    const summaries = filteredTemplates.map(template => {
      const { pattern, ...summary } = template;
      return summary;
    });
    
    return {
      templates: summaries,
      count: summaries.length,
      tags: Array.from(this.templateTags).sort()
    };
  }
}
