import { ok, notOk } from "./result";
import { test, expect } from "vitest";

const nullObject = Object.create(null);

test("notOk function works", () => {
	expect(notOk("fail")).toStrictEqual({
		ok: false,
		value: undefined,
		message: "fail",
	});
	expect(notOk(nullObject)).toStrictEqual({
		ok: false,
		value: undefined,
		message: "",
	});
	expect(notOk()).toStrictEqual({ ok: false, value: undefined, message: "" });
	expect(notOk({ name: "hi" })).toStrictEqual({
		ok: false,
		value: undefined,
		message: "",
	});
});

test("ok function works", () => {
	expect(ok(nullObject)).toStrictEqual({
		ok: true,
		value: nullObject,
		message: "",
	});
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
