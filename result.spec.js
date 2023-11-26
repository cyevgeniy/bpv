import { ok, notOk } from "./result";
import { test, expect } from "vitest";

test("notOk function works", () => {
  expect(notOk("fail")).toStrictEqual({
    ok: false,
    value: undefined,
    message: "fail",
  });
  expect(notOk()).toStrictEqual({ ok: false, value: undefined, message: "" });
});

test("ok function works", () => {
  expect(ok()).toStrictEqual({ ok: true, value: undefined, message: "" });
  expect(ok("str")).toStrictEqual({ ok: true, value: "str", message: "" });
  expect(ok("str", "ok")).toStrictEqual({
    ok: true,
    value: "str",
    message: "ok",
  });

  const r = ok(() => 42, "ok");

  expect(r.value()).toBe(42);
  expect(r.ok).toBe(true);
});
