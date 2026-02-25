const fs = require('fs');

const path = 'src/pages/Scanner.jsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  '<span>Barcode</span>',
  '<Link to="/barcode-scanner" className="hover:text-white transition-colors cursor-pointer">Barcode</Link>'
);

fs.writeFileSync(path, code);
console.log('Done');
