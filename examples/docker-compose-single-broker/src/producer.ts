import { Handler } from 'aws-lambda';
import { Kafka, Partitioners } from 'kafkajs';

/**
 * Default Kafka instance. This expects two environment variables to be set at
 * runtime in order for things to work properly:
 *
 * 1. KAFKA_CLIENT_ID - the client's identifier (OPTIONAL)
 * 2. KAFKA_BROKERS - a CSV string (no spaces) of URLS to each broker
 */
export const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID,
  brokers: (process.env.KAFKA_BROKERS || '')?.split(','),
});

/** Default Kafka producer */
export const producer = kafka.producer({
  createPartitioner: Partitioners.DefaultPartitioner,
});

interface E {
  topic: string;
  data: any;
}

const events: Array<E> = [
  {
    topic: 'kitten_feed',
    data: {
      owner: 'Jonathan',
      pet: 'Garfield',
      food: 'Lasagna',
    },
  },
  {
    topic: 'kitten_pet',
    data: {
      owner: 'Unknown',
      pet: 'Tom',
      food: 'Jerry',
    },
  },
];

export const handler: Handler = async () => {
  try {
    console.log('Connecting...');
    await producer.connect();
    console.log('Connected! Sending events...');

    for (const event of events) {
      await producer.send({
        topic: event.topic,
        messages: [{ value: JSON.stringify(event.data) }],
      });
    }

    console.log('Sent!');
  } catch (error) {
    console.error('ERROR!!!', { error: JSON.stringify(error) });
  }
};
