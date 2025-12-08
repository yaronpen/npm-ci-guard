// src/types.ts
export type Severity = "info" | "warn" | "error";

export type IssueType =
  | "mismatch"
  | "missing-dependency"
  | "extra-dependency"
  | "npm-compat"
  | "git-uncommitted"
  | "internal";

export interface Issue {
  type: IssueType;
  severity: Severity;
  message: string;
  remediation?: string;
}

export interface CheckOptions {
  strict: boolean;
  warnOnly: boolean;
  ci: boolean;
}

export interface PackageJson {
  name?: string;
  version?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
  engines?: {
    node?: string;
    npm?: string;
  };
  packageManager?: string;
}

export interface PackageLockJson {
  name?: string;
  version?: string;
  lockfileVersion?: number;
  // npm v7+ lockfile structure is more complex – we only need enough to compare
  packages?: Record<
    string,
    {
      version?: string;
      dev?: boolean;
      optional?: boolean;
    }
  >;
  dependencies?: Record<
    string,
    {
      version?: string;
      dev?: boolean;
      optional?: boolean;
    }
  >;
}

export interface ProjectState {
  rootDir: string;
  packageJsonPath: string;
  packageLockPath: string;
  packageJson: PackageJson;
  packageLock: PackageLockJson;
  nodeVersion: string;
  npmVersion: string;
}

export interface LockDependencyEntry {
  name?: string;
  version?: string;
  license?: string;
  dependencies?: { [name: string]: string };
  devDependencies?: { [name: string]: string };
  optionalDependencies?: { [name: string]: string };
  engines?: { [node: string]: string};
}

export type Dependencies = "dependencies" | "devDependencies" | "optionalDependencies";
