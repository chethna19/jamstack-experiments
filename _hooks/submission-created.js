exports.handler = function submissionCreated(event, context, callback) {
  callback(null, {
    "statusCode": 200,
    "body": JSON.stringify(event, null, 2)
  })
}
