import {mkdirSync,copyFileSync,rmSync} from 'node:fs';
rmSync('out',{recursive:true,force:true});
mkdirSync('public',{recursive:true});
copyFileSync('node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs','public/pdf.worker.mjs');
