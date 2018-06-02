const querystring = require('querystring')

exports.handler = function simpleFn(event, context, callback) {
  console.log("Event: %j", event);
  console.log("Context: %j", context);

  callback(null, {
    "statusCode": 200,
    "headers": {
      "Content-Type": "application/json"
    },
    "body": JSON.stringify(querystring.parse(event["body"]), null, 2)
  })
}
