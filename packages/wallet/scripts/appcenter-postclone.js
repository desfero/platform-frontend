const fs = require('fs').promises;

const SCOPE_TO_REPLACE = "@neufund"

const appCenterPostClone = async () => {
  console.log(`Fixing temporally ${SCOPE_TO_REPLACE} packages to use \`file\` specifier`);

  try {
    const file = await fs.readFile('package.json', 'utf8');

    const result = file.replace(
      RegExp(`"${SCOPE_TO_REPLACE}\/(.+)": ".+"`, "g"),
      (_, packageName) => `"${SCOPE_TO_REPLACE}/${packageName}": "file:../${packageName}"`
    );

    await fs.writeFile('package.json', result, 'utf8');

    console.log(`All ${SCOPE_TO_REPLACE} in package.json now use file specifier`)
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};

appCenterPostClone();
