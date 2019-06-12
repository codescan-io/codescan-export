codescan-export
===============

Export CodeScan issues from the command line

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/codescan-export.svg)](https://npmjs.org/package/codescan-export)
[![Downloads/week](https://img.shields.io/npm/dw/codescan-export.svg)](https://npmjs.org/package/codescan-export)
[![License](https://img.shields.io/npm/l/codescan-export.svg)](https://github.com/https://github.com/villagechief/codescan-export/https://github.com/villagechief/codescan-export/blob/master/package.json)

CSV export is available in CodeScan Cloud with a command line tool available through npm.

You can find the tool here on GitHub.

*Prerequisites*
You will need:

A CodeScan Cloud account.
npm installed - Installation Instructions
Installation
There are 2 ways to install the CodeScan Export tool.

Install from Git
Clone the repository here on GitHub.
Navigate to the folder in your command line.
Type npm install -g
Once the installation is finished, type codescan-export -v to check the tool is available.
Install from npm
In your command line, type npm install -g codescan-export
Once the installation is finished, type codescan-export -v to check the tool is available.
Usage
It is recommended that you create an environment variable for your CodeScan Cloud token to avoid using it in plaintext for each call. Name the variable CODESCAN_TOKEN and assign it the token created in your Account Security Settings.

With the token set as an environment variable you can run the tool with the following command.  Click on the links for information on how to find the keys.

codescan-export [ORGANISATION KEY] [PROJECT KEY]

Without the token set as an environment variable you can run the tool with the following command.  Click on the links for information on how to find the keys.

CODESCAN_TOKEN=[TOKEN] codescan-export [ORGANISATION KEY] [PROJECT KEY]

Type codescan-export -h to see the detailed usage for this tool including how to filter the issues.
