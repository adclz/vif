/** @satisfies {import('@webcontainer/api').FileSystemTree} */

export const files = {
    'main.test.ts': {
        file: {
            contents: `
import { describe, expect, it } from 'vitest';

describe('MAIN', () => {
  const h = new BroadcastChannel("kllh")
  it('J', () => expect(true).to.be.equal(true));
});`,
        },
    },
    'package.json': {
        file: {
            contents: `
          {
            "name": "example-app",
            "type": "module",
            "dependencies": {
              "vitest": "latest",
              "@vitest/ui": "latest"
            },
            "scripts": {
              "test": "vitest --ui"
            }
          }`,
        },
    },
};