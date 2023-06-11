//@ts-check

import { spawnSync } from "node:child_process";

/**
 * Runs specified command and returns
 * @param {string} command The command to run
 * @param {string[]} [arguments_] List of string arguments_
 * @param {import("node:child_process").SpawnSyncOptionsWithStringEncoding | undefined} [options] Options
 * @returns {import("node:child_process").SpawnSyncReturns<Buffer | string | undefined>}
 */
function runCommand(command, arguments_, options) {
	const result = spawnSync(command, arguments_, options);

	return result;
}

/**
 * Runs specified command and returns its output.
 * If any error occured, returns undefined
 *
 * @param {string} command The command to run
 * @param {string[]} arguments_ List of string arguments_
 * @returns {string | undefined}
 */
function runAndGetOutput(command, arguments_) {
	const result = runCommand(command, arguments_, { encoding: "utf8" });

	return result.status == 0 ? String(result.stdout) : undefined;
}

/**
 * Returns true if current git repository has modified files.
 * Also returns true if any error has occured during git command
 * execution.
 *
 * @returns boolean
 */
export function isDirty() {
	const statusOutput = runAndGetOutput("git", ["status", "-s"]);

	// Return true on any error
	if (statusOutput === undefined) {
		return true;
	}

	// TODO: Fix that on Windows - probably it will be "\r\n"
	const files = statusOutput.split("\n");

	for (const line of files) {
		const trimmedLine = line.trim();
		if (trimmedLine.length > 0 && trimmedLine[0] == "M") {
			return true;
		}
	}

	return false;
}

/**
 * Adds all indexed files to the next commit
 */
function add() {
	return runCommand("git", ["add", "-u"]);
}

/**
 * Performs commit
 *
 * @param {string} message - Commit message
 */
function commit(message) {
	return runCommand("git", ["commit", "-m", message]);
}

/**
 * Commits changes in all modified files.
 *
 * @param {string} [message] - Commit message.
 */
export function bumpAllFiles(message = "Bump version") {
	const addResult = add();

	if (addResult.status != 0) {
		return;
	}

	commit(message);
}

/**
 * Create tag in a git repository
 *
 * @param {string} tagName Tag
 */
export function tag(tagName) {
	if (!tagName) {
		return;
	}
	runCommand("git", [
		"tag",
		"--annotate",
		tagName,
		"-m",
		tagName,
	]);
}

/**
 * Checks if current directory is inside a git repository
 *
 * @returns {boolean}
 */
export function isUsable() {
	const result = runCommand("git", ["rev-parse"]);

	return result.status == 0;
}
