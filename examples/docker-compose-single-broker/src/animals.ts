import { Handler, MSKEvent } from 'aws-lambda';

export const handler: Handler = async (event: MSKEvent) => {
  console.log('CONSUMER TRIGGERED!!!');
};
