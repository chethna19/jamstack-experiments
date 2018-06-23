function getBinaries(event, context, callback) {
  console.log("PATH =", process.env["PATH"])

  callback()
}

exports.handler = getBinaries
