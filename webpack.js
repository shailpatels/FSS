const path = require('path');
 
const config = {
   entry: './src/canvas.js',
   output: {
       filename: 'Bundle.js',
       path: path.resolve(__dirname, 'build')
   },
   devtool: 'source-map',
   module: {
       rules: [
           {
               test: /\.(ts)$/,
               exclude: /(node_modules)/,
               use: {
                   loader: 'ts-loader',
                   options: {onlyCompileBundledFiles: true}
               }
           }
       ]
   },
   resolve: {
       extensions: ['.ts', '.js']
   }
};
 
module.exports = config;
 

