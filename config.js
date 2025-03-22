//@ts-check

import { readFileSync, accessSync, constants } from "node:fs";
import { ok, notOk } from "./result.js";

const {
  R_OK
} = constants

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
 * Returns the first available file from the list.
 * If there're no files available, throws an error.
 * 
 * @param {string[]} files An array of filenames 
 * @returns {string} The first available filename
 */
function getFirstFile(files) {
  for (let file of files) {
    try {
      accessSync(file, R_OK)
      return file
    }
    catch {
      //  
    }
  }

  throw new Error('No config files detected')
}

/**
 * @typedef {import('./result.js').Result} Result
 */

/**
 * Loads specified config file.
 *
 * @param {string[]} fnames config file name
 * @returns {Result} result with parsed config
 *
 */
export function loadConfig(fnames) {
  let fname;

  try {
    fname = getFirstFile(fnames);
  }
  catch (/** @type {unknown} **/error) {
    return error instanceof Error
      ? notOk(generateMessage(error.message))
      : notOk(generateMessage('Panic! We are unable to find the config file.'))
  }

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
