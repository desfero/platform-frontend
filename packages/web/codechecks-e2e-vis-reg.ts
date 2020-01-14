import { codechecks } from "@codechecks/client";
import * as exec from "await-exec";
import { join } from "path";

export async function main(): Promise<void> {
  await visReg();
}

async function visReg(): Promise<void> {
  await codechecks.saveDirectory("e2e-vis-reg", join(__dirname, "cypress/screenshots"));

  if (codechecks.isPr()) {
    await codechecks.getDirectory("e2e-vis-reg", join(__dirname, ".reg/expected"));

    const execOptions = { timeout: 300000, cwd: process.cwd(), log: true };
    await exec("./node_modules/.bin/reg-suit -c regconfig_e2e.json compare", execOptions);

    await codechecks.saveDirectory("e2e-vis-reg-report", join(__dirname, ".reg"));

    const reportData = require("./.reg/out.json");
    await codechecks.success({
      name: "Visual regression for E2E",
      shortDescription: `Changed: ${reportData.failedItems.length}, New: ${reportData.newItems.length}, Deleted: ${reportData.deletedItems.length}`,
      detailsUrl: codechecks.getArtifactLink("/e2e-vis-reg-report/index.html"),
    });
  }
}
