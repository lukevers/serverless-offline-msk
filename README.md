# serverless-offline-msk

A serverless offline plugin that enables AWS MSK events.

[![serverless](http://public.serverless.com/badges/v3.svg)](http://www.serverless.com)
[![npm version](https://badge.fury.io/js/serverless-offline-msk.svg)](https://badge.fury.io/js/serverless-offline-msk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Note**
>
> Something not working? Open an [issue](https://github.com/lukevers/serverless-offline-msk/issues). Pull requests welcome.

## Getting Started

### Example

See the [./examples](./examples/) folder for fully built out examples.

### Installation

Install the plugin:

```bash
# NPM or Yarn examples below:

npm install --save-dev serverless-offline-msk
yarn add -D serverless-offline-msk
```

In your `serverless.yml` we'll want to add the plugin after [serverless-offline](https://github.com/dherault/serverless-offline):

```yml
plugins:
  - serverless-offline
  - serverless-offline-msk
```

### Plugin Configuration

```yml
custom:
  serverless-offline-msk:
    allowAutoTopicCreation: true # If we can create topics in kafka automatically
    brokers: # list of brokers to use for kafka
      - "kafka:19092" # this example here is from a docker compose example in examples
```

### Function Event Configuration

The supported options are the same that are supported by serverless and MSK. See [the serverless docs](https://www.serverless.com/framework/docs/providers/aws/events/msk) for more information.

```yml
functions:
  consumerName:
    events:
      - msk: # list of MSK events.
          arn: 'arn:*' # requried! in AWS you would use a real MSK ARN, but this can be anything locally
          topic: some_topic_name # required! whatever the topic name is.
          batchSize: 1
          startingPosition: LATEST
          enabled: false # this will turn it off
```

## LICENSE

See [./LICENSE](./LICENSE) for more info.