import { spawnSync } from "node:child_process";

/**
 * Runs specified command and returns
 * @param {string} command The command to run
 * @param {string[]} [arguments_] List of string arguments_
 * @param {import("node:child_process").SpawnSyncOptionsWithStringEncoding | undefined} [options] Options
 * @returns {import("node:child_process").SpawnSyncReturns<Buffer | string | undefined>}
 */
export function runCommand(command, arguments_, options) {
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
export function runAndGetOutput(command, arguments_) {
	const result = runCommand(command, arguments_, { encoding: "utf8" });

	return result.status == 0 ? String(result.stdout) : undefined;
}