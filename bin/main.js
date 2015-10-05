#!/usr/bin/env node

/// *** get args
var _source = process.argv[2];
var _output = process.argv[3];
var _verbose = process.argv.indexOf('-v') != -1;
var _options, _ignore;

/// check args
if (!_source || !_output) {
    console.error('missing params: source and output dirs');
    console.error('use: markta /path/to/source /path/to/output [-v]');
    process.end(-1);
}

/// strip if last char in paths is /
if (_source[_source.length - 1] == '/')
    _source = _source.substr(0, _source.length - 1);
if (_output[_output.length - 1] == '/')
    _output = _output.substr(0, _output.length - 1);

var fs = require('fs');
var path = require('path');
var marked = require('marked');
var fsextra = require('fs-extra');
var dir = require('recursive-readdir');
var cjson = require('cjson');
var ignore = require('ignore');

/// *** define const
var HTML_HEADER = '<!DOCTYPE html> \n\
<html> \n\
<head> \n\
    <title>$title</title> \n\
    <link rel="stylesheet" href="$path/css/md.css"> \n\
    <style>\n\
        .markdown-body {\n\
            min-width: 200px;\n\
            max-width: 790px;\n\
            margin: 0 auto;\n\
            padding: 30px;\n\
        }\n\
    </style>\n\
    <meta http-equiv="Content-Type" content="text/html;charset=utf-8" />\n\
</head>\n\
<body>\n\
<article class="markdown-body">\n\
';
var HTML_FOOTER = '\n\
</article>\n\
</body>\n\
</html>';
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

/**
 * if verbose mode is enabled, print log
 * @params {...}
 */
var log = function () {
    if (!_verbose)
        return;
    var _args = Array.prototype.slice.call(arguments);
    console.log.apply(console, _args);
};

/**
 * create or empty output dir
 * @param {function} callback
 */
var init = function (callback) {
    fsextra.remove(_output, function () {
        fsextra.mkdirp(_output, function () {
            /// copy css
            fsextra.copy(__dirname + '/../node_modules/github-markdown-css/github-markdown.css', _output + '/css/md.css', function () {
                // load options, if file exists
                var _file = _source + '/.markta.json';
                fs.exists(_file, function (exists) {
                    if (exists) {
                        log('json options found');
                        _options = cjson.load(_file);
                        _ignore = ignore({ ignore: _options.ignore.split(',') });
                    } else {
                        _options = {
                            mode: 'static'
                        };
                    }
                    callback();
                });
            });
        });
    });
};

/**
 * mark: copy if not md file or parse and generate it
 * @param {string} source path source file
 */
var mark = function (source) {
    /// build target path
    var _relative = path.dirname(source).replace(_source, '');
    var _path = _output + (_relative != '' ? _relative : '');

    /// check ignore and skip if needed
    //console.log('test', _relative + '/' + path.basename(source), _ignore.filter([ _relative + '/' + path.basename(source) ]));
    if (_ignore && _ignore.filter([ _relative + '/' + path.basename(source) ]).length < 1)
        return;
    //console.log('ok');

    fsextra.mkdirpSync(_path);
    /// check file extension
    /// if not .md, copy
    if (path.extname(source) != '.md') {
        var _target = _path + '/' + path.basename(source);
        log('copy', source, 'to', _target);
        fsextra.copySync(source, _target);
        return;
    }

    log('parsing ', source, '...');
    fs.readFile(source, 'utf8', function (err, content) {
        if (err) {
            log('no content for', source, '.');
        } else {
            /// set file name
            var _name = path.basename(source, '.md');
            /*
             if (_name.toLowerCase() == 'readme')
             _name = 'index';
             */
            var _target = _path + '/' + _name + '.html';
            /// transform to html and adjust it
            var _html = adjust({
                header: HTML_HEADER,
                content: marked(content),
                footer: HTML_FOOTER
            }, {
                name: _name,
                path: _path
            });
            log('write', _target, '...');
            fs.writeFile(_target, _html, function () {
                log('wrote', _target, 'from', source);
            });
        }
    });
};

/**
 * adust final html
 * @param {object} html
 * @param {object} data
 * @returns {string}
 */
var adjust = function (html, data) {
    /// title
    var _html = html.header.replace('$title', data.name);
    if (_options.mode == 'static') {
        _html = _html.replace('$path', data.path);
        /// get inner links 
        _html += html.content.replace(/\href="(\.[\d\w\s\.\/\-\_]+\.md)"/img, function (match, link) {
            return 'href="' + data.path + link.substr(1).replace('.md', '.html') + '"';
        });
    } else {
        // web mode
        _html = _html.replace('$path', '');
        /// get inner links 
        _html += html.content.replace(/\href="(\.[\d\w\s\.\/\-\_]+\.md)"/img, function (match, link) {
            return 'href="' + link.substr(1).replace('.md', '.html') + '"';
        });
    }

    return _html + html.footer;
};

/**
 * main
 */
var main = function () {
    init(function () {
        /// list source files
        dir(_source, function (err, files) {
            if (err) {
                console.log('error reading dir', _source, err);
                proccess.end(-1);
            }
            for (var i in files) {
                mark(files[i]);
            }
        });
    });
}();
