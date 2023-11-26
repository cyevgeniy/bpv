import { test, expect } from "vitest";
import { isValid } from "./config";

test("isValid function works with valid data", () => {
  const objs = [
    {
      currentVersion: "1.2.3",
      rules: [],
    },
    {
      currentVersion: "12",
      rules: [{ file: "testfile", version: "12" }],
    },
    {
      currentVersion: "12",
      rules: [{ file: "testfile", version: "12", somefld: 12 }],
    }
  ];

  for (const item of objs) expect(isValid(item)).toBeTruthy();
});

test("isValid function works with invalid data", () => {
  const object1 = {
    currentVersion: "1.2.3",
  }
  const object2 = {
    currentVersion: "",
    rules: [{ version: "12" }],
  }
  const object3 = {
    currentVersion: [1,2,3],
    rules: [{ file: 123, version: {val: "12"}, somefld: 12 }],
  }
  const object4 = {
    currentVersion: "12",
    rules: [{ file: 123, version: "12", somefld: 12 }],
  }
  const object5 = {
    currentVersion: "12",
    rules: [{ file: "testfile", version: {value: "12"}, somefld: 12 }],
  }



  expect(isValid(object1)).toBeFalsy();
  expect(isValid(object2)).toBeFalsy();
  expect(isValid(object3)).toBeFalsy();
  expect(isValid(object4)).toBeFalsy();
  expect(isValid(object5)).toBeFalsy();
});
