import ServerlessPlugin, { Hooks } from 'serverless/classes/Plugin';
import Serverless, { Options, FunctionDefinitionHandler, FunctionDefinitionImage } from 'serverless';
import { Kafka } from 'kafkajs';
import { CustomOptions } from './options';
import { ServerlessMSKEvent } from './msk';
export declare const defaultKafkaClientId = "serverless-offline-msk-client";
export default class ServerlessOfflineAwsMskPlugin implements ServerlessPlugin {
    serverless: Serverless;
    options: Options;
    hooks: Hooks;
    customOptions: CustomOptions;
    kafka: Kafka;
    constructor(serverless: Serverless, options: Options);
    init(): void;
    connectAndListen(fnName: string, fn: FunctionDefinitionHandler | FunctionDefinitionImage, event: ServerlessMSKEvent): Promise<void>;
    end(): void;
}
