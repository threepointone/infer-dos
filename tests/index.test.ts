import fs from "node:fs";
import { describe, it, expect } from "vitest";
import { getDurableObjectClassNames } from "../src/index.js";

describe("getDurableObjectClassNames", () => {
  it.each(fs.readdirSync("./fixtures"))("%s", (fixture) => {
    // for all dirs under /fixtures, run the test
    const expectedOutput = fs
      .readFileSync(`./fixtures/${fixture}/output.json`, "utf8")
      .trim();
    const classNames = getDurableObjectClassNames(
      `./fixtures/${fixture}/input.ts`
    );
    console.log(`fixture: ${fixture}`);
    console.log(`expected: ${expectedOutput}`);
    console.log(`actual: ${JSON.stringify(classNames)}`);
    console.log(`--------------------------------`);
    expect(classNames).toEqual(JSON.parse(expectedOutput));
  });
});
