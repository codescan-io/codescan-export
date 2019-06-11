const {expect, test} = require('@oclif/test')
const cmd = require('..')

describe('codescan-export', () => {
  test
  .stdout()
  .do(() => cmd.run([
    '-t', 'key',
    '-s', 'http://localhost',
    'aaa',
    'test.codescan.io-test',
    '-f', '-'
  ]))
  .it('outputs header', ctx => {
    expect(ctx.stdout).to.contain('Creation Date,Update Date,Rule,Status,Severity,File,Line,Message,IssueType,Author,Tags,From Hotspot,Language,Repository')
    expect(ctx.stderr).to.contain('StatusCodeError: 401 - undefined')
  })
})
