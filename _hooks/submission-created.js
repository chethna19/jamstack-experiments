exports.handler = function(event, context, callback) {
  const AWS = require('aws-sdk')
  const s3 = new AWS.S3()

  s3.putObject({
    Bucket: process.env['TEST_BUCKET'],
    Key: 'event.json',
    Body: JSON.stringify(event, null, 2),
    ContentType: 'application/json'
  }, callback)
}
