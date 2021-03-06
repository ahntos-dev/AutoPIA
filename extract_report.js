// This is for extracting the chapter report word document
// and populating data for use with the PIA system

module.exports = {
    extract: function(dir) {
        var mammoth = require("mammoth");
        var path = require("path");
        var fs = require('fs');

        var filePath = path.join(__dirname, dir);

    //Extract the text to a JSON file
        mammoth.extractRawText({path: filePath})
            .then(function (result) {
                var text = result
                    .value // The raw text
                    .replace(/^(?=\n)$|^\s*|\s*$|\n\n+/gm, ""); // Remove white space

                fs.writeFile('blank_report.txt', text, function (err) {
                    if (err) console.log('error', err);
                });
            })
            .done();
    }
}