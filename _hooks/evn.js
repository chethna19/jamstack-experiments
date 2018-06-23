const fs = require("fs")

function getFiles(dir) {
  return new Promise((res, rej) => {
    fs.readdir(dir, (err, files) => {
      if (err) return rej(err)

      res(files.map(f => dir + f))
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
      "body": "" +
        "Environment variables:\n" +
          Object.entries(process.env).
            map((name, value) => name + " = " + value).
            join("\n") +
        "\n" +
        "Binaries:\n" +
          allFiles.
            reduce((flat, files) => flat.concat(files), []).
            join("\n") +
          "\n"
    })
  }).catch(callback)
}

exports.handler = getBinaries
