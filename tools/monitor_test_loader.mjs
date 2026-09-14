// Resolve the existing shared dependency installation for local QA only.
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
const require = createRequire(new URL('./WebRuntime/package.json', import.meta.url));
export async function resolve(specifier, context, nextResolve) {
  try { return await nextResolve(specifier, context); }
  catch (error) {
    if (!['three', 'typescript'].includes(specifier)) throw error;
    return { url: pathToFileURL(require.resolve(specifier)).href, shortCircuit: true };
  }
}
