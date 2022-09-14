var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import AWS from 'aws-sdk';
import { Kafka } from 'kafkajs';
var defaultEvent = {
    arn: 'arn:*',
    topic: '',
    batchSize: 100,
    maximumBatchingWindow: 1,
    startingPosition: 'LATEST'
};
export var getMskEvent = function (event) {
    return __assign(__assign({}, defaultEvent), event);
};
export var defaultKafkaClientId = 'serverless-offline-msk-client';
var ServerlessOfflineAwsMskPlugin = /** @class */ (function () {
    function ServerlessOfflineAwsMskPlugin(serverless, options) {
        var _this = this;
        var _a, _b;
        var _c, _d, _e;
        this.serverless = serverless;
        this.options = options;
        var custom = ((_b = (_a = this.serverless) === null || _a === void 0 ? void 0 : _a.service) === null || _b === void 0 ? void 0 : _b.custom) || {};
        this.customOptions = custom['serverless-offline-msk'] || {};
        (_c = this.customOptions).allowAutoTopicCreation || (_c.allowAutoTopicCreation = true);
        (_d = this.customOptions).clientId || (_d.clientId = defaultKafkaClientId);
        (_e = this.customOptions).brokers || (_e.brokers = []);
        this.kafka = new Kafka({
            brokers: this.customOptions.brokers,
            clientId: this.customOptions.clientId
        });
        this.hooks = {
            'offline:start:init': function () { return _this.init(); },
            'offline:start:end': function () { return _this.end(); }
        };
    }
    ServerlessOfflineAwsMskPlugin.prototype.init = function () {
        var _this = this;
        var _a, _b;
        var _loop_1 = function (_name, fn) {
            // Can't do anything else if the config is bad
            if (!fn.events || !Array.isArray(fn.events)) {
                return "break";
            }
            // Filter out non-MSK events
            var mskEvents = fn.events
                .filter(function (event) { return (event.msk ? true : false); })
                .map(function (event) { return getMskEvent(event.msk); });
            // Loop over each event, and run them async
            mskEvents.forEach(function (event) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                return [2 /*return*/, this.connectAndListen(fn, event)];
            }); }); });
        };
        // Loop over every function in the service and look for MSK events.
        for (var _i = 0, _c = Object.entries(((_b = (_a = this.serverless) === null || _a === void 0 ? void 0 : _a.service) === null || _b === void 0 ? void 0 : _b.functions) || {}); _i < _c.length; _i++) {
            var _d = _c[_i], _name = _d[0], fn = _d[1];
            var state_1 = _loop_1(_name, fn);
            if (state_1 === "break")
                break;
        }
    };
    ServerlessOfflineAwsMskPlugin.prototype.connectAndListen = function (fn, event) {
        return __awaiter(this, void 0, void 0, function () {
            var lambdaParams, lambda, prefix, id, groupId, consumer;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // If the event is disabled, stop.
                        if (event.enabled === false) {
                            return [2 /*return*/];
                        }
                        lambdaParams = {
                            endpoint: 'http://localhost:3002',
                            region: 'us-east-1',
                            credentials: {
                                accessKeyId: 'root',
                                secretAccessKey: 'root'
                            }
                        };
                        lambda = new AWS.Lambda(lambdaParams);
                        prefix = fn.name || "serverless-offline-msk";
                        id = (Math.random() + 1).toString(36).substring(2);
                        groupId = "".concat(prefix, "-").concat(id);
                        consumer = this.kafka.consumer({
                            groupId: groupId,
                            allowAutoTopicCreation: this.customOptions.allowAutoTopicCreation,
                            maxInFlightRequests: event.batchSize
                        });
                        return [4 /*yield*/, consumer.connect()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, consumer.subscribe({
                                topic: event.topic,
                                fromBeginning: event.startingPosition === 'LATEST' ? false : true
                            })];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, consumer.run({
                                eachBatch: function (_a) {
                                    var batch = _a.batch, resolveOffset = _a.resolveOffset, heartbeat = _a.heartbeat;
                                    return __awaiter(_this, void 0, void 0, function () {
                                        var records, _i, _b, message, key, invokeParams;
                                        var _c, _d;
                                        return __generator(this, function (_e) {
                                            switch (_e.label) {
                                                case 0:
                                                    records = {};
                                                    _i = 0, _b = batch.messages;
                                                    _e.label = 1;
                                                case 1:
                                                    if (!(_i < _b.length)) return [3 /*break*/, 4];
                                                    message = _b[_i];
                                                    key = "".concat(batch.topic, "-").concat(batch.partition);
                                                    records[key] || (records[key] = []);
                                                    records[key].push({
                                                        topic: batch.topic,
                                                        partition: batch.partition,
                                                        offset: Number.parseInt(message.offset),
                                                        timestamp: Number.parseInt(message.timestamp),
                                                        timestampType: 'CREATE_TIME',
                                                        key: "".concat((_c = message.key) === null || _c === void 0 ? void 0 : _c.toString()),
                                                        value: "".concat((_d = message.value) === null || _d === void 0 ? void 0 : _d.toString('base64')),
                                                        headers: []
                                                    });
                                                    resolveOffset(message.offset);
                                                    return [4 /*yield*/, heartbeat()];
                                                case 2:
                                                    _e.sent();
                                                    _e.label = 3;
                                                case 3:
                                                    _i++;
                                                    return [3 /*break*/, 1];
                                                case 4:
                                                    invokeParams = {
                                                        FunctionName: "".concat(fn.name),
                                                        InvocationType: 'Event',
                                                        LogType: 'None',
                                                        Payload: JSON.stringify({
                                                            eventSourceArn: 'arn:*',
                                                            eventSource: 'aws:kafka',
                                                            records: records
                                                        })
                                                    };
                                                    lambda.invoke(invokeParams, function (err, data) {
                                                        if (err) {
                                                            console.log('INVOKE ERR', err);
                                                        }
                                                        else {
                                                            console.log('INVOKE OK', data);
                                                        }
                                                    });
                                                    return [2 /*return*/];
                                            }
                                        });
                                    });
                                }
                            })];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ServerlessOfflineAwsMskPlugin.prototype.end = function () {
        // TODO
    };
    return ServerlessOfflineAwsMskPlugin;
}());
export default ServerlessOfflineAwsMskPlugin;
