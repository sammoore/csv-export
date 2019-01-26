'use strict';

const yargs = require('yargs');

const ARGS = yargs
.option('v', {
  alias: 'verbose',
  default: false
})
.option('f', {
  alias: 'file',
  describe: 'read the csv file at the given path',
  normalize: true,
  conflicts: 'stdin',
  string: true,
})
.option('\b\b-', { // yargs doesn't like the `-` argument, we hack around it
  describe: '  read the csv file from stdin',
})
.option('stdin', { // yargs doesn't like the `-` argument, we hack around it
  hidden: true
})
.help('h', 'show this help screen')
.alias('h', 'help')
.version('0.2.0');

module.exports = function lazy_return() {
  if (!lazy_return.value) lazy_return.value = parse();
  return lazy_return.value;
};

function parse() {
  const argv = ARGS.argv;

  // yargs doesn't like the `-` argument, we hack around it
  argv['-'] = argv._.filter(s => s == '-')[0];

  providedFileOrExit(argv);
  stdinExclusiveOrExit(argv);
  return argv;
} 

function providedFileOrExit(argv) {
  if (!argv.file && !argv['-']) {
    ARGS
    .required('file')
    .fail((msg, err, yargs) => {
      if (err) throw err;
      yargs.showHelp();
      console.error(msg.replace('file', '-f, --file, or -'));
    })
    .parse([]);
    process.exit(1);
  }
}

function stdinExclusiveOrExit(argv) {
  if ((argv.file && argv['-']) || argv.file == '-') {
    ARGS // yargs doesn't like the `-` argument, we use stdin to cause error
    .conflicts('file', 'stdin')
    .fail((msg, err, yargs) => {
      if (err) throw err;
      yargs.showHelp();
      console.error(msg.replace('stdin', '-'));
    })
    .parse(['-f', '--stdin']);
    process.exit(1);
  }
}
