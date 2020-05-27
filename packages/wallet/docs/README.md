# Dev Docs

## Absolute Imports

Absolute imports are configured for the directories under `wallet/app` aimed to prevent "../" or
longer imports.

To configure a new one:

1. In `tsconfig.json`, add it to `paths`
2. In `babel.config.js`, make sure it gets transformed correctly into `alias`
3. In `eslintrc.js`, make sure it gets transformed correctly into `pathGroups`
4. Replace relative imports with absolute ones and run `lint:fix`
