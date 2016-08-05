/**
 * Parse profile.
 *
 * @param {Object|String} json
 * @return {Object}
 * @api private
 */
exports.parse = function(json) {
  if ('string' == typeof json) {
    json = JSON.parse(json);
  }
  
  var profile = {};
  profile.Id = json.Id;
  profile.EmailAddress = json.EmailAddress;
  profile.DisplayName = json.DisplayName;
  profile.Alias = json.Alias;
  profile.MailboxGuid = json.MailboxGuid;

  return profile;
};
