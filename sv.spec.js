import { bump, parse, versionToString } from "./sv";
import { test, expect } from "vitest";

test("Bump works", () => {
  let a = { major: 0, minor: 0, patch: 1, build: [], prerelease: [] };

  expect(bump(a, "patch")).toStrictEqual({
    major: 0,
    minor: 0,
    patch: 2,
    prerelease: [],
    build: [],
  });
  expect(bump(a, "minor")).toStrictEqual({
    major: 0,
    minor: 1,
    patch: 0,
    prerelease: [],
    build: [],
  });
  expect(bump(a, "major")).toStrictEqual({
    major: 1,
    minor: 0,
    patch: 0,
    prerelease: [],
    build: [],
  });

  let b = {
    major: 3,
    minor: 8,
    patch: 7,
    build: ["23", "--"],
    prerelease: [],
  };
  expect(bump(b, "minor")).toStrictEqual({
    major: 3,
    minor: 9,
    patch: 0,
    build: ["23", "--"],
    prerelease: [],
  });
});

test("parse works", () => {
  expect(parse("").ok).toBeFalsy();
  expect(parse().ok).toBeFalsy();

  const result = parse("0.1.1");
  expect(result.value).toStrictEqual({
    major: 0,
    minor: 1,
    patch: 1,
    prerelease: [],
    build: [],
  });
  expect(parse("12.1.19").value).toStrictEqual({
    major: 12,
    minor: 1,
    patch: 19,
    prerelease: [],
    build: [],
  });
  expect(parse("1.0.0-0.3.7").value).toStrictEqual({
    major: 1,
    minor: 0,
    patch: 0,
    build: [],
    prerelease: ["0", "3", "7"],
  });
  expect(parse("1.0.0-alpha+001").value).toStrictEqual({
    major: 1,
    minor: 0,
    patch: 0,
    prerelease: ["alpha"],
    build: ["001"],
  });

  expect(parse("0.1").ok).toBeFalsy();
  // Must not contain leading zeroes
  expect(parse("0.00.00").ok).toBeFalsy();
  expect(parse("...").ok).toBeFalsy();
  expect(parse("a.b.c").ok).toBeFalsy();
  expect(parse("..").ok).toBeFalsy();
  expect(parse("1e2.0x25.").ok).toBeFalsy();
  expect(parse("1,31.0.0").ok).toBeFalsy();
  expect(parse("1.-1.0").ok).toBeFalsy();
});

test("versionToString works", () => {
  expect(
    versionToString({
      major: 1,
      minor: 0,
      patch: 0,
      build: [],
      prerelease: [],
    })
  ).toBe("1.0.0");
  expect(
    versionToString({
      major: 1,
      minor: 0,
      patch: 0,
      prerelease: ["alpha", "12", "1"],
      build: ["12"],
    })
  ).toBe("1.0.0-alpha.12.1+12");
});
