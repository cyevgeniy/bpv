//@ts-check

import { ok, notOk } from "./result.js";

/**
 * @typedef {Object} Version
 * @property {number} major
 * @property {number} minor
 * @property {number} patch
 */

/**
 * Bump specified part of the version object.
 *
 * @param v {Version} version to bump
 * @param k {"major" | "minor" | "patch"}
 * @returns {Version}
 */
export function bump(v, k) {
	if (!(Object.prototype.hasOwnProperty.call(v, k))) {
		return v;
	}

	// 1.2.1 === Patch ===> 1.2.2
	// 1.2.1 === Minor ===> 1.3.0
	// 1.2.1 === Major ===> 2.0.0
	let {major, minor, patch} = v
	switch (k) {
		case "patch": {
			++patch;
			break;
		}
		case "minor": {
			++minor;
			patch = 0;
			break;
		}
		case "major": {
			++major;
			minor = 0;
			patch = 0;
			break;
		}
	}

	return {
		major: major,
		minor: minor,
		patch: patch
	}
}

/**
 * Checks if specified string is a valid semver
 * https://semver.org/
 *
 * @param {string} s String with version being checked
 * @returns {boolean}
 */
function isValid(s) {
	const re =
		/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[A-Za-z-][\dA-Za-z-]*)(?:\.(?:0|[1-9]\d*|\d*[A-Za-z-][\dA-Za-z-]*))*))?(?:\+([\dA-Za-z-]+(?:\.[\dA-Za-z-]+)*))?$/;
	return re.test(s);
}

/**
 * @typedef {import('./result.js').Result} Result
 */

/**
 * Parses string and returns an object with the result.
 * If parse was successful, Version will be in the result.value
 * field. If parsing was failed, `value` field will be empty.
 *
 * @param s {string} string being parsed
 * @returns {Result}
 */
export function parse(s) {
	if (!isValid(s)) {
		return notOk("Specified version is not a valid SemVer");
	}

	// Remove any pre-release info
	const index = s.indexOf("-");

	let temporary = s;

	if (index !== -1) {
		temporary = s.slice(0, index);
	}

	// split by dots
	const parts = temporary.split(".");

	return ok({
		major: +parts[0],
		minor: +parts[1],
		patch: +parts[2],
	});
}

/**
 * Returns string representation of a version.
 *
 * @param {Version} v version
 * @returns {string} - string representation of a version
 */
export function versionToString(v) {
	if (!v) {
		return "";
	}

	return `${v.major}.${v.minor}.${v.patch}`;
}
