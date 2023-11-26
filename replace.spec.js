import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { replaceInFile } from "./replace.js";
import { readFile, writeFile, unlink } from "node:fs/promises";

const testContent = "test s tring ring";

describe("Replace in file", () => {
  beforeEach(async () => {
    await writeFile("test1", testContent);
  });

  afterEach(async () => {
    await unlink("test1");
  });

  it("Fails if there'is no specified file", async () => {
    const result = await replaceInFile({
      file: "test12345",
      from: /test/g,
      to: "b",
    });
    expect(result.ok).toBeFalsy();
  });

  it("Fails if replaceOption is missing the 'file' property", async () => {
    const result = await replaceInFile({ from: /test/g, to: "b" });
    expect(result.ok).toBeFalsy();
  });

  it("Fails if replaceOption is missing the 'from' property", async () => {
    const result = await replaceInFile({ file: "test1", to: "b" });
    expect(result.ok).toBeFalsy();
  });

  it("Fails if replaceOption is missing the 'to' property", async () => {
    const result = await replaceInFile({ file: "test1", from: /test/g });
    expect(result.ok).toBeFalsy();
  });

  it("Fails if regular expression is missing the 'g' flag", async () => {
    const result = await replaceInFile({ file: "test1", from: /test/, to: "c" });
    expect(result.ok).toBeFalsy();
  });

  it("Works if to property is an empty string", async () => {
    const result = await replaceInFile({
      file: "test1",
      from: /test/g,
      to: "",
    });
    const newContent = await readFile("test1", { encoding: "utf8" });
    expect(newContent).toBe(" s tring ring");
    expect(result.ok).toBeTruthy();
    expect(result.value).toStrictEqual({ file: "test1", hasChanged: true });
  });

  it("Replaces a string in a file", async () => {
    await replaceInFile({ file: "test1", from: /test/g, to: "b" });
    const newContent = await readFile("test1", { encoding: "utf8" });
    expect(newContent).toBe("b s tring ring");
  });

  it("Replaces all matches in a file", async () => {
    await replaceInFile({ file: "test1", from: /ring/g, to: "c" });
    const newContent = await readFile("test1", { encoding: "utf8" });
    expect(newContent).toBe("test s tc c");
  });

  it("Returns correct result if replace successful", async () => {
    const result = await replaceInFile({
      file: "test1",
      from: /test/g,
      to: "b",
    });
    expect(result.value).toStrictEqual({ file: "test1", hasChanged: true });
  });

  it("Returns correct result if the file doesn't have any match", async () => {
    const result = await replaceInFile({
      file: "test1",
      from: /abcde/g,
      to: "b",
    });
    expect(result.value).toStrictEqual({
      file: "test1",
      hasChanged: false,
    });
  });

  it("Works with dry run option", async () => {
    const result = await replaceInFile({
      file: "test1",
      from: /ring/g,
      to: ""
    }, true);

    expect(result.value).toStrictEqual({
      file: "test1",
      hasChanged: true
    });

    const fileContent = await readFile("test1", {encoding: "utf8"});

    // Original file shouldn't be changed
    expect(fileContent).toBe(testContent);
  })
});
