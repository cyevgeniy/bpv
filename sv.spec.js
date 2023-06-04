import { bump, parse } from "./sv";
import { test, expect } from "vitest";


test("Bump works", () => {
	let a = { major: 0, minor: 0, patch: 1 };

	expect(bump(a, "patch")).toStrictEqual({ major: 0, minor: 0, patch: 2 });
	expect(bump(a, "minor")).toStrictEqual({ major: 0, minor: 1, patch: 0 });
	expect(bump(a, "major")).toStrictEqual({ major: 1, minor: 0, patch: 0 });
});

test("parse works", () => {
	expect(parse("").ok).toBeFalsy()
	expect(parse().ok).toBeFalsy()

	const result = parse("0.1.1")
	expect(result.value).toStrictEqual({major: 0, minor: 1, patch: 1})
	expect(parse("12.1.19").value).toStrictEqual({major: 12, minor: 1, patch: 19})

	expect(parse("0.1").ok).toBeFalsy()
	// Must not contain leading zeroes
	expect(parse("0.00.00").ok).toBeFalsy()
	expect(parse("...").ok).toBeFalsy()
	expect(parse("a.b.c").ok).toBeFalsy()
	expect(parse("..").ok).toBeFalsy()
	expect(parse("1e2.0x25.").ok).toBeFalsy()
	expect(parse("1,31.0.0").ok).toBeFalsy()
	expect(parse("1.-1.0").ok).toBeFalsy()
})
