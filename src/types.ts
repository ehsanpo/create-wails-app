export interface ProjectAnswers {
  projectName: string;
  outputDir?: string;
}

export interface WailsVersionAnswer {
  wailsVersion: 2 | 3;
}

export interface FrontendAnswer {
  frontend: 'react' | 'vue' | 'svelte' | 'solid' | 'vanilla';
}

export interface FrontendExtrasAnswer {
  frontendExtras: string[];
}

export interface AppFeaturesAnswer {
  appFeatures: string[];
}

export interface DataBackendAnswer {
  dataBackend: string[];
  supabaseOptions?: ('auth' | 'database' | 'storage')[];
}

export interface TestingAnswer {
  enableTesting: boolean;
  testingFrameworks?: string[];
}

export interface AllAnswers extends 
  ProjectAnswers, 
  WailsVersionAnswer, 
  FrontendAnswer, 
  FrontendExtrasAnswer,
  AppFeaturesAnswer,
  DataBackendAnswer,
  TestingAnswer {
  confirmed: boolean;
}

export interface TemplateInfo {
  url: string;
  name: string;
  wailsVersion: 2 | 3;
  frontend: string;
  hasTypeScript?: boolean;
}

export interface FeaturePatch {
  name: string;
  description: string;
  files: Map<string, string>;
  dependencies?: {
    go?: string[];
    npm?: string[];
  };
  apply: (projectPath: string) => Promise<void>;
}

export interface GeneratorConfig {
  projectName: string;
  projectPath: string;
  wailsVersion: 2 | 3;
  wailsCLI: 'wails' | 'wails3';
  frontend: 'react' | 'vue' | 'svelte' | 'solid' | 'vanilla';
  template: TemplateInfo;
  patches: FeaturePatch[];
  features: {
    typescript: boolean;
    tailwind: boolean;
    router: boolean;
    eslintPrettier: boolean;
    githubActions: boolean;
    singleInstance: boolean;
    systemTray: boolean;
    autoUpdate: boolean;
    nativeDialogs: boolean;
    appConfig: boolean;
    deepLinking: boolean;
    startup: boolean;
    clipboard: boolean;
    fileWatcher: boolean;
    sqlite: boolean;
    encryptedStorage: boolean;
    supabase: boolean;
    supabaseAuth: boolean;
    supabaseDatabase: boolean;
    supabaseStorage: boolean;
    testingFrontendUnit: boolean;
    testingFrontendE2E: boolean;
    testingBackend: boolean;
  };
}
