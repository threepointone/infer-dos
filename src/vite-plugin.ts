import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import type { Plugin } from "vite";
import { getDurableObjectClassNames } from "./index.js";

export interface InferDosOptions {
  /** Path to wrangler.jsonc file (default: "wrangler.jsonc") */
  wranglerConfigPath?: string;
}

export default function inferDosPlugin(options: InferDosOptions = {}): Plugin {
  const { wranglerConfigPath = "wrangler.jsonc" } = options;

  let resolvedWranglerPath: string;

  return {
    name: "infer-dos",

    configResolved(config) {
      // Resolve the wrangler.jsonc path relative to the project root
      resolvedWranglerPath = resolve(config.root, wranglerConfigPath);
    },

    buildStart() {
      try {
        updateWranglerConfig();
      } catch (error) {
        console.error("[infer-dos] Error updating wrangler.jsonc:", error);
        throw error;
      }
    },
  };

  function updateWranglerConfig() {
    if (!existsSync(resolvedWranglerPath)) {
      console.warn(
        `[infer-dos] Wrangler config not found: ${resolvedWranglerPath}`
      );

      return;
    }

    // Read and parse wrangler.jsonc
    const configContent = readFileSync(resolvedWranglerPath, "utf-8");
    const config = parseJsonc(configContent);

    if (!config) {
      throw new Error("Failed to parse wrangler.jsonc");
    }

    // Get the main entry point
    const mainEntry = config.main;
    if (!mainEntry || typeof mainEntry !== "string") {
      throw new Error(
        "[infer-dos] No main entry point found in wrangler.jsonc"
      );
    }

    const mainPath = resolve(dirname(resolvedWranglerPath), mainEntry);

    if (!existsSync(mainPath)) {
      throw new Error(`[infer-dos] Main entry point not found: ${mainPath}`);
    }

    // Get Durable Object class names from the main file
    const durableObjectClasses = getDurableObjectClassNames(mainPath);

    // Create durable_object_bindings
    const bindings = durableObjectClasses.map((className) => ({
      name: className,
      class_name: className,
    }));

    // Update the config
    const updatedConfig = {
      ...config,
      durable_object_bindings: bindings,
    };

    // Write updated config
    const updatedContent = stringifyJsonc(updatedConfig);
    writeFileSync(resolvedWranglerPath, updatedContent);

    console.log(
      `[infer-dos] Updated wrangler.jsonc with ${bindings.length} Durable Object bindings`
    );
  }
}

/**
 * Simple JSONC parser that removes comments and parses JSON
 */
function parseJsonc(content: string): Record<string, unknown> {
  // Remove single-line comments
  const withoutSingleLineComments = content.replace(/\/\/.*$/gm, "");
  // Remove multi-line comments
  const withoutComments = withoutSingleLineComments.replace(
    /\/\*[\s\S]*?\*\//g,
    ""
  );

  try {
    return JSON.parse(withoutComments);
  } catch (error) {
    throw new Error(`Failed to parse JSONC: ${error}`);
  }
}

/**
 * Simple JSONC stringifier that preserves basic formatting
 */
function stringifyJsonc(obj: Record<string, unknown>): string {
  return JSON.stringify(obj, null, 2);
}
