// src/reporter.ts
import { Issue } from "./types";

export interface ReportOptions {
  warnOnly: boolean;
}

export function reportIssues(issues: Issue[], opts: ReportOptions): number {
  if (issues.length === 0) {
    console.log("✅ npm-ci-guard: lockfile is consistent and appears safe for CI.");
    return 0;
  }

  console.log("❌ npm-ci-guard: lockfile consistency check failed\n");

  issues.forEach((issue, idx) => {
    const prefix = `${idx + 1}.`;
    console.log(`${prefix} ${issue.message}`);
    if (issue.remediation) {
      console.log(`   → ${issue.remediation}`);
    }
    console.log();
  });

  const hasErrors = issues.some((i) => i.severity === "error");
  if (!hasErrors || opts.warnOnly) {
    return 0;
  }
  return 1;
}
