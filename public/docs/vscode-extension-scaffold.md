# VS Code SDLC Assistant Extension - Scaffold Guide

This document provides the complete TypeScript scaffold for building a VS Code extension version of the SDLC Assistant.

## Project Structure

```
vscode-sdlc-assistant/
├── .vscode/
│   ├── launch.json
│   └── tasks.json
├── src/
│   ├── extension.ts              # Extension entry point
│   ├── commands/
│   │   ├── index.ts
│   │   ├── newProject.ts
│   │   ├── generateSRS.ts
│   │   ├── generateDesign.ts
│   │   ├── generateTests.ts
│   │   └── generateDocs.ts
│   ├── panels/
│   │   ├── DashboardPanel.ts
│   │   ├── RequirementsPanel.ts
│   │   └── DesignPanel.ts
│   ├── services/
│   │   ├── aiService.ts
│   │   ├── projectService.ts
│   │   └── storageService.ts
│   ├── providers/
│   │   ├── SDLCTreeProvider.ts
│   │   └── RequirementsProvider.ts
│   ├── types/
│   │   └── index.ts
│   └── utils/
│       └── helpers.ts
├── webview/
│   ├── src/
│   │   ├── App.tsx
│   │   └── components/
│   └── index.html
├── package.json
├── tsconfig.json
└── README.md
```

## package.json

```json
{
  "name": "sdlc-assistant",
  "displayName": "SDLC Assistant",
  "description": "AI-powered Software Development Lifecycle assistant",
  "version": "0.1.0",
  "engines": {
    "vscode": "^1.85.0"
  },
  "categories": ["Other"],
  "activationEvents": [
    "onCommand:sdlc.newProject",
    "onView:sdlcExplorer"
  ],
  "main": "./dist/extension.js",
  "contributes": {
    "commands": [
      {
        "command": "sdlc.newProject",
        "title": "SDLC: New Project",
        "icon": "$(add)"
      },
      {
        "command": "sdlc.generateSRS",
        "title": "SDLC: Generate Requirements (SRS)"
      },
      {
        "command": "sdlc.generateDesign",
        "title": "SDLC: Generate Design Artifacts"
      },
      {
        "command": "sdlc.generateTests",
        "title": "SDLC: Generate Test Cases"
      },
      {
        "command": "sdlc.openDashboard",
        "title": "SDLC: Open Dashboard"
      }
    ],
    "viewsContainers": {
      "activitybar": [
        {
          "id": "sdlc-explorer",
          "title": "SDLC Assistant",
          "icon": "$(rocket)"
        }
      ]
    },
    "views": {
      "sdlc-explorer": [
        {
          "id": "sdlcPhases",
          "name": "SDLC Phases"
        },
        {
          "id": "sdlcArtifacts",
          "name": "Artifacts"
        }
      ]
    },
    "configuration": {
      "title": "SDLC Assistant",
      "properties": {
        "sdlc.aiProvider": {
          "type": "string",
          "default": "openai",
          "enum": ["openai", "anthropic", "local"],
          "description": "AI provider for generating content"
        },
        "sdlc.aiApiKey": {
          "type": "string",
          "default": "",
          "description": "API key for the AI provider"
        }
      }
    }
  },
  "scripts": {
    "vscode:prepublish": "npm run compile",
    "compile": "tsc -p ./",
    "watch": "tsc -watch -p ./",
    "lint": "eslint src --ext ts"
  },
  "devDependencies": {
    "@types/vscode": "^1.85.0",
    "@types/node": "^20.x",
    "@typescript-eslint/eslint-plugin": "^6.x",
    "@typescript-eslint/parser": "^6.x",
    "eslint": "^8.x",
    "typescript": "^5.x"
  },
  "dependencies": {
    "openai": "^4.x"
  }
}
```

## src/extension.ts

```typescript
import * as vscode from 'vscode';
import { registerCommands } from './commands';
import { SDLCTreeProvider } from './providers/SDLCTreeProvider';
import { DashboardPanel } from './panels/DashboardPanel';

export function activate(context: vscode.ExtensionContext) {
  console.log('SDLC Assistant is now active!');

  // Register tree view provider
  const sdlcTreeProvider = new SDLCTreeProvider(context);
  vscode.window.registerTreeDataProvider('sdlcPhases', sdlcTreeProvider);

  // Register all commands
  registerCommands(context, sdlcTreeProvider);

  // Register webview panel serializer for dashboard
  vscode.window.registerWebviewPanelSerializer(DashboardPanel.viewType, {
    async deserializeWebviewPanel(webviewPanel: vscode.WebviewPanel) {
      DashboardPanel.revive(webviewPanel, context.extensionUri);
    }
  });
}

export function deactivate() {}
```

## src/commands/index.ts

```typescript
import * as vscode from 'vscode';
import { SDLCTreeProvider } from '../providers/SDLCTreeProvider';
import { newProject } from './newProject';
import { generateSRS } from './generateSRS';
import { generateDesign } from './generateDesign';
import { generateTests } from './generateTests';
import { DashboardPanel } from '../panels/DashboardPanel';

export function registerCommands(
  context: vscode.ExtensionContext,
  treeProvider: SDLCTreeProvider
) {
  context.subscriptions.push(
    vscode.commands.registerCommand('sdlc.newProject', () => 
      newProject(context, treeProvider)
    ),
    
    vscode.commands.registerCommand('sdlc.generateSRS', () => 
      generateSRS(context)
    ),
    
    vscode.commands.registerCommand('sdlc.generateDesign', () => 
      generateDesign(context)
    ),
    
    vscode.commands.registerCommand('sdlc.generateTests', () => 
      generateTests(context)
    ),
    
    vscode.commands.registerCommand('sdlc.openDashboard', () => 
      DashboardPanel.createOrShow(context.extensionUri)
    )
  );
}
```

## src/commands/newProject.ts

```typescript
import * as vscode from 'vscode';
import { SDLCTreeProvider } from '../providers/SDLCTreeProvider';
import { ProjectService } from '../services/projectService';

export async function newProject(
  context: vscode.ExtensionContext,
  treeProvider: SDLCTreeProvider
) {
  // Get project name
  const projectName = await vscode.window.showInputBox({
    prompt: 'Enter project name',
    placeHolder: 'My Awesome Project'
  });

  if (!projectName) return;

  // Get project idea/description
  const projectIdea = await vscode.window.showInputBox({
    prompt: 'Describe your project idea',
    placeHolder: 'A mobile app that helps users track their habits...'
  });

  if (!projectIdea) return;

  // Create project
  const projectService = new ProjectService(context);
  const project = await projectService.createProject({
    name: projectName,
    description: projectIdea,
    currentPhase: 'idea'
  });

  // Refresh tree view
  treeProvider.refresh();

  // Show success message
  vscode.window.showInformationMessage(
    `Project "${projectName}" created! Click "Generate SRS" to continue.`
  );

  // Open dashboard
  vscode.commands.executeCommand('sdlc.openDashboard');
}
```

## src/services/aiService.ts

```typescript
import * as vscode from 'vscode';
import OpenAI from 'openai';

export class AIService {
  private client: OpenAI | null = null;

  constructor() {
    this.initializeClient();
  }

  private initializeClient() {
    const config = vscode.workspace.getConfiguration('sdlc');
    const apiKey = config.get<string>('aiApiKey');
    
    if (apiKey) {
      this.client = new OpenAI({ apiKey });
    }
  }

  async generateSRS(projectDescription: string): Promise<string> {
    if (!this.client) {
      throw new Error('AI client not configured. Please set your API key in settings.');
    }

    const response = await this.client.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are an expert software requirements analyst. Generate a comprehensive Software Requirements Specification (SRS) document based on the project description provided. Include:
          1. Project Overview
          2. Functional Requirements
          3. Non-Functional Requirements
          4. Use Cases
          5. Assumptions and Constraints`
        },
        {
          role: 'user',
          content: projectDescription
        }
      ],
      temperature: 0.7
    });

    return response.choices[0]?.message?.content || '';
  }

  async generateUMLDiagram(type: string, requirements: string): Promise<string> {
    if (!this.client) {
      throw new Error('AI client not configured.');
    }

    const response = await this.client.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `Generate a ${type} UML diagram in Mermaid syntax based on the requirements provided.`
        },
        {
          role: 'user',
          content: requirements
        }
      ]
    });

    return response.choices[0]?.message?.content || '';
  }

  async generateTestCases(requirements: string): Promise<string> {
    if (!this.client) {
      throw new Error('AI client not configured.');
    }

    const response = await this.client.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `Generate comprehensive test cases including unit tests, integration tests, and functional tests based on the requirements.`
        },
        {
          role: 'user',
          content: requirements
        }
      ]
    });

    return response.choices[0]?.message?.content || '';
  }
}
```

## src/providers/SDLCTreeProvider.ts

```typescript
import * as vscode from 'vscode';

interface SDLCPhase {
  id: string;
  label: string;
  icon: string;
  progress: number;
}

export class SDLCTreeProvider implements vscode.TreeDataProvider<SDLCPhase> {
  private _onDidChangeTreeData = new vscode.EventEmitter<SDLCPhase | undefined>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private phases: SDLCPhase[] = [
    { id: 'idea', label: 'Project Idea', icon: 'lightbulb', progress: 0 },
    { id: 'requirements', label: 'Requirements', icon: 'file-text', progress: 0 },
    { id: 'design', label: 'Design', icon: 'symbol-structure', progress: 0 },
    { id: 'development', label: 'Development', icon: 'code', progress: 0 },
    { id: 'testing', label: 'Testing', icon: 'beaker', progress: 0 },
    { id: 'documentation', label: 'Documentation', icon: 'book', progress: 0 },
    { id: 'deployment', label: 'Deployment', icon: 'rocket', progress: 0 }
  ];

  constructor(private context: vscode.ExtensionContext) {}

  refresh(): void {
    this._onDidChangeTreeData.fire(undefined);
  }

  getTreeItem(element: SDLCPhase): vscode.TreeItem {
    const item = new vscode.TreeItem(element.label);
    item.iconPath = new vscode.ThemeIcon(element.icon);
    item.description = element.progress > 0 ? `${element.progress}%` : '';
    item.command = {
      command: 'sdlc.openDashboard',
      title: 'Open Phase',
      arguments: [element.id]
    };
    return item;
  }

  getChildren(): SDLCPhase[] {
    return this.phases;
  }

  updateProgress(phaseId: string, progress: number): void {
    const phase = this.phases.find(p => p.id === phaseId);
    if (phase) {
      phase.progress = progress;
      this.refresh();
    }
  }
}
```

## src/panels/DashboardPanel.ts

```typescript
import * as vscode from 'vscode';

export class DashboardPanel {
  public static currentPanel: DashboardPanel | undefined;
  public static readonly viewType = 'sdlcDashboard';

  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionUri: vscode.Uri;
  private _disposables: vscode.Disposable[] = [];

  public static createOrShow(extensionUri: vscode.Uri) {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    if (DashboardPanel.currentPanel) {
      DashboardPanel.currentPanel._panel.reveal(column);
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      DashboardPanel.viewType,
      'SDLC Dashboard',
      column || vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true
      }
    );

    DashboardPanel.currentPanel = new DashboardPanel(panel, extensionUri);
  }

  public static revive(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    DashboardPanel.currentPanel = new DashboardPanel(panel, extensionUri);
  }

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this._panel = panel;
    this._extensionUri = extensionUri;

    this._update();

    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
    
    this._panel.webview.onDidReceiveMessage(
      message => this._handleMessage(message),
      null,
      this._disposables
    );
  }

  private _handleMessage(message: any) {
    switch (message.command) {
      case 'generateSRS':
        vscode.commands.executeCommand('sdlc.generateSRS');
        return;
      case 'generateDesign':
        vscode.commands.executeCommand('sdlc.generateDesign');
        return;
    }
  }

  private _update() {
    this._panel.webview.html = this._getHtmlForWebview();
  }

  private _getHtmlForWebview(): string {
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>SDLC Dashboard</title>
      <style>
        body {
          font-family: var(--vscode-font-family);
          background: var(--vscode-editor-background);
          color: var(--vscode-editor-foreground);
          padding: 20px;
        }
        .phase-card {
          background: var(--vscode-editorWidget-background);
          border: 1px solid var(--vscode-editorWidget-border);
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 12px;
        }
        .phase-title {
          font-weight: 600;
          margin-bottom: 8px;
        }
        button {
          background: var(--vscode-button-background);
          color: var(--vscode-button-foreground);
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
        }
        button:hover {
          background: var(--vscode-button-hoverBackground);
        }
      </style>
    </head>
    <body>
      <h1>SDLC Dashboard</h1>
      
      <div class="phase-card">
        <div class="phase-title">📝 Requirements</div>
        <p>Generate and manage your Software Requirements Specification.</p>
        <button onclick="generateSRS()">Generate SRS</button>
      </div>
      
      <div class="phase-card">
        <div class="phase-title">🎨 Design</div>
        <p>Create UML diagrams and architecture documentation.</p>
        <button onclick="generateDesign()">Generate Design</button>
      </div>
      
      <div class="phase-card">
        <div class="phase-title">🧪 Testing</div>
        <p>Generate test cases and QA documentation.</p>
        <button onclick="generateTests()">Generate Tests</button>
      </div>
      
      <script>
        const vscode = acquireVsCodeApi();
        
        function generateSRS() {
          vscode.postMessage({ command: 'generateSRS' });
        }
        
        function generateDesign() {
          vscode.postMessage({ command: 'generateDesign' });
        }
        
        function generateTests() {
          vscode.postMessage({ command: 'generateTests' });
        }
      </script>
    </body>
    </html>`;
  }

  public dispose() {
    DashboardPanel.currentPanel = undefined;
    this._panel.dispose();
    while (this._disposables.length) {
      const disposable = this._disposables.pop();
      if (disposable) {
        disposable.dispose();
      }
    }
  }
}
```

## Getting Started

1. **Clone the scaffold** and run `npm install`
2. **Configure your AI API key** in VS Code settings
3. **Press F5** to launch the extension development host
4. **Open command palette** (Ctrl+Shift+P) and run "SDLC: New Project"

## Integration with Web App

This VS Code extension can share the same knowledge base with the web dashboard:
- Store project data in a `.sdlc/` folder in the workspace
- Use JSON/SQLite for local persistence
- Optionally sync with cloud backend via REST API

## Resources

- [VS Code Extension API](https://code.visualstudio.com/api)
- [Webview API](https://code.visualstudio.com/api/extension-guides/webview)
- [Tree View API](https://code.visualstudio.com/api/extension-guides/tree-view)
