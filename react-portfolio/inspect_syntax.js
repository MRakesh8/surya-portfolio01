import fs from 'fs';

const content = fs.readFileSync('d:/Project/Surya_portfolio_new/visual-editor.js', 'utf8');
let openBraces = 0;
let closeBraces = 0;
let openParens = 0;
let closeParens = 0;

for (let i = 0; i < content.length; i++) {
  if (content[i] === '{') openBraces++;
  if (content[i] === '}') closeBraces++;
  if (content[i] === '(') openParens++;
  if (content[i] === ')') closeParens++;
}

console.log(`Braces: { = ${openBraces}, } = ${closeBraces}`);
console.log(`Parens: ( = ${openParens}, ) = ${closeParens}`);
