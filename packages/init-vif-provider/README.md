# Create Vif Provider

Starts a new provider project.

- src:
  - internal: Creates your own blocks, templates
  - source: Declare the provider object, change the compiler behavior
  - wrap: Expose built-in types

- validate.js: Check if your provider can be built (executed via build of package.json)

- tests:
  - main.test.ts, empty test file (If you have selected the vitest option)

Usage:
- npx create-vif-provider [out-dir] [--overwrite-dir]