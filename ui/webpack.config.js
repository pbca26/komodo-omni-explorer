const webpack = require('webpack');
const path = require('path');

const DashboardPlugin = require('webpack-dashboard/plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const autoprefixer = require('autoprefixer');
const SpritesmithPlugin = require('webpack-spritesmith');

const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';

const jsSourcePath = path.join(__dirname, './src');
const buildPath = path.join(__dirname, './build');
const imgPath = path.join(__dirname, './src/assets/img');
const wwwPath = path.join(__dirname, './www');

// Common plugins

/*
* The CommonsChunkPlugin is an opt-in feature that creates a separate file (known as a chunk),
* consisting of common modules shared between multiple entry points.
* By separating common modules from bundles,
* the resulting chunked file can be loaded once initially,
* and stored in cache for later use.
* This results in pagespeed optimizations as the browser can quickly serve the shared code from cache,
* rather than being forced to load a larger bundle whenever a new page is visited.
*/
const plugins = [
  new webpack.optimize.CommonsChunkPlugin({
    name: ['vendor'],
    filename: 'vendor.js',
    minChunks: module => module.context.includes('node_modules') && !module.request.includes('scss')
  }),
  new webpack.optimize.CommonsChunkPlugin({
    name: 'fetch',
    chunks: ['vendor'],
    minChunks: ({resource}) => (/node_modules\/whatwg-fetch/).test(resource)
  }),
  new webpack.optimize.CommonsChunkPlugin({
    name: 'bluebird',
    chunks: ['vendor'],
    minChunks: ({resource}) => (/node_modules\/bluebird/).test(resource)
  }),
  new webpack.optimize.CommonsChunkPlugin({
    name: 'react-table',
    chunks: ['vendor'],
    minChunks: ({resource}) => (/node_modules\/react-table/).test(resource)
  }),
  new webpack.optimize.CommonsChunkPlugin({
    name: 'react-select',
    chunks: ['vendor'],
    minChunks: ({resource}) => (/node_modules\/react-select/).test(resource)
  }),
  new webpack.optimize.CommonsChunkPlugin({
    name: 'react-dom',
    chunks: ['vendor'],
    minChunks: ({resource}) => (/node_modules\/react-dom/).test(resource)
  }),
  new webpack.optimize.CommonsChunkPlugin({
    name: 'react-redux',
    chunks: ['vendor'],
    minChunks: ({resource}) => (/node_modules\/redux/).test(resource)
  }),
  new webpack.optimize.CommonsChunkPlugin({
    name: 'react',
    chunks: ['vendor'],
    minChunks: ({resource}) => (/node_modules\/react/).test(resource)
  }),
  /*
  * The DefinePlugin allows you to create global constants which can be configured at compile time.
  * This can be useful for allowing different behaviour between development builds and release builds.
  * For example, you might use a global constant to determine whether logging takes place;
  * perhaps you perform logging in your development build but not in the release build.
  * That's the sort of scenario the DefinePlugin facilitates.
  */
  new webpack.DefinePlugin({
    'process.env': {
      NODE_ENV: JSON.stringify(nodeEnv),
    },
  }),
  new webpack.NamedModulesPlugin(),
  new HtmlWebpackPlugin({
    template: path.join(wwwPath, 'index.html'),
    path: buildPath,
    filename: 'index.html',
  }),
  new webpack.LoaderOptionsPlugin({
    options: {
      postcss: [
        autoprefixer({
          browsers: [
            'last 3 version',
            'ie >= 10',
          ],
        }),
      ],
      context: __dirname,
    },
  })
];

// Common rules
const rules = [
  {
    test: /\.(js|jsx)$/,
    exclude: /node_modules/,
    use: [
      'babel-loader',
    ],
  },
  {
    test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
    loader: 'url-loader?limit=10000&mimetype=application/font-woff',
  },
  {
    test: /\.(ttf|eot|svg|png)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
    loader: 'file-loader',
  },
  {
    test: /\.(png|gif|jpg|svg)$/,
    include: imgPath,
    use: 'url-loader?limit=20480&name=assets/[name].[ext]',
  },
];

if (isProduction) {
  // Production plugins
  plugins.push(
    new SpritesmithPlugin({
      src: {
        cwd: path.resolve(__dirname, 'src/images_ac'),
        glob: '*.png',
      },
      target: {
        image: path.resolve(__dirname, 'src/styles/sprite.png'),
        css: path.resolve(__dirname, 'src/styles/sprite.scss'),
      },
      apiOptions: {
        cssImageRef: './sprite.png',
        generateSpriteName: fullPathToSourceFile => {
          const {name} = path.parse(fullPathToSourceFile);
          return `coin_${name}`;
        }
      },
      exportOpts: {
        quality: 70,
      },
    })
  );

  plugins.push(
    new webpack.LoaderOptionsPlugin({
      minimize: true,
      debug: false,
    }),
    new webpack.optimize.UglifyJsPlugin({
      extractComments: false,
      parallel: true,
      sourceMap: false,
      warnings: false,
      mangle: true,
      toplevel: false,
      nameCache: null,
      ie8: false,
      keep_fnames: false,
      compress: {
        warnings: false,
        screw_ie8: true,
        conditionals: true,
        unused: true,
        comparisons: true,
        sequences: true,
        dead_code: true,
        evaluate: true,
        if_return: true,
        join_vars: true,
      },
      output: {
        comments: false,
      },
    }),
    new ExtractTextPlugin('[name].css')
  );

  // Production rules
  rules.push(
    {
      test: /\.scss$/,
      loader: ExtractTextPlugin.extract({
        fallback: 'style-loader',
        use: [
          'css-loader',
          'postcss-loader',
          'sass-loader',
        ],
      }),
    }
  );
} else {
  // Development plugins
  plugins.push(
    new SpritesmithPlugin({
      src: {
        cwd: path.resolve(__dirname, 'src/images_ac'),
        glob: '*.png',
      },
      target: {
        image: path.resolve(__dirname, 'src/styles/sprite.png'),
        css: path.resolve(__dirname, 'src/styles/sprite.scss'),
      },
      apiOptions: {
        cssImageRef: './sprite.png',
        generateSpriteName: fullPathToSourceFile => {
          const {name} = path.parse(fullPathToSourceFile);
          return `coin_${name}`;
        }
      },
    })
  );

  plugins.push(
    new webpack.HotModuleReplacementPlugin(),
    new DashboardPlugin()
  );

  // Development rules
  rules.push(
    {
      test: /\.scss$/,
      exclude: /node_modules/,
      use: [
        'style-loader',
        // Using source maps breaks urls in the CSS loader
        // https://github.com/webpack/css-loader/issues/232
        // This comment solves it, but breaks testing from a local network
        // https://github.com/webpack/css-loader/issues/232#issuecomment-240449998
        // 'css-loader?sourceMap',
        'css-loader',
        'postcss-loader',
        'sass-loader?sourceMap',
      ],
    }
  );
}

module.exports = {
  devtool: isProduction ? 'eval' : 'source-map',
  context: jsSourcePath,
  entry: !isProduction ? {
    js: './index.js',
    style: [
      './styles/bootstrap.scss',
      './styles/united.scss',
      './styles/index.scss',
    ],
  } : {
    app: './index.js',
    bootstrap: './styles/bootstrap.scss',
    united: './styles/united.scss',
    custom: './styles/index.scss',
  },
  output: {
    path: buildPath,
    publicPath: '',
    filename: '[name].js',
  },
  module: {
    rules,
  },
  resolve: {
    extensions: [
      '.webpack-loader.js',
      '.web-loader.js',
      '.loader.js',
      '.js',
      '.jsx',
    ],
    modules: [
      path.resolve(__dirname, 'node_modules'),
      path.resolve(__dirname, 'spritesmith-generated'),
      jsSourcePath,
    ],
  },
  plugins,
  devServer: {
    contentBase: isProduction ? './build' : './src',
    historyApiFallback: true,
    port: 3100,
    compress: isProduction,
    inline: !isProduction,
    hot: !isProduction,
    stats: {
      assets: true,
      children: false,
      chunks: false,
      hash: false,
      modules: false,
      publicPath: false,
      timings: true,
      version: false,
      warnings: true,
      colors: {
        green: '\u001b[32m',
      },
    },
  },
};
