# mark-them-all

[![NPM Version](http://img.shields.io/npm/v/mark-them-all.svg?style=flat)](https://www.npmjs.org/package/mark-them-all)
[![NPM Downloads](https://img.shields.io/npm/dm/mark-them-all.svg?style=flat)](https://www.npmjs.org/package/mark-them-all)

[![PayPayl donate button](https://img.shields.io/badge/paypal-donate-yellow.svg)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=MRV4AM2CA9F78 "Donate using Paypal")


## Npm Installation

Install globally prefered

```
$ npm i -g mark-them-all
```

## Run

```
$ markta path/to/source path/to/output [-v]
```

#### Arguments

- path/to/source: the dir with .md files
- path/to/output : target dir: will create or replace it; also will add a css dir
- -v enable verbose mode  
To add options: place a .markta.json file into path/to/source

### Options

.markta.json example

``` javascript
{
  "title": "My great documentation",
  "mode": "static",
  "ignore": ".*,.git/"
}
```

- *title*: the title for every page, if missing will be used file name
- *mode*: **static** or **web** (default **static**)
    - if **static**, the link paths will be absolute to filesystem
    - if **web**, the path link paths will be relative from output dir
- *ignore*: use git ignore syntax, comma separated
    - referer to [ignore](https://github.com/kaelzhang/node-ignore) for more datils


##### Mode static or web

Will be replace references to .md files in .html generated files in link
Example
```` markdown
[inner link](./path/to/document.md)
````

will be in ***web*** mode
```` html
<a href="/path/to/document.html">inner link</a>
````
will be in ***static*** mode, pretending output path is /var/data/doc
```` html
<a href="/var/data/doc/path/to/document.html">inner link</a>
````

## License

The MIT License (MIT)

Copyright (c) 2015 Simone Sanfratello

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
