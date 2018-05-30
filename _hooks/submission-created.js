exports.handler = function submissionCreated(event, context, callback) {
  const submission = JSON.parse(event["body"])
  console.log("Submission:", submission)
}
