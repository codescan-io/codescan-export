'use strict'
const {Command, flags} = require('@oclif/command');
const {cli} = require('cli-ux');
const rp = require('request-promise');
const fs = require('fs');

class CodescanExportCommand extends Command {
  async getJson(path, options){
    options = options || {
    };
    options.json = options.json || true;
    options.rejectUnauthorized = this.verifySslCa;
    options.headers = options.headers || {};
    options['uri'] = this.server + path;
    options['headers']["Authorization"] = "Basic " + new Buffer(this.token + ":").toString("base64");
    return await rp(options);
  }

  async getToken(){
    return await cli.prompt('Enter security token');
  }
  async getOutputFile(){
    return await cli.prompt('Enter file to save output to. Use - to stdout');
  }

  async getOrganizationKey(){
    let ret = await this.getJson('/api/organizations/search?member=true');
    let valid = false;
    let organizationKey;
    while ( !valid ){
      this.log("")
      this.log("Choose your organizationKey");
      ret['organizations'].forEach((v)=>{
        this.log(v.key + ": " + v.name);
      });

      organizationKey = await cli.prompt('Choose organizationKey');
      ret['organizations'].forEach((v)=>{
        if ( v.key == organizationKey ){
          valid = true;
        }
      });
    }
    return organizationKey;

  }

  async getProjectKey(){
    let ret = await this.getJson('/api/components/search', {qs: {qualifiers: 'TRK', organization: this.organizationKey}});
    let valid = false;
    let projectKey;
    while ( !valid ){
      this.log("")
      this.log("Choose your projectKey");
      ret['components'].forEach((v)=>{
        this.log(v.key + ": " + v.name);
      });

      projectKey = await cli.prompt('Choose projectKey');
      ret['components'].forEach((v)=>{
        if ( v.key == projectKey ){
          valid = true;
        }
      });
    }
    return projectKey;
  }


  writeRow(row){
    let newLine = '';
    for ( let i in row ){
      let field = row[i];
      if (typeof field === 'string') {
        //skip
      } else if (typeof field === 'number') {
        field = '' + field;
      } else if (typeof field === 'boolean') {
        field = field ? "true" : "false";
      } else if (typeof field === 'object' && field !== null) {
        this.error(field);
        this.error("Unhandled type: " + (typeof field));
        this.exit(1);
      }
      if (field) {
        let containsdelimiter = field.indexOf(this.delimiter) >= 0;
        let containsQuote = field.indexOf(this.quote) >= 0;
        let containsEscape = field.indexOf(this.escape) >= 0 && (this.escape !== this.quote);
        let containsLinebreak = field.indexOf('\r') >= 0 || field.indexOf('\n') >= 0;
        let shouldQuote = containsQuote || containsdelimiter || containsLinebreak;
        if (shouldQuote && containsEscape) {
          let regexp = this.escape === '\\' ? new RegExp(this.escape + this.escape, 'g') : new RegExp(this.escape, 'g');
          field = field.replace(regexp, this.escape + this.escape);
        }
        if (containsQuote) {
          let regexp = new RegExp(this.quote, 'g');
          field = field.replace(regexp, this.escape + this.quote);
        }
        if (shouldQuote) {
          field = this.quote + field + this.quote;
        }
        newLine += field;
      } else {
        newLine += this.quote + this.quote;
      }
      if (i != row.length - 1) {
        newLine += this.delimiter;
      }
    }
    fs.writeSync(this.fd, newLine + "\n");
  }

  writeIssues(res){
    let rules = [];
    res['rules'].forEach(rule=>{
      rules[rule['key']] = rule['name']
    })
    res['issues'].forEach(issue=>{
      this.writeRow([
        issue.creationDate,
        issue.updateDate,
        issue.rule,
        rules[issue.rule],
        issue.status,
        issue.severity,
        issue.component,
        issue.line,
        issue.message,
        issue.type,
        issue.author,
        issue.tags.join(", "),
        issue.fromHotspot,
        issue.key
      ]);
    });
  }

  getError(error){
    if ( typeof(error) == 'string' ){
      return ": " + error;
    }
    return error + '';
  }

  async run() {
    const {flags, args} = this.parse(CodescanExportCommand)
    this.server = flags.server || 'https://app.codescan.io'
    this.token = flags.token || process.env.CODESCAN_TOKEN || await this.getToken();
    this.organizationKey = args.organizationKey || await this.getOrganizationKey();
    this.projectKey = args.projectKey || await this.getProjectKey();
    this.outputFile = flags.outputFile || await this.getOutputFile();
    this.fd = this.outputFile == '-' ? 1 : fs.openSync(this.outputFile, 'w');
    this.quote = flags.quote || '"';
    this.delimiter = flags.delimiter || ',';
    this.escape = flags.escape || '"';
    this.verifySslCa = flags.verifySslCa;

    this.writeRow([
      "Creation Date",
      "Update Date",
      "Rule",
      "Rule Name",
      "Status",
      "Severity",
      "File",
      "Line",
      "Message",
      "IssueType",
      "Author",
      "Tags",
      "From Hotspot",
      "Issue Key"
    ]);

    let qs = {
      componentKeys: this.projectKey,
      p: 1,
      ps: 500,
      additionalFields: "rules"
    }
    CodescanExportCommand.configurationKeys.forEach(key=>{
      if ( flags[key] ){
        qs[key] = flags[key];
      }
    });

    let res = await this.getJson('/api/issues/search', {qs: qs}).catch(err => {
      this.error("An error occurred trying to read the first page\n" + this.getError(err));
      this.exit(1);
    });
    while ( res['issues'].length > 0 ){
      this.writeIssues(res);
      qs.p ++;

      res = await this.getJson('/api/issues/search', {qs: qs}).catch(err => {
        this.error("An error occurred trying to read the next page.\n" +
                   "This can occur if there are too many results.\n" +
                   "Reduce your request to less than 10,000 results\n" +
                   this.getError(err));
        this.exit(1);
      });
    }

    fs.close(this.fd, (err) => {
      if (err) throw err;
    });
  }
}

CodescanExportCommand.description = `Describe the command here
...

You can pass the security token through the environment variable:
CODESCAN_TOKEN=xxxxxxx
`
CodescanExportCommand.flags = {
  // add --version flag to show CLI version
  version: flags.version({char: 'v'}),
  // add --help flag to show CLI version
  help: flags.help({char: 'h'}),
  server: flags.string({char: 's', description: 'Override server URL'}),
  token: flags.string({char: 't', description: 'Pass security token'}),
  outputFile: flags.string({char: 'f', description: 'Output file'}),

  quote: flags.string({description: 'Quote mark. Defaults to "'}),
  delimiter: flags.string({description: 'Delimiter mark. Defaults to ,'}),
  escape: flags.string({description: 'Escape mark. Defaults to "'}),

  assigned: flags.string({description: "To retrieve assigned or unassigned issues\n\n" +
    "Possible values: true, false, yes, no"}),
  assignees: flags.string({description: "Comma-separated list of assignee logins.\n" +
    "The value '__me__' can be used as a placeholder for user who performs the request\n\n" +
    "Example value: admin,usera,__me__"}),
  author: flags.string({description: "SCM accounts. To set several values, the parameter must be called once for each value.\n\n" +
    "Example value: author=torvalds@linux-foundation.org&author=linux@fondation.org"}),
  createdAfter: flags.string({description: "To retrieve issues created after the given date (inclusive).\n" +
    "Either a date (server timezone) or datetime can be provided.\n" +
    "If this parameter is set, createdSince must not be set\n\n" +
    "Example value: 2017-10-19 or 2017-10-19T13:00:00+0200"}),
  createdAt: flags.string({description: "Datetime to retrieve issues created during a specific analysis\n\n" +
    "Example value: 2017-10-19T13:00:00+0200"}),
  createdBefore: flags.string({description: "To retrieve issues created before the given date (inclusive)." +
    "Either a date (server timezone) or datetime can be provided.\n\n" +
    "Example value: 2017-10-19 or 2017-10-19T13:00:00+0200"}),
  createdInLast: flags.string({description: "To retrieve issues created during a time span before the current time (exclusive).\n" +
    "Accepted units are 'y' for year, 'm' for month, 'w' for week and 'd' for day.\n" +
    "If this parameter is set, createdAfter must not be set\n\n" +
    "Example value: 1m2w (1 month 2 weeks)"}),
  cwe: flags.string({description: "Comma-separated list of CWE identifiers. Use 'unknown' to select issues not associated to any CWE.\n\n" +
    "Example value: 12,125,unknown"}),
  resolutions: flags.string({description: "Comma-separated list of resolutions\n\n" +
    "Possible values: FALSE-POSITIVE, WONTFIX, FIXED, REMOVED\n" +
    "Example value: FIXED,REMOVED"}),
  resolved: flags.string({description: "To match resolved or unresolved issues\n\n" +
    "Possible values: true, false, yes, no"}),
  severities: flags.string({description: "Comma-separated list of severities\n\n" +
    "Possible values: INFO, MINOR, MAJOR, CRITICAL, BLOCKER\n" +
    "Example value: BLOCKER,CRITICAL"}),
  sinceLeakPeriod: flags.string({description: "To retrieve issues created since the leak period.\n" +
    "If this parameter is set to a truthy value, createdAfter must not be set and one component id or key must be provided.\n\n" +
    "Possible values: true, false, yes, no"}),
  statuses: flags.string({description: "Comma-separated list of statuses\n\n" +
    "Possible values: OPEN, CONFIRMED, REOPENED, RESOLVED, CLOSED\n" +
    "Example value: OPEN,REOPENED"}),
  tags: flags.string({description: "Comma-separated list of tags\n\n" +
    "Example value: security,convention"}),
  types: flags.string({description: "Comma-separated list of types\n\n" +
    "Possible values: CODE_SMELL, BUG, VULNERABILITY, SECURITY_HOTSPOT\n" +
    "Default value: BUG,VULNERABILITY,CODE_SMELL\n" +
    "Example value: CODE_SMELL,BUG"}),

  verifySslCa: flags.boolean({default: true, description: "Use --no-verifySslCa to skip verification of the server certificate against the list of supplied CAs.\nThis can be helpful in case of using self-signed certificates.\n", allowNo: true}),
}
CodescanExportCommand.args = [
  {name: 'organizationKey'},
  {name: 'projectKey'},
];
CodescanExportCommand.configurationKeys = [
  'assigned',
  'assignees',
  'author',
  'createdAfter',
  'createdAt',
  'createdBefore',
  'createdInLast',
  'cwe',
  'resolutions',
  'resolved',
  'severities',
  'sinceLeakPeriod',
  'statuses',
  'tags',
  'types'
];

module.exports = CodescanExportCommand
