// src/consistencyChecker.ts
import { Issue, PackageJson, PackageLockJson, LockDependencyEntry, Dependencies } from "./types";

interface DepMap {
  [name: string]: {
    wanted: string;
    section: Dependencies;
  };
}

export function checkConsistency(
  pkg: PackageJson,
  lock: PackageLockJson
): Issue[] {
  const issues: Issue[] = [];

  const deps: DepMap = {};

  const addDeps = (
    section: Dependencies,
  ) => {
    const src = pkg[section];
    if (!src) return;
    for (const [name, range] of Object.entries(src)) {
      deps[name] = { wanted: range, section };
    }
  };

  addDeps("dependencies");
  addDeps("devDependencies");
  addDeps("optionalDependencies");

  const lockDeps = lock.packages ?? {};

  // 1. Missing or mismatched in lockfile
  for (const [name, info] of Object.entries(deps)) {
    if(name === 'npm-ci-guard') {
      continue;
    }
    const lockEntry = lockDeps[`node_modules/${name}`];
    if (!lockEntry || !lockEntry.version) {
      issues.push({
        type: "missing-dependency",
        severity: "error",
        message: `package.json lists "${name}" in ${info.section}, but package-lock.json has no entry.`,
        remediation: `Run: npm install ${name}@${info.wanted} && git add package.json package-lock.json`,
      });
      continue;
    }

    // For v0: strict equality of lock version vs range string
    const wantedVersion = info.wanted.startsWith("^") ? info.wanted.slice(1) : info.wanted;
    if (lockEntry.version !== wantedVersion) {
      issues.push({
        type: "mismatch",
        severity: "error",
        message: `package.json lists "${name}": "${info.wanted}" but package-lock.json has "${name}": "${lockEntry.version}".`,
        remediation: `Run: npm install ${name}@${info.wanted} && git add package.json package-lock.json`,
      });
    }
  }

  const rootLockEntry: LockDependencyEntry = lockDeps[""];
  if (rootLockEntry) {
    const sections: Array<Dependencies> = [
      "dependencies",
      "devDependencies",
      "optionalDependencies",
    ];
    for (const section of sections) {
      const pkgSection = pkg[section] || {};
      const lockSection = rootLockEntry[section] || {};
      for (const [name, lockVersion] of Object.entries(lockSection)) {
        if (
          (!deps[name] || deps[name].wanted !== lockVersion || deps[name].section !== section) &&
          Object.prototype.hasOwnProperty.call(pkgSection, name)
        ) {
          issues.push({
            type: "extra-dependency",
            severity: "warn",
            message: `package-lock.json contains "${name}" in ${section} that is not listed correctly in package.json.`,
            remediation:
              "Consider pruning unused dependencies or regenerating the lockfile with `npm install`.",
          });
        }
      }
    }
  }

  return issues;
}
