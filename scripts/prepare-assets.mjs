import {mkdirSync,copyFileSync} from 'node:fs';
mkdirSync('public',{recursive:true});
copyFileSync('node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs','public/pdf.worker.mjs');
