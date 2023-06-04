// @ts-check
import { loadConfig } from "./config.js";
import { bumpWithFiles, isDirty } from "./git.js";
import process from "node:process";
import { bump, parse, versionToString } from "./sv.js";
import replace from "replace-in-file";
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
	.option("-c, --commit", "Commit after bump");

cli.command("bump").action(run);

cli.parse();

/**
 * Returns regexp
 *
 * @param {string} versionTemplate - string with version template
 * @param {string} version - version in a string format
 * @returns {RegExp | undefined} RegExp object
 */
function getReplaceRegexp(versionTemplate, version) {
	if (!versionTemplate || !version) {
		return;
	}

	const source = versionTemplate.replaceAll("{{version}}", version);
	return new RegExp(source, "g");
}

/**
 * Prints replace results.
 *
 * @param {import('replace-in-file').ReplaceResult[]} results
 *
 */
function printReplaceResults(results) {
	if (!results) {
		return;
	}

	for (const replaceResult of results) {
		console.log(
			`File: ${replaceResult.file} changed: ${replaceResult.hasChanged}`
		);
	}
}

/**
 * Main function
 *
 * @param {any} options command-line options
 */
async function run(options) {
	const configResult = loadConfig(CONF_FILE);

	if (!configResult.ok) {
		console.error(configResult.message);
		process.exit(1);
	}

	const config = configResult.value;

	// parse current version
	const parseResult = parse(config.currentVersion);

	if (!parseResult.ok) {
		console.error(parseResult.message);
		process.exit(1);
	}

	if (options.commit && isDirty()) {
		console.error("Can't commit because the repository has modified files");
		process.exit(1);
	}

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

	let files = [CONF_FILE];

	for (const rule of config.rules) {
		const fromRegExp = getReplaceRegexp(
			rule.version,
			config.currentVersion
		);

		if (!fromRegExp) {
			continue;
		}

		/**
		 * @type {import ('replace-in-file').ReplaceInFileConfig}
		 */
		const replaceOptions = {
			files: rule.file,
			from: fromRegExp,
			to: rule.version.replaceAll(
				"{{version}}",
				versionToString(newVersion)
			),
		};

		try {
			const results = await replace.replaceInFile(replaceOptions);

			if (options.verbose) {
				printReplaceResults(results);
			}
		} catch (/** @type {any} **/ error) {
			console.error("Error:", error.message);
			process.exit(1);
		}

		files.push(rule.file);
	}

	if (options.commit) {
		bumpWithFiles(files);
	}
}
