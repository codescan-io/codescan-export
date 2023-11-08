codescan-export
===============

CSV export is available in CodeScan Cloud with this command line tool available through npm.

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/codescan-export.svg)](https://npmjs.org/package/codescan-export)
[![Downloads/week](https://img.shields.io/npm/dw/codescan-export.svg)](https://npmjs.org/package/codescan-export)
[![License](https://img.shields.io/npm/l/codescan-export.svg)](https://github.com/https://github.com/villagechief/codescan-export/https://github.com/villagechief/codescan-export/blob/master/package.json)

Prerequisites
========
You will need:

* A CodeScan Cloud account.
* npm installed - [Installation Instructions](https://www.npmjs.com/get-npm)

Installation
=========

There are 2 ways to install the CodeScan Export tool.

### Install from Git
* Clone the repository.
* Navigate to the folder in your command line.
* Type npm install -g
* Once the installation is finished, type codescan-export -v to check the tool is available.
### Install from npm
* In your command line, type npm install -g codescan-export
* Once the installation is finished, type codescan-export -v to check the tool is available.
# Usage
It is recommended that you create an environment variable for your CodeScan Cloud token to avoid using it in plaintext for each call. Name the variable `CODESCAN_TOKEN` and assign it the token created in your [Account Security Settings](https://app.codescan.io/account/security/).

With the token set as an environment variable you can run the tool with the following command. 

`codescan-export [ORGANISATION KEY] [PROJECT KEY] -f output.csv`

[How to find your Organisation Key](https://docs.codescan.io/hc/en-us/articles/360020037992-How-to-find-an-Organization-Key-in-CodeScan-Cloud)

[How to find your Project Key](https://docs.codescan.io/hc/en-us/articles/360020038192-How-to-find-a-Project-Key-in-CodeScan)

Without the token set as an environment variable you can run the tool with the following command. Click on the links for information on how to find the keys.

`CODESCAN_TOKEN=[TOKEN] codescan-export [ORGANISATION KEY] [PROJECT KEY] -f output.csv`

[Generate your Security Token](https://app.codescan.io/account/security/)

[How to find your Organisation Key](https://docs.codescan.io/hc/en-us/articles/360020037992-How-to-find-an-Organization-Key-in-CodeScan-Cloud)

[How to find your Project Key](https://docs.codescan.io/hc/en-us/articles/360020038192-How-to-find-a-Project-Key-in-CodeScan)


Type `codescan-export -h` to see the detailed usage for this tool including how to filter the issues.
