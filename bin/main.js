#!/usr/bin/env node

/// @todo 
/// skip dirs or file extension
/// verbose
/// render link .md -> .html
/// $out, $title

var _source = process.argv[2];
var _out = process.argv[3];

if (!_source || !_out) {
    console.error('missing params: source and output dirs');
    console.error('use: markta /path/to/source /path/to/output ');
    process.end(-1);
}

var fs = require('fs');
var path = require('path');
var marked = require('marked');
var fsextra = require('fs-extra');
var dir = require('recursive-readdir');

var verbose = function() {
    var _args = Array.prototype.slice.call(arguments);
    console.log.apply(console, _args);
};

const HTML_HEADER = `<!DOCTYPE html>
<html>
<head>
    <title>$title</title>

    <link rel="stylesheet" href="$out/css/md.css">
    <style>
        .markdown-body {
            min-width: 200px;
            max-width: 790px;
            margin: 0 auto;
            padding: 30px;
        }
    </style>

    <meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
</head>
<body>
<article class="markdown-body">
`;
const HTML_FOOTER = `
</article>
</body>
</html>`;

/*
 marked.setOptions({
 renderer: new marked.Renderer(),
 gfm: true,
 tables: true,
 breaks: false,
 pedantic: false,
 sanitize: true,
 smartLists: true,
 smartypants: false
 });
 */

/// create or empty output dir
fsextra.removeSync(_out);
fsextra.mkdirpSync(_out);
/// copy css
fsextra.copySync(__dirname + '/../node_modules/github-markdown-css/github-markdown.css', _out + '/css/md.css');

/// list source files
dir(_source, function (err, files) {
    for (var i in files) {
        mark(files[i]);
    }
    //verbose(files);
});

/**
 * mark: copy if not md file or parse and generate it
 * @param {string} source path source file
 */
var mark = function (source) {
    /// check skip
    if (source.indexOf('/.git') != -1)
        return;

    /// build target path
    var _relative = path.dirname(source).replace(_source, '');
    var _path = _out + (_relative != '' ? _relative : '');
    fsextra.mkdirpSync(_path);

    /// check file extension
    /// if not .md, copy
    if (path.extname(source) != '.md') {
        var _target = _path + '/' + path.basename(source);
        verbose('copy', source, 'to', _target);
        fsextra.copySync(source, _target);
        return;
    }

    verbose('parse', source);
    fs.readFile(source, 'utf8', function (err, content) {
        if (err) {
            verbose('no content for', source);
        } else {
            var _target = _path + '/' + path.basename(source, '.md') + '.html';
            verbose('write', _target);
            fs.writeFile(_target, HTML_HEADER + marked(content) + HTML_FOOTER, function () {
                verbose('marked', source, 'to', _target);
            });
        }
    });

};