/**
 * `OutlookAPIError` error.
 *
 * @constructor
 * @param {String} [message]
 * @param {String} [code]
 * @api public
 */
function OutlookAPIError(message, code) {
  Error.call(this);
  Error.captureStackTrace(this, arguments.callee);
  this.name = 'OutlookAPIError';
  this.message = message;
  this.code = code;
}

/**
 * Inherit from `Error`.
 */
OutlookAPIError.prototype.__proto__ = Error.prototype;


/**
 * Expose `OutlookAPIError`.
 */
module.exports = OutlookAPIError;
