#!/usr/bin/env node

import { getDurableObjectClassNames } from "./index.js";

const args = process.argv.slice(1);

if (args.length !== 1) {
  console.error("Usage: npx infer-dos <input-file>");
  process.exit(1);
}

// Run the main function
try {
  console.log(JSON.stringify(getDurableObjectClassNames(args[0]), null, 2));
} catch (error) {
  console.error(error);
  process.exit(1);
}
