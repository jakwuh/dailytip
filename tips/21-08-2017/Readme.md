We have [discussed][1] earlier about how to significantly reduce the size of a bundle that imports `lodash` inside itself. Now we will learn more (in 2 parts) about specific webpack options and settings used in order to reduce the bundle still not breaking the functionality too much.

#### babel-plugin-lodash

```js
// webpack.config.js
module: {
  rules: [{
    test: /\.js$/,
    exclude: /node_modules/,
    use: {
        loader: 'babel-loader',
        options: {
          presets: [['env', {
              modules: false
          }]],
          plugins: ['lodash']
        }
      }
  }]
}
```

Below we are exploring [`lodash-webpack-plugin`][3]. In order to make it work w/ webpack we have to enable `babel-plugin-lodash`, because we usually import functions from `lodash` in the following way:

```js
import {map, find} from 'lodash';
```

This line will import functions from a compiled version of `lodash`, which is not possible to change during webpack compilation (due to the `lodash` implementation, though). With `babel-plugin-lodash` the code above transpiles to the following:

```js
import _map from 'lodash/map';
import _find from 'lodash/find';
```

Then `lodash-webpack-plugin` creates aliases for some internal `lodash` modules which results in a different compiled `lodash` bundle, hence a different bundle size.

#### lodash-webpack-plugin

```js
// webpack.config.js
plugins: [
    new LodashWebpackPlugin({
        // options go here
    }})
];
```

Assume we have following `lodash` functions used in our mid-sized project:

```js
import {
    assignIn, bind, bindAll, chunk, clone, compact, create,
    debounce, defaults, defer, delay, difference, escape, every, fill, filter,
    find, flatten, flattenDeep, forEach, get, has, head, identity, indexOf,
    invoke, invokeMap, isArray, isArrayLike, isBoolean, isDate, isEmpty,
    isEqual, isFinite, isFunction, isMatch, isNaN, isNull, isNumber, isObject,
    isRegExp, isString, isSymbol, isUndefined, iteratee, keyBy, keys, last,
    map, mapValues, matches, matchesProperty, max, memoize, merge,
    min, negate, noop, omit, once, partial, pick, property, random, range,
    reduce, result, sample, shuffle, size, slice, some, sortBy, sum, times,
    toArray, trim, unescape, uniq, uniqBy, uniqueId, values, without
} from 'lodash';
```

In its turn `lodash-webpack-plugin` has a bunch of options which should be passed to the plugin constructor:

```js
const options = {
    shorthands: boolean,
    cloning: boolean,
    currying: boolean,
    caching: boolean,
    collections: boolean,
    exotics: boolean,
    guards: boolean,
    metadata: boolean, // (requires currying)
    deburring: boolean,
    unicode: boolean,
    chaining: boolean,
    memoizing: boolean,
    coercions: boolean,
    flattening: boolean,
    paths: boolean,
    placeholders: boolean // (requires currying)
}
```

The most difficult questions are:
- which options should we enable? (default value for each option is `false`)
- how does `lodash-webpack-plugin` actually reduce the size of a bundle? (we need to understand this to prevent accidental bundle size growth by injudicious imports).

Look forward for the next tip to find the answers.

[1]: https://github.com/jakwuh/dailytip/blob/master/tips/15-08-2017/Readme.md
[2]: https://github.com/jakwuh/dailytip/blob/master/tips/21-08-2017/
[3]: https://www.npmjs.com/package/lodash-webpack-plugin
