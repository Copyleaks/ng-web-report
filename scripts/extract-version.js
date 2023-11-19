const fs = require('fs');
const path = require('path');
const projectPath = path.join(process.cwd(), 'projects/copyleaks-web-report');
const { version } = require(path.join(projectPath, 'package.json'));
fs.writeFileSync(path.join(projectPath, 'src/lib/report-version.json'), JSON.stringify({ version }), {
	encoding: 'utf-8',
});
console.log(version);
