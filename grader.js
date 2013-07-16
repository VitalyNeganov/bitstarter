#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');

var rest = require('restler');
var program = require('commander');
var cheerio = require('cheerio');

var html_file  = "index.html";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1);
    }
    return instr;
};

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var cheerioHtmlData = function(data) {
    return cheerio.load(data);
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {
    $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    console.log(JSON.stringify(out, null, 4));
};

var checkHtmlUrl = function(htmlUrl, checksfile) {
    rest.get(htmlUrl).on('complete', function(data) {
	$ = cheerioHtmlData(data);
	var checks = loadChecks(checksfile).sort();
	var out = {};
	for (var ii in checks) {
	    var present = $(checks[ii]).length > 0;
	    out[checks[ii]] = present;
	}
	console.log(JSON.stringify(out, null, 4));
    });
};

var clone = function(fn) {
   return fn.bind({});
};

if(require.main == module) {
    program
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), 'checks.json')
        .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), html_file)
        .option('-u, --url <url_for_html_file>', 'URL for index.html')
        .parse(process.argv);
    if (program.url == null) checkHtmlFile(program.file, program.checks);
    else                     checkHtmlUrl(program.url, program.checks);
} else {
    exports.checkHtmlFile = checkHtmlFile;
}
