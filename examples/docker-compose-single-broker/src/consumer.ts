import { Handler, MSKEvent } from 'aws-lambda';

export const handler: Handler = async (event: MSKEvent) => {
  console.log('TRIGGERED EVENT');
  console.log(event);
  console.log('CONSUMED EVENT');
};
