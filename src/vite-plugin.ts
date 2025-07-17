import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import type { Plugin } from "vite";
import { getDurableObjectClassNames } from "./index.js";
import { nanoid } from "nanoid";

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

    const existingBindings =
      // @ts-expect-error - config.durable_objects is not typed
      config.durable_objects?.bindings.map((b) => b.name) || [];

    const newBindings = bindings.filter(
      (binding) => !existingBindings.includes(binding.name)
    );
    // const removedBindings = existingBindings.filter(
    //   // @ts-expect-error - config.durable_objects is not typed
    //   (binding) => !bindings.some((b) => b.name === binding)
    // );

    const sqlite_classes_so_far = new Set();
    // @ts-expect-error - config.migrations is not typed
    for (const migration of config.migrations || []) {
      for (const class_name of migration.new_sqlite_classes || []) {
        sqlite_classes_so_far.add(class_name);
      }
      for (const class_name of migration.deleted_classes || []) {
        sqlite_classes_so_far.delete(class_name);
      }
    }

    const new_sqlite_classes = [];
    const deleted_classes = [];

    // any classes in sqlite_classes_so_far that are not in newBindings
    for (const class_name of sqlite_classes_so_far) {
      if (!bindings.some((b) => b.class_name === class_name)) {
        deleted_classes.push(class_name);
      }
    }

    // any classes in newBindings that are not in sqlite_classes_so_far
    for (const class_name of bindings.map((b) => b.class_name)) {
      if (!sqlite_classes_so_far.has(class_name)) {
        new_sqlite_classes.push(class_name);
      }
    }

    const migration =
      new_sqlite_classes.length > 0 || deleted_classes.length > 0
        ? {
            tag: `v-${nanoid(6)}`,
            ...(deleted_classes.length > 0
              ? {
                  deleted_classes,
                }
              : {}),
            ...(new_sqlite_classes.length > 0
              ? {
                  new_sqlite_classes,
                }
              : {}),
          }
        : undefined;

    if (newBindings.length === 0 && !migration) {
      return;
    }

    // Update the config
    const updatedConfig = {
      ...config,
      durable_objects: {
        bindings: newBindings,
      },
      migrations: [
        // @ts-expect-error - config.migrations is not typed
        ...(config.migrations || []),
        ...(migration ? [migration] : []),
      ],
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
