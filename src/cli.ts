#!/usr/bin/env node
import { Command } from "commander";
import { scanProject } from "./projectScanner";
import { checkConsistency } from "./consistencyChecker";
import { checkNpmCompatibility } from "./npmCompatibility";
import { checkGitStatus } from "./gitChecker";
import { reportIssues } from "./reporter";
import { CheckOptions, Issue } from "./types";

const program = new Command();

program
  .name("npm-ci-guard")
  .description("Catch npm CI lockfile problems before they hit main.")
  .version("0.1.0");

program
  .command("check")
  .description("Check lockfile consistency and npm compatibility.")
  .option("--strict", "Treat all mismatches as errors (default).", true)
  .option(
    "--warn-only",
    "Exit with code 0 even if issues are found (for initial adoption).",
    false
  )
  .option("--ci", "CI mode: strict, minimal non-color output.", false)
  .action((opts: CheckOptions) => {
    const options: CheckOptions = {
      strict: opts.strict ?? true,
      warnOnly: opts.warnOnly ?? false,
      ci: opts.ci ?? false,
    };

    try {
      const project = scanProject();
      const issues: Issue[] = [];

      issues.push(...checkConsistency(project.packageJson, project.packageLock));
      issues.push(
        ...checkNpmCompatibility(
          project.packageJson,
          project.packageLock,
          project.npmVersion
        )
      );
      issues.push(...checkGitStatus());

      const exitCode = reportIssues(issues, { warnOnly: options.warnOnly });
      process.exit(exitCode);
    } catch (err) {
      console.error("npm-ci-guard encountered an error:");
      if (err instanceof Error) {
        console.error(err.message);
      } else {
        console.error(String(err));
      }
      process.exit(2);
    }
  });

program.parse(process.argv);
