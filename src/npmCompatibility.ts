// src/npmCompatibility.ts
import { Issue, PackageJson, PackageLockJson } from "./types";

function parseMajor(version: string): number | null {
  const m = version.match(/^(\d+)\./);
  return m ? Number(m[1]) : null;
}

export function checkNpmCompatibility(
  pkg: PackageJson,
  lock: PackageLockJson,
  currentNpmVersion: string
): Issue[] {
  const issues: Issue[] = [];
  const lf = lock.lockfileVersion;
  const currentMajor = parseMajor(currentNpmVersion ?? "");

  let expectedRange = "";
  if (lf === 2) {
    expectedRange = "npm 7–9";
  } else if (lf === 3) {
    expectedRange = "npm 9+";
  }

  if (lf && currentMajor) {
    if (lf === 2 && currentMajor >= 10) {
      issues.push({
        type: "npm-compat",
        severity: "warn",
        message: `Lockfile version is ${lf} (typically written by ${expectedRange}), but current npm is ${currentNpmVersion}.`,
        remediation:
          "Recommended: pin npm to 9.x in CI, or regenerate package-lock.json with the current npm and commit it.",
      });
    } else if (lf === 3 && currentMajor < 9) {
      issues.push({
        type: "npm-compat",
        severity: "warn",
        message: `Lockfile version is ${lf} (typically written by ${expectedRange}), but current npm is ${currentNpmVersion} (older).`,
        remediation:
          "Recommended: upgrade npm in CI to a version compatible with this lockfile.",
      });
    }
  }

  // Optional: engines.npm or packageManager mismatch
  if (pkg.packageManager) {
    const match = pkg.packageManager.match(/npm@(\d+\.\d+\.\d+)/);
    if (match) {
      const declaredMajor = parseMajor(match[1]);
      if (currentMajor && declaredMajor && declaredMajor !== currentMajor) {
        issues.push({
          type: "npm-compat",
          severity: "warn",
          message: `package.json declares packageManager "${pkg.packageManager}", but current npm is ${currentNpmVersion}.`,
          remediation:
            "Recommended: align the npm version in CI with packageManager or regenerate the lockfile using the CI npm version.",
        });
      }
    }
  }

  return issues;
}
