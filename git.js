//@ts-check

import {runCommand, runAndGetOutput} from "./cmd.js"

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
    if (trimmedLine[0] === "M") {
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
