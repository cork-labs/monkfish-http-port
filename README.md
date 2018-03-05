# Monkfish Port HTTP

> HTTP Port adapter for Node.js framework Monkfish.


## Getting Started

```shell
npm install --save @cork-labs/monkfish @cork-labs/monkfish-port-http
```

Wraps [express]() framework to facilitate injection, testing and configuration of routes.

Instantiante or extend [Port](./src/Port.js) to create an instance of express.

Instantiante or extend [Router](./src/Router.js) to define your API routes.

Routes generate [Events](https://github.comn/cork-labs/monkfish/blob/master/src/classes/Event.js),
 dispatch them to the [Application](https://github.comn/cork-labs/monkfish/blob/master/src/Application.js) core
 and send the result back to the client.

See [Monkfish](https://github.comn/cork-labs/monkfish) for more information.


## API



## Develop

```shell
# lint and fix
npm run lint

# run test suite
npm test

# lint and test
npm run build

# serve test coverage
npm run coverage

# publish a minor version
node_modules/.bin/npm-bump minor
```


### Contributing

We'd love for you to contribute to our source code and to make it even better than it is today!

Check [CONTRIBUTING](https://github.com/cork-labs/contributing/blob/master/CONTRIBUTING.md) before submitting issues and PRs.


## Links

- [npm-bump](https://www.npmjs.com/package/npm-bump)
- [chai](http://chaijs.com/api/)
- [sinon](http://sinonjs.org/)
- [sinon-chai](https://github.com/domenic/sinon-chai)


## [MIT License](LICENSE)

[Copyright (c) 2018 Cork Labs](http://cork-labs.mit-license.org/2018)
