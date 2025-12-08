// src/projectScanner.ts
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { PackageJson, PackageLockJson, ProjectState } from "./types";

function readJsonFile<T>(p: string): T {
  const raw = fs.readFileSync(p, "utf8");
  return JSON.parse(raw) as T;
}

export function findProjectRoot(cwd: string = process.cwd()): string {
  // MVP: assume cwd is project root if package.json exists
  const pkgPath = path.join(cwd, "package.json");
  if (!fs.existsSync(pkgPath)) {
    throw new Error(`No package.json found in ${cwd}`);
  }
  return cwd;
}

export function scanProject(cwd: string = process.cwd()): ProjectState {
  const rootDir = findProjectRoot(cwd);
  const packageJsonPath = path.join(rootDir, "package.json");
  const packageLockPath = path.join(rootDir, "package-lock.json");

  if (!fs.existsSync(packageLockPath)) {
    throw new Error(`package-lock.json not found in ${rootDir}`);
  }

  const packageJson = readJsonFile<PackageJson>(packageJsonPath);
  const packageLock = readJsonFile<PackageLockJson>(packageLockPath);

  const nodeVersion = process.version.replace(/^v/, "");
  const npmVersion = detectNpmVersion();

  return {
    rootDir,
    packageJsonPath,
    packageLockPath,
    packageJson,
    packageLock,
    nodeVersion,
    npmVersion,
  };
}

function detectNpmVersion(): string {
  try {
    const out = execSync("npm --version", { encoding: "utf8" }).trim();
    return out;
  } catch {
    // fallback from npm_config_user_agent if running inside npm
    const ua = process.env.npm_config_user_agent;
    if (ua) {
      const match = ua.match(/npm\/(\d+\.\d+\.\d+)/);
      if (match) return match[1];
    }
    return "unknown";
  }
}
