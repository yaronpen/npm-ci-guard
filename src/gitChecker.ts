// src/gitChecker.ts
import { execSync } from "node:child_process";
import { Issue } from "./types";

export function checkGitStatus(): Issue[] {
  const issues: Issue[] = [];

  try {
    const out = execSync(
      "git status --porcelain package.json package-lock.json",
      { encoding: "utf8" }
    ).trim();

    if (out) {
      issues.push({
        type: "git-uncommitted",
        severity: "error",
        message:
          "Detected uncommitted changes in package.json or package-lock.json.",
        remediation:
          "Commit your lockfile and package.json changes before running CI.\n→ Run: git add package.json package-lock.json && git commit -m \"Update deps\"",
      });
    }
  } catch {
    // Not a git repo, or git not installed – ignore for MVP
  }

  return issues;
}
