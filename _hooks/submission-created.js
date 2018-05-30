const AWS = require('aws-sdk')
const s3 = new AWS.S3()

exports.handler = function(event, context, callback) {
  s3.putObject({
    Bucket: process.env['TEST_BUCKET'],
    Key: 'event.json',
    Body: JSON.stringify(event, null, 2),
    ContentType: 'application/json'
  }, callback)
}
