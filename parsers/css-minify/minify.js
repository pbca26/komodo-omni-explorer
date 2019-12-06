// ref: https://gist.github.com/pritambaral/cec6aca19d6796cd230d

if (process.argv.length < 3) {
  console.error('Usage:', process.argv.join(' '), '/path/to/file.css');
  process.exit(1);
}

file = process.argv[2];

var fs = require('fs');
var css = require('css');

var sheet = css.parse(fs.readFileSync(file, {encoding: 'utf8'}), {source: file});

function mergeDeclarations(dest, source) {
  var added, anyChanged=false;
  for(var i in source.declarations) {
    added = false;
    for(var j in dest.declarations) {
      if (dest.declarations[j].property === source.declarations[i].property) {
        if (dest.declarations[j].value !== source.declarations[i].value) anyChanged = true;
        dest.declarations[j].value = source.declarations[i].value;
        added = true;
        break;
      }
    }
    if (!added) {
      dest.declarations.push(source.declarations[i]);
      anyChanged = true;
    }
  }
  if(!anyChanged) console.error('NO CHANGE!')
}

function merge(rules) {
  var result = {}, rule, key;
  for(var i in rules) {
    rule = rules[i];
    if (!rule.selectors) continue;
    key = rule.selectors.join();
    if (!result[key]) {
      result[key] = rule;
    } else {
      console.error('Repeated selector:', key);
      mergeDeclarations(result[key], rule);
    }
  }
  var newRules = [];
  for(var i in rules) {
    if (!rules[i].selectors) {
      newRules.push(rules[i]);
      continue;
    }
    key = rules[i].selectors.join();
    if (!result[key]) continue;
    newRules.push(result[key]);
    delete result[key];
  }
  return newRules;
}

sheet.stylesheet.rules = merge(sheet.stylesheet.rules);
console.log(css.stringify(sheet, {indent: '  '}));