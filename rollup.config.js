import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: './main.js',
  output: {
    file: 'dist/bundle.js',
    format: 'esm'
  },
  plugins: [commonjs(), resolve()]
};
