exports.handler = function simpleFn(event, context, callback) {
  console.log("Event: %j", event);
  console.log("Context: %j", context);
  callback(null, {
    "statusCode": 200
  })
}
