import { Msk } from 'serverless/plugins/aws/provider/awsProvider';
export interface ServerlessMSKEvent extends Msk {
    maximumBatchingWindow?: number;
}
export declare const getMskEvent: (event: Msk) => ServerlessMSKEvent;
