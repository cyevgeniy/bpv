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
 * @typedef {Object} LineDiff
 * @property {string} before A line before change
 * @property {string} after A line after change
 * @property {number} line Line number
 */ 

/**
 * Returns result of replacement in a file
 *
 * @param {Array<string>} lines - File's lines 
 * @param {ReplaceOption} replaceOption - Replace option
 * @returns {Promise<Array<LineDiff>>} List of changes in a file
 */
export async function getFileReplace(lines, replaceOption) {
  /**
   * @type {Array<LineDiff>}
   */
  let result = []

  for (const [lineNumber, line] of lines.entries()) {
		const match = replaceOption.from.test(line);

    if (match) {
      result.push({
        before: line,
        after: line.replaceAll(replaceOption.from, replaceOption.to),
        line: lineNumber + 1
      })
    }
  }

  return result;

}

/**
 * @typedef {Object} ReplaceResult
 * @property {string} file - File name
 * @property {Array<LineDiff>} diffs - Replace diff 
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
 * @param {boolean} dryRun Return only replace result, but don't change
 * change file
 * @return {Promise<Result>}
 */
export async function replaceInFile(replaceOption, dryRun=false) {
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

  const lines = fileContent.split(/\r?\n/);
  const usesR = /\r\n/.test(fileContent);

  const lineDiffs = await getFileReplace(lines, replaceOption)


	if (!dryRun && lineDiffs.length > 0) {
		for (const diff of lineDiffs) {
			lines[diff.line - 1] = diff.after
		}
    
		try {
			await writeFile(replaceOption.file, lines.join(usesR ? "\r\n" : "\n"));
		} catch {
			return notOk("Can't write to the file");
		}
	}

	return ok({file: replaceOption.file, diffs: lineDiffs});
}
