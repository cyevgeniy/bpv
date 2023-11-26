//@ts-check

import { readFileSync } from "node:fs";
import { ok, notOk } from "./result.js";

/**
 * @typedef Rule
 * @property {string} file
 * @property {string} version
 */

/**
 * @typedef Config
 * @property {string} currentVersion
 * @property {Rule[]} rules
 * @property {string} [commitMessage] The commit message that will be used after version increment
 */

/**
 * Checks whether an specified js object is a valid config or not.
 *
 * @param {any} object - object being validated
 * @returns {boolean}
 */
export function isValid(object) {
  if (
    !Object.prototype.hasOwnProperty.call(object, "currentVersion") ||
      !(typeof object.currentVersion == "string") ||
      !Object.prototype.hasOwnProperty.call(object, "rules") ||
      !Array.isArray(object.rules)
  ) {
    return false;
  }

  for (const rule of object.rules) {
    if (
      !Object.prototype.hasOwnProperty.call(rule, "file") ||
	!(typeof rule.file == "string") ||
	!Object.prototype.hasOwnProperty.call(rule, "version") ||
	!(typeof rule.version == "string")
    ) {
      return false;
    }
  }

  return true;
}

/**
 * Returns context-specific string.
 *
 * @param {string} message Message to log
 * @returns {string}
 */
function generateMessage(message) {
  return "[Config loading]: " + message;
}

/**
 * @typedef {import('./result.js').Result} Result
 */

/**
 * Loads specified config file.
 *
 * @param {string} fname config file name
 * @returns {Result} result with parsed config
 *
 */
export function loadConfig(fname) {
  let data;

  try {
    data = readFileSync(fname, "utf8");
  } catch {
    return notOk(generateMessage(
      "Can't load a config file.\nMake sure that " +  fname + " exists."));
  }

  let config;

  try {
    config = JSON.parse(data);
  } catch (/** @type {any}*/ error) {
    return notOk(generateMessage(error.message));
  }

  if (!isValid(config)) {
    return notOk(generateMessage("Config is not valid"));
  }

  return ok(config);
}
