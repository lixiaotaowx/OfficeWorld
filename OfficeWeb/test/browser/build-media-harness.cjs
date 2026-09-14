require('esbuild').buildSync({entryPoints:['OfficeWeb/test/browser/media-harness.ts'],bundle:true,format:'iife',outfile:'Build/media-harness.js',platform:'browser'});

