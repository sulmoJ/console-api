import ejs from 'ejs';
import _ from 'lodash';
import fs from 'fs';
import redisClient from '@lib/redis';
import grpcClient from '@lib/grpc-client';

// eslint-disable-next-line no-undef
const SCHEMA_DIR = __dirname + '/default-schema/';
const CACHE_KEY_PREFIX = 'add-ons:page-schema:identity.serviceAccount:provider';

const getClient = async (service, version) => {
    return await grpcClient.get(service, version);
};

const checkOptions = (options) => {
    if (!options.provider) {
        throw new Error('Required Parameter. (key = options.provider)');
    }
};

const parseResourceType = (resourceType) => {
    const [service, resource] = resourceType.split('.');
    return [service, resource];
};

const getProviderInfo = async (options) => {
    checkOptions(options);
    const [service, resource] = parseResourceType('identity.Provider');
    const client = await getClient(service);
    return await client[resource].get({provider: options.provider, only: ['template']});
};

const getProviderFields = async (options) => {
    let providerInfo;
    const redis = await redisClient.connect();
    const providerCache = await redis.get(`${CACHE_KEY_PREFIX}:${options.provider}`);
    if (providerCache) {
        providerInfo = JSON.parse(providerCache);
    } else {
        providerInfo = await getProviderInfo(options);
        redis.set(`CACHE_KEY_PREFIX:${options.provider}`, JSON.stringify(providerInfo), 300);
    }

    let fields = [];
    const properties = _.get(providerInfo, 'template.service_account.schema.properties');
    if (properties) {
        fields = Object.keys(properties).map((key) => {
            return {
                key:`data.${key}`,
                name: properties[key].title || key
            };
        });
    }
    return fields;
};

const loadDefaultSchema = (schema) => {
    const buffer = fs.readFileSync(SCHEMA_DIR + `${schema}.json.tmpl`);
    return buffer.toString();
};

const getSchema = async (resourceType, schema, options) => {
    const fields = await getProviderFields(options);
    const defaultSchema = loadDefaultSchema(schema);
    const schemaJSON = ejs.render(defaultSchema, {fields});
    const schemaData = JSON.parse(schemaJSON);

    if (schema === 'table') {
        const searchDefaultSchema = loadDefaultSchema('search');
        const searchSchemaJSON = ejs.render(searchDefaultSchema, {fields});
        const searchSchemaData = JSON.parse(searchSchemaJSON);
        schemaData['options']['search'] = searchSchemaData['search'];
    }

    return schemaData;
};

export {
    getSchema
};
