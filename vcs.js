//@ts-check

import {
	bumpAllFiles as gitBump,
	tag as gitTag,
	isUsable as gitIsUsable,
	isDirty as gitIsDirty,
} from "./git.js";

import {
	bumpAllFiles as hgBump,
	tag as hgTag,
	isUsable as hgIsUsable,
	isDirty as hgIsDirty,
} from "./hg.js";

/**
 * @typedef {Object} Vcs
 * @property {(tagName: string) => void} tag
 * @property {() => void} commit
 * @property {() => boolean} isUsable
 * @property {() => boolean} isDirty
 */

/**
 * @typedef {Object} VcsList
 * @property {Vcs} git
 * @property {Vcs} hg
 */

/**
 * Returns functions for working with VSC
 *
 * @returns {Vcs | undefined}
 */
export function useVCS() {
	//prettier-ignore
	const vcsName = gitIsUsable() ? "git" : (hgIsUsable() ? "hg" : "");

	return vcsName === ""
		? undefined
		: {
				/** @type {Vcs} */
				git: {
					tag(t) {
						gitTag(t);
					},
					commit() {
						gitBump();
					},
					isUsable() {
						return gitIsUsable();
					},
					isDirty() {
						return gitIsDirty();
					},
				},

				/** @type {Vcs} */
				hg: {
					tag(t) {
						hgTag(t);
					},
					commit() {
						hgBump();
					},
					isUsable() {
						return hgIsUsable();
					},
					isDirty() {
						return hgIsDirty();
					},
				},
		  }[vcsName];
}
