//@ts-check

import { ok, notOk } from "./result.js";

/**
 * @typedef {Object} Version
 * @property {number} major
 * @property {number} minor
 * @property {number} patch
 * @property {string[]} prerelease
 * @property {string[]} build
 */

/**
 * Bump specified part of the version object.
 *
 * @param v {Version} version to bump
 * @param k {"major" | "minor" | "patch"}
 * @returns {Version}
 */
export function bump(v, k) {
	if (!Object.prototype.hasOwnProperty.call(v, k)) {
		return v;
	}

	// 1.2.1 === Patch ===> 1.2.2
	// 1.2.1 === Minor ===> 1.3.0
	// 1.2.1 === Major ===> 2.0.0
	let { major, minor, patch } = v;
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

	const { prerelease, build } = v;
	return {
		major: major,
		minor: minor,
		patch: patch,
		prerelease: prerelease,
		build: build,
	};
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
	const dashIndex = s.indexOf("-");
	const plusIndex = s.indexOf("+");

	/**
	 * @type {string[]}
	 */
	let prerelease = [];

	/**
	 * @type {string[]}
	 */
	let build = [];

	// 1.2.3-beta.0.1
	if (dashIndex != -1 && plusIndex == -1) {
		const prereleaseString = s.slice(dashIndex + 1);
		prerelease = prereleaseString.split(".");
	}

	if (plusIndex != -1 && dashIndex == -1) {
		const buildString = s.slice(plusIndex + 1);
		prerelease = buildString.split(".");
	}

	if (plusIndex != -1 && dashIndex != -1) {
		const prereleaseString = s.slice(dashIndex + 1, plusIndex);
		const buildString = s.slice(plusIndex + 1);
		prerelease = prereleaseString.split(".");
		build = buildString.split(".");
	}

	let temporary = s;

	let endIndex;

	if (dashIndex !== -1) {
		endIndex = dashIndex;
	} else if (plusIndex !== -1) {
		endIndex = plusIndex;
	}

	// endIndex is undefined if the version hasn't pre-release or build info
	temporary = s.slice(0, endIndex);

	// split by dots
	const parts = temporary.split(".");

	return ok({
		major: +parts[0],
		minor: +parts[1],
		patch: +parts[2],
		prerelease: prerelease,
		build: build,
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

	let result = `${v.major}.${v.minor}.${v.patch}`;

	if (v.prerelease.length > 0) {
		result += "-" + v.prerelease.join(".");
	}

	if (v.build.length > 0) {
		result += "+" + v.build.join(".");
	}

	return result;
}
