import { Hooks } from 'serverless/classes/Plugin';
import { Msk } from 'serverless/plugins/aws/provider/awsProvider';
import Serverless, { Options, FunctionDefinitionHandler, FunctionDefinitionImage } from 'serverless';
import { Kafka } from 'kafkajs';
export interface CustomOptions {
    allowAutoTopicCreation: boolean;
    clientId: string;
    brokers: Array<string>;
}
export interface ServerlessMSKEvent extends Msk {
    maximumBatchingWindow?: number;
}
export declare const getMskEvent: (event: Msk) => ServerlessMSKEvent;
export declare const defaultKafkaClientId = "serverless-offline-msk-client";
export default class ServerlessOfflineAwsMskPlugin {
    serverless: Serverless;
    options: Options;
    hooks: Hooks;
    customOptions: CustomOptions;
    kafka: Kafka;
    constructor(serverless: Serverless, options: Options);
    init(): void;
    connectAndListen(fn: FunctionDefinitionHandler | FunctionDefinitionImage, event: ServerlessMSKEvent): Promise<void>;
    end(): void;
}
