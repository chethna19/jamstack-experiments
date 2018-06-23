const fs = require("fs")

function getFiles(dir) {
  return new Promise((res, rej) => {
    fs.readdir(dir, (err, files) => {
      if (err) return rej(err)

      res(dir + "/" + files)
    })
  })
}

function getBinaries(event, context, callback) {
  Promise.all(
    process.env["PATH"].
      split(":").
      map(getFiles)
  ).then((allFiles) => {
    callback(null, {
      "statusCode": 200,
      "headers": {
        "Content-Type": "text/plain; charset=utf8"
      },
      "body": allFiles.
        reduce((flat, files) => flat.concat(files), []).
        join("\n")
    })
  }).catch(callback)
}

exports.handler = getBinaries
