//@ts-check

import {runCommand, runAndGetOutput} from "./cmd.js"

/**
 * Returns true if current repository has modified files.
 * Also returns true if any error has occured during command
 * execution.
 *
 * @returns boolean
 */
export function isDirty() {
	const statusOutput = runAndGetOutput("hg", ["status", "-umard"]);

	// Return true on any error
	if (statusOutput === undefined) {
		return true;
	}

	// TODO: Fix that on Windows - probably it will be "\r\n"
	const files = statusOutput.split("\n");

	for (const line of files) {
		const trimmedLine = line.trim();
		if (trimmedLine[0] === "M") {
			return true;
		}
	}

	return false;
}
/**
 * Commits changes in all modified files.
 *
 * @param {string} [message] - Commit message.
 */
export function bumpAllFiles(message = "Bump version") {
	runCommand("hg", ["ci", "-m", message]);
}

/**
 * Create tag in a mercurial repository
 *
 * @param {string} tagName Tag
 */
export function tag(tagName) {
	if (!tagName) {
		return;
	}
	runCommand("hg", [
		"tag",
		tagName,
		"--message",
		tagName
	]);
}

/**
 * Checks if current directory is inside a mercurial repository
 *
 * @returns {boolean}
 */
export function isUsable() {
	const result = runCommand("hg", ["root"]);

	return result.status == 0;
}
