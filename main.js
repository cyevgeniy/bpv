// @ts-check
import { loadConfig } from "./config.js";
import { bumpAllFiles, isDirty, tag, isUsable } from "./git.js";
import process from "node:process";
import { bump, parse, versionToString } from "./sv.js";
import { replaceInFile } from "./replace.js";
import { notOk } from "./result.js";
import cac from "cac";

const CONF_FILE = "bp.conf.json";

const cli = cac("bumper");

cli.option("--major", "Bump major version number")
	.option("--minor", "Bump minor version number")
	.option("--patch", "Bump patch version number")
	.option(
		"-v, --verbose",
		"Print list of files with version update status for each of them"
	)
	.option("-c, --commit", "Commit after bump")
	.option("-t, --tag", "Create a tag in the git repository");

cli.command("bump").action(runBump);
cli.command("set <version>").action(runSet);

try {
	cli.parse(process.argv, {run: false});

	await cli.runMatchedCommand();
} catch (/** @type {*}*/ error) {
	printErrorAndExit(error.message)
}

/**
 * Prints error message and perform exit with status = 1.
 *
 * @param {string} errorMessage Error message
 */
function printErrorAndExit(errorMessage) {
	console.error(errorMessage);
	process.exit(1);
}

/**
 * Takes template string from `config.rule` and returns
 * a regexp for replacement.
 *
 * @param {string} versionTemplate - string with version template
 * @param {string} version - version in a string format
 * @returns {RegExp | undefined} RegExp object
 */
function getReplaceRegexp(versionTemplate, version) {
	if (!versionTemplate || !version) {
		return;
	}

	const _version = version.replaceAll(/[$()*+.?[\\\]^{|}]/g, "\\$&");

	const source = versionTemplate.replaceAll("{{version}}", _version);
	return new RegExp(source, "g");
}

/**
 * Prints replace results.
 *
 * @param {import('./replace.js').ReplaceResult} replaceResult
 *
 */
function printReplaceResults(replaceResult) {
	if (!replaceResult) {
		return;
	}

	console.log(
		`File: ${replaceResult.file} changed: ${replaceResult.hasChanged}`
	);
}

/**
 * Replace version in a file with a new value.
 *
 * @param {string} file - File path
 * @param {string} currentVersion - Current version
 * @param {string} newVersion - New version
 * @param {string} pattern - Version string pattern
 * @returns {Promise<import("./result.js").Result>}
 */
async function replaceVersionInFile(file, currentVersion, newVersion, pattern) {
	const fromRegExp = getReplaceRegexp(pattern, currentVersion);

	if (!fromRegExp) {
		return notOk("Can't construct a regular expression for replacement");
	}

	/**
	 * @type {import ('./replace.js').ReplaceOption}
	 */
	const replaceOption = {
		file: file,
		from: fromRegExp,
		to: pattern.replaceAll("{{version}}", newVersion),
	};

	return await replaceInFile(replaceOption);
}

/**
 * Replace version in all files from the `config.rules` array.
 * If any errors were thrown during replacement, prints error
 * message and calls `process.exit(1)`.
 *
 * @param {import("./config.js").Rule[]} rules Array of rules
 * @param {string} currentVersion Current version
 * @param {string} newVersion New version
 * @param {boolean} printResults If true, prints replace results
 */
async function makeReplacements(
	rules,
	currentVersion,
	newVersion,
	printResults
) {
	for (const rule of rules) {
		const result = await replaceVersionInFile(
			rule.file,
			currentVersion,
			newVersion,
			rule.version
		);

		if (!result.ok) {
			printErrorAndExit(result.message);
		}

		if (printResults) {
			printReplaceResults(result.value);
		}
	}
}

/**
 * Main function
 *
 * @param {any} options command-line options
 */
async function runBump(options) {
	const configResult = loadConfig(CONF_FILE);

	if (!configResult.ok) {
		printErrorAndExit(configResult.message);
	}

	const config = configResult.value;

	// parse current version
	const parseResult = parse(config.currentVersion);

	if (!parseResult.ok) {
		printErrorAndExit(parseResult.message);
	}

	if ((options.commit || options.tag) && !isUsable()) {
		printErrorAndExit(
			"Can't use git because current directory is not inside a git repository"
		);
	}

	if (options.commit && isDirty()) {
		printErrorAndExit(
			"Can't commit because the repository has modified files"
		);
	}

	/**
	 * @type {import("./sv.js").Version}
	 */
	let newVersion = parseResult.value;

	/**
	 * List of possible bump keys
	 * @type {Array<"major" | "minor" | "patch">}
	 */
	const versionKeys = ["major", "minor", "patch"];

	for (const key of versionKeys) {
		if (Object.prototype.hasOwnProperty.call(options, key)) {
			newVersion = bump(newVersion, key);
		}
	}

	await makeReplacements(
		config.rules,
		config.currentVersion,
		versionToString(newVersion),
		options.verbose
	);

	if (options.commit) {
		bumpAllFiles();
	}

	if (options.tag) {
		tag(versionToString(newVersion));
	}
}

/**
 * Set the specified version
 *
 * @param {string} version - New version
 * @param {*} [options] - Command line options
 */
async function runSet(version, options) {
	const parseResult = parse(version);

	if (!parseResult.ok) {
		printErrorAndExit(parseResult.message);
	}

	/**
	 * @type {import("./sv.js").Version}
	 */
	const parsedVersion = parseResult.value;

	const configResult = loadConfig(CONF_FILE);

	if (!configResult.ok) {
		printErrorAndExit(configResult.message);
	}

	const config = configResult.value;

	if ((options.commit || options.tag) && !isUsable()) {
		printErrorAndExit(
			"Can't use git because current directory is not inside a git repository"
		);
	}

	if (options.commit && isDirty()) {
		printErrorAndExit(
			"Can't commit because the repository has modified files"
		);
	}

	await makeReplacements(
		config.rules,
		config.currentVersion,
		version,
		options.verbose
	);

	if (options.commit) {
		bumpAllFiles();
	}

	if (options.tag) {
		tag(versionToString(parsedVersion));
	}
}
