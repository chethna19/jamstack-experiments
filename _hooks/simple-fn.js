exports.handler = function simpleFn(event, context, callback) {
  callback(null, {
    "statusCode": 200,
    "body": JSON.stringify(event, null, 2)
  })
}
