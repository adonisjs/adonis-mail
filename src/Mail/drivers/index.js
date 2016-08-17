'use strict'

/**
 * adonis-framework
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

module.exports = {
  smtp: require('./SMTP'),
  ses: require('./SES'),
  mandrill: require('./Mandrill'),
  mailgun: require('./MailGun'),
  log: require('./Log')
}
