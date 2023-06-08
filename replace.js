// @ts-check
import { ok, notOk } from "./result.js";
import { stat, readFile, writeFile } from "node:fs/promises";

/**
 * @typedef {Object} ReplaceOption
 * @property {string} file - File name
 * @property {RegExp} from - Regular expression to find a match for replace
 * @property {string} to - Replace string
 */

/**
 * @typedef {Object} ReplaceResult
 * @property {string} file - File name
 * @property {boolean} hasChanged - Either file has been changed or not
 */

/**
 * Returns false if specified file doesn't exist.
 *
 * @param {string} file Path to the file
 * @returns {Promise<boolean>}
 */
async function isFileExists(file) {
	let result = true;
	try {
		const statResult = await stat(file);

		result = statResult.isFile();
	} catch {
		result = false;
	}

	return result;
}


/**
 * @typedef {import('./result.js').Result} Result
 */

/**
 * Replace content in one file.
 *
 * @param {ReplaceOption} replaceOption
 * @return {Promise<Result>}
 */
export async function replaceInFile(replaceOption) {
	// Don't use `!replaceOption.to` form, because empty string
	// is a valid value for replacement
	if (!replaceOption.file || !replaceOption.from || replaceOption.to == undefined) {
		return notOk("Invalid replace option")
	}


	// Check if file exists
	if (!(await isFileExists(replaceOption.file))) {
		return notOk("The file doesn't exist")
	}

	let fileContent;

	try {
		fileContent = await readFile(replaceOption.file, { encoding: "utf8" });
	} catch {
		return notOk("Can't read file's content");
	}

	// Replace all matches in the file
	let newFileContent;
	let matches = false;

	try {
		newFileContent = fileContent.replaceAll(
			replaceOption.from,
			replaceOption.to
		);

		matches = replaceOption.from.test(fileContent);
	} catch {
		return notOk("Can't replace file content")
	}

	// Write the whole file
	try {
		await writeFile(replaceOption.file, newFileContent);
	} catch {
		return notOk("Can't write to the file");
	}

	return ok({file: replaceOption.file, hasChanged: matches});
}
