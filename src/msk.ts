import { Msk } from 'serverless/plugins/aws/provider/awsProvider';

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
