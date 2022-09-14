import AWS from 'aws-sdk';
import { MSKRecord } from 'aws-lambda';
import { Hooks } from 'serverless/classes/Plugin';
import { Msk } from 'serverless/plugins/aws/provider/awsProvider';
import Serverless, {
  Options,
  FunctionDefinitionHandler,
  FunctionDefinitionImage,
} from 'serverless';
import { Kafka } from 'kafkajs';

export interface CustomOptions {
  allowAutoTopicCreation: boolean;
  clientId: string;
  brokers: Array<string>;
}

// Quick workaround to add support for other attributes
export interface ServerlessMSKEvent extends Msk {
  maximumBatchingWindow?: number;
}

const defaultEvent: ServerlessMSKEvent = {
  arn: 'arn:*',
  topic: '',
  batchSize: 100,
  maximumBatchingWindow: 1,
  startingPosition: 'LATEST',
};

export const getMskEvent = (event: Msk): ServerlessMSKEvent => {
  return {
    ...defaultEvent,
    ...event,
  };
};

export const defaultKafkaClientId = 'serverless-offline-msk-client';

export default class ServerlessOfflineAwsMskPlugin {
  serverless: Serverless;
  options: Options;
  hooks: Hooks;

  customOptions: CustomOptions;
  kafka: Kafka;

  constructor(serverless: Serverless, options: Options) {
    this.serverless = serverless;
    this.options = options;

    const custom = this.serverless?.service?.custom || {};
    this.customOptions = custom['serverless-offline-msk'] || {};
    this.customOptions.allowAutoTopicCreation ||= true;
    this.customOptions.clientId ||= defaultKafkaClientId;
    this.customOptions.brokers ||= [];

    this.kafka = new Kafka({
      brokers: this.customOptions.brokers,
      clientId: this.customOptions.clientId,
    });

    this.hooks = {
      'offline:start:init': () => this.init(),
      'offline:start:end': () => this.end(),
    };
  }

  init() {
    // Loop over every function in the service and look for MSK events.
    for (const [name, fn] of Object.entries(this.serverless?.service?.functions || {})) {
      // Can't do anything else if the config is bad
      if (!fn.events || !Array.isArray(fn.events)) {
        break;
      }

      // Filter out non-MSK events
      const mskEvents = fn.events
        .filter((event) => (event.msk ? true : false))
        .map((event) => getMskEvent(event.msk as ServerlessMSKEvent));

      // Loop over each event, and run them async
      mskEvents.forEach(async (event) => this.connectAndListen(name, fn, event));
    }
  }

  async connectAndListen(
    fnName: string,
    fn: FunctionDefinitionHandler | FunctionDefinitionImage,
    event: ServerlessMSKEvent,
  ) {
    const lambdaParams = { endpoint: 'http://localhost:3002' };
    const lambda = new AWS.Lambda(lambdaParams);

    // From what I've seen OOTB, every consumer is a separate group ID.
    const prefix = fn.name || `serverless-offline-msk`;
    const id = (Math.random() + 1).toString(36).substring(2);
    const groupId = `${prefix}-${id}`;

    const consumer = this.kafka.consumer({
      groupId,
      allowAutoTopicCreation: this.customOptions.allowAutoTopicCreation,
      maxInFlightRequests: event.batchSize,
    });

    await consumer.connect();
    await consumer.subscribe({
      topic: event.topic,
      fromBeginning: event.startingPosition === 'LATEST' ? false : true,
    });

    await consumer.run({
      eachBatch: async ({ batch, resolveOffset, heartbeat }) => {
        const records: Record<string, Array<MSKRecord>> = {};

        for (const message of batch.messages) {
          const key = `${batch.topic}-${batch.partition}`;
          records[key] ||= [];
          records[key].push({
            topic: batch.topic,
            partition: batch.partition,
            offset: Number.parseInt(message.offset),
            timestamp: Number.parseInt(message.timestamp),
            timestampType: 'CREATE_TIME',
            key: `${message.key?.toString()}`,
            value: `${message.value?.toString('base64')}`,
            headers: [],
          });

          resolveOffset(message.offset);
          await heartbeat();
        }

        const invokeParams = {
          FunctionName: fnName,
          InvocationType: 'RequestResponse',
          LogType: 'None',
          Payload: JSON.stringify({
            eventSourceArn: 'arn:*',
            eventSource: 'aws:kafka',
            records,
          }),
        };

        lambda.invoke(invokeParams, (err, data) => {
          if (err) {
            console.log('INVOKE ERR', err);
          } else {
            console.log('INVOKE OK', data);
          }
        });
      },
    });
  }

  end() {
    // TODO
  }
}
