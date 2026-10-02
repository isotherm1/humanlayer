import {readFileSync,writeFileSync,mkdirSync,readdirSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {gzipSync} from 'node:zlib';
import ts from 'typescript';
rmSync('dist',{recursive:true,force:true});mkdirSync('dist/server',{recursive:true});mkdirSync('dist/.openai',{recursive:true});
const assets={};function collect(folder,prefix=''){for(const item of readdirSync(folder,{withFileTypes:true})){const path=join(folder,item.name),name=prefix+'/'+item.name;if(item.isDirectory())collect(path,name);else if(!name.endsWith('.map'))assets[name]=gzipSync(readFileSync(path)).toString('base64');}}
collect('out');
const compile=(file)=>ts.transpileModule(readFileSync(file,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText.replace(/^import .*from ["'][^"']+["'];?\s*$/gm,'');
// The hosting runtime loads a single ES module. These modules have no runtime
// dependencies beyond Web APIs; merge their compiled declarations in order.
const contract=compile('lib/analysis-contract.ts').replace(/^export /gm,'');
const api=compile('lib/server-api.ts').replace(/^export /gm,'');
writeFileSync('dist/server/index.js',contract+'\n'+api+'\nconst assets = '+JSON.stringify(assets)+';\n'+compile('server/index.ts'));
writeFileSync('dist/.openai/hosting.json',readFileSync('.openai/hosting.json'));
console.log('Worker built: '+Object.keys(assets).length+' assets, '+(readFileSync('dist/server/index.js').length/1024/1024).toFixed(2)+' MB single module');
