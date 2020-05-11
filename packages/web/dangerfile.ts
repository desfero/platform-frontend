import { danger, fail, message } from "danger";
import { writeFileSync } from "fs";
import { uniq } from "lodash";

const main = (): void => {
  checkPackageLock();
  getE2ETestTags();
};

function checkPackageLock(): void {
  if (!danger.github.pr) {
    return;
  }
  const hasPackageLock = danger.git.created_files.includes("package-lock.json");

  if (hasPackageLock) {
    fail("Package lock detected - Do not use npm, use yarn instead.");
  }
  message("No Package lock detected");
}

// We will always run these tests in PR
const alwaysRunningTests = ["#p1", "#p2"];

function getE2ETestTags(): void {
  // if it's github pr read tags from pr body.
  // in case of time triggered builds run all e2e tests
  const prBody = danger.github.pr.body;

  const tags = prBody.match(/#\w+/g) ?? [];
  const allTags = uniq(alwaysRunningTests.concat(tags));

  writeFileSync("./e2e/e2e-test-tags", allTags.join("&"));

  message(`Running tests for ${allTags.join(", ")}`);
}

main();
