/**
 * Parse profile.
 *
 * The Outlook API response is transformed to the Portable Contacts format, defines for PassportJS.
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
  profile.id = json.Id;
  if (json.EmailAddress) {
    profile.emails = [ {
      value: json.EmailAddress, type: "home"
    }];
  }
  profile.displayName = json.DisplayName;
  profile.alias = json.Alias;
  profile.mailboxGuid = json.MailboxGuid;

  return profile;
};
