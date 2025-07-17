// for each folder under /fixtures
// make a folder called "test"
// copy the contents of the folder into the "test" folder
// run vite build
// check if wrangler.jsonc = wrangler.expected.jsonc
// if yes, test passes
// else test fails

import { describe, it, expect, afterEach, beforeEach } from "vitest";
import {
  readdirSync,
  copyFileSync,
  readFileSync,
  mkdirSync,
  rmdirSync,
} from "fs";
import { execSync } from "child_process";
import { join } from "path";

const fixtures = readdirSync(join(__dirname, "../fixtures"));

beforeEach(() => {
  // create the /harness/test folder
  mkdirSync(join(__dirname, "test"));
});

afterEach(() => {
  // delete the /harness/test folder
  rmdirSync(join(__dirname, "test"), { recursive: true });
});

describe("fixtures", () => {
  it.each(fixtures)("%s", (fixture) => {
    console.log(`Running test for ${fixture}`);
    // copy all files from harness/test to /test
    readdirSync(join(__dirname, "harness"), { withFileTypes: true }).forEach(
      (file) => {
        if (file.isFile()) {
          copyFileSync(
            join(__dirname, "harness", file.name),
            join(__dirname, "test", file.name)
          );
        }
      }
    );

    // copy all the files to /test
    readdirSync(join(__dirname, "../fixtures", fixture), {
      withFileTypes: true,
    }).forEach((file) => {
      if (file.isFile()) {
        copyFileSync(
          join(__dirname, "../fixtures", fixture, file.name),
          join(__dirname, "test", file.name)
        );
      }
    });
    // run vite build
    execSync("npx vite build", { cwd: join(__dirname, "test") });
    // check if wrangler.jsonc = wrangler.expected.jsonc
    expect(
      readFileSync(join(__dirname, "test", "wrangler.jsonc"), "utf8")
    ).toEqual(
      readFileSync(join(__dirname, "test", "wrangler.expected.jsonc"), "utf8")
    );
  });
});
