import * as esbuild from 'esbuild'

const config = {
  entryPoints: [
    'src/pages/index.html',
    'src/pages/App.tsx'
  ],
  bundle: true,
  outdir: 'dist',
  sourcemap: true,
  format: 'esm',
  loader: {
    '.html': 'copy',
  },
  logLevel: 'info'
}

if (process.argv.includes('--dev')) {
  const ctx = await esbuild.context(config)
  await ctx.serve({
    servedir: 'dist',
    fallback: 'dist/index.html'
  })
} else {
  await esbuild.build(config)
}
