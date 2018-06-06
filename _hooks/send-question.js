/**
 * Sends a question submitted from HTML question form via AWS SES.
 *
 * 1. Send question function validates and parses request created by
 *    submitting a form.
 * 2. Send email function calls AWS SES API with data from previous
 *    step.
 *
 * If there’s a user error, an HTTP redirect response to HTML question
 * form is generated. Successful invocation also ends with HTTP
 * redirect to HTML question form with `#fail` fragment.
 *
 * Configuration is via environment variable:
 *
 * - QUESTION_FORM_URL: URL to HTML question form
 * - QUESTION_FORM_FROM: email address from which question will be
 *   sent
 * - QUESTION_FORM_TO: email address to which question will be
 *   delivered
 * - QUESTION_FORM_SUBJECT: subject of email with question
 * - QUESTION_FORM_HONEYPOT (optional): honeypot field for bots
 * - MY_AWS_REGION
 * - MY_AWS_ACCESS_KEY_ID
 * - MY_AWS_SECRET_ACCESS_KEY
 */

const AWS = require("aws-sdk")
const querystring = require("querystring")

const ses = new AWS.SES({
  region: process.env["MY_AWS_REGION"],
  credentials: new AWS.Credentials(process.env["MY_AWS_ACCESS_KEY_ID"],
				   process.env["MY_AWS_SECRET_ACCESS_KEY"])
})

/** @typedef {function(Error=,Object=)} */
var NetlifyCallback

/**
 * Returns just type and subtype from Content-Type HTTP header value.
 *
 * @param {string|undefined} headerValue
 * @return {string}
 */
function parseContentType(headerValue) {
  return (headerValue || "").split(/;\s+/, 2)[0]
}

/**
 * Returns name encoded using syntax of encoded-words from MIME.
 *
 * This is a very lazy developer’s approach defaulting to BASE64
 * without trying anything else and shouldn’t be considered
 * production-ready. MIME suggests what to use when, get familiar with
 * or use some nice library.
 *
 * @param {string} name
 * @return {string}
 * @see {@link https://tools.ietf.org/html/rfc2047 RFC 2047}
 */
function mimeEncode(name) {
  return (
    "=?utf-8?b?" +
    Buffer.from(name).toString('base64') +
    "?="
  )
}

/**
 * Calls the callback so that it redirects to question form URL.
 *
 * Optional code can be specified. This code is set as a fragment part
 * of the redirect location.
 *
 * @param {!NetlifyCallback} callback
 * @param {string=} code
 */
function redir(callback, code) {
  callback(null, {
    "statusCode": 303,
    "headers": {
      "Location": process.env["QUESTION_FORM_URL"] +
	(code ? `#${code}` : "")
    }
  })
}

/**
 * Parses and validates event triggered by question form submission.
 *
 * The function ends with a call to {@link sendEmail}.
 *
 * @param {!Object} event
 * @param {!Object} context
 * @param {!NetlifyCallback} callback
 */
function sendQuestion(event, context, callback) {
  if (event["httpMethod"] !== "POST") {
    return callback(
      new Error(`Unexpected HTTP method "${event["httpMethod"]}"`)
    )
  }
  if (parseContentType(event["headers"]["content-type"]) !==
      "application/x-www-form-urlencoded") {
    return callback(
      new Error(`Unexpected content type "${event["headers"]["content-type"]}"`)
    )
  }

  const params = querystring.parse(event["body"])

  if (process.env["QUESTION_FORM_HONEYPOT"] &&
      params[process.env["QUESTION_FORM_HONEYPOT"]]) {
    console.info("Bot trapped in honeypot")
    return callback()
  }

  const errs = []
  if (!params["email"]) errs.push("no-email")
  if (!params["question"]) errs.push("no-question")
  if (errs.length > 0) return redir(callback, errs.join(","))

  sendEmail(
    params["name"] ?
      `${mimeEncode(params["name"])} <${params["email"]}>` :
      params["email"],
    params["question"],
    callback
  )
}

/**
 * Sends email via AWS SES API.
 *
 * @param {string} replyTo
 * @param {string} text
 * @param {!NetlifyCallback} callback
 */
function sendEmail(replyTo, text, callback) {
  ses.sendEmail({
    Source: process.env["QUESTION_FORM_FROM"],
    Destination: {
      ToAddresses: [
	process.env["QUESTION_FORM_TO"]
      ]
    },
    ReplyToAddresses: [
      replyTo
    ],
    Message: {
      Subject: {
	Charset: "UTF-8",
	Data: process.env["QUESTION_FORM_SUBJECT"]
      },
      Body: {
	Text: {
	  Charset: "UTF-8",
	  Data: text
	}
      }
    }
  }, (err, data) => {
    if (err) {
      console.error("Error while sending email via AWS SES:", err)
      redir(callback, "fail")
    }

    redir(callback, "sent")
  })
}

exports.handler = sendQuestion
