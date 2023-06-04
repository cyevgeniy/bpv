//@ts-check

/**
 * @typedef {Object} Result
 * @property {boolean} ok - whether result succeed or not
 * @property {*} value - result
 * @property {string} message - message.
 */

/**
 * Returns non-succeed result with specified message.
 *
 * @param {string} message - error message
 * @returns {Result}
 */
export function notOk(message) {
    return {
        ok: false,
        value: undefined,
        message:
            typeof message === "function" || typeof message === "object"
                ? ""
                : message ?? "",
    };
}

/**
 * Returns succeed result.
 *
 * @param {*} value - returned result
 * @param {string} [message]
 */
export function ok(value, message = "") {
    return {
        ok: true,
        value: value,
        message:
            typeof message === "function" || typeof message === "object"
                ? ""
                : message ?? "",
    };
}
