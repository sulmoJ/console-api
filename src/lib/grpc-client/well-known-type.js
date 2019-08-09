import _ from 'lodash';

const toString = Object.prototype.toString;

const typeOf = (value) => {
    return toString.call(value);
};

const wrap = (kind, value) => {
    return { kind, [kind]: value };
};

const encoders = {
    [typeOf({})]: v => wrap('struct_value', encodeStruct(v)),
    [typeOf([])]: v => wrap('list_value', encodeListValue(v)),
    [typeOf(0)]: v => wrap('number_value', v),
    [typeOf('')]: v => wrap('string_value', v),
    [typeOf(true)]: v => wrap('bool_value', v),
    [typeOf(null)]: () => wrap('null_value', 0)
};

const encodeStruct = (json) => {
    let fields = [];
    Object.keys(json).map((key) => {
        if (json[key]) {
            fields.push({
                key: key,
                value: encodeValue(json[key])
            });
        }
    });
    return { fields };
};

const encodeValue = (value) => {
    const type = typeOf(value);
    const encoder = encoders[type];
    if (typeof encoder !== 'function') {
        throw new TypeError(`Unable to infer type for "${value}".`);
    }
    return encoder(value);
};

const encodeListValue = (values) => {
    return {
        values: values.map(encodeValue)
    };
};

const decodeStruct = (value) => {
    if (value.fields) {
        let json = {};
        Object.keys(value.fields).map((key) => {
            let field = value.fields[key];
            json[field.key] = decodeValue(field.value);
        });
        return json;

    } else {
        return value;
    }
};

const decodeValue = (value) => {
    if (value.list_value) {
        return decodeListValue(value.list_value);
    } else if (value.struct_value) {
        return decodeStruct(value.struct_value);
    } else if (typeof value.null_value !== 'undefined') {
        return null;
    } else if (value.kind) {
        return value[value.kind];
    } else {
        return value;
    }
};

const decodeListValue = (value) => {
    return value.values.map(decodeValue);
};

const convertMessage = (data, keys, func) => {
    if (Array.isArray(data)) {
        _.map(data, (value) => {
            keys.map((key) => {
                let originalValue = _.get(value, key);
                if (originalValue) {
                    _.set(value, key, func(originalValue));
                }
            });

        });
    } else {
        keys.map((key) => {
            let originalValue = _.get(data, key);
            if (originalValue) {
                _.set(data, key, func(originalValue));
            }
        });
    }
};

const struct = {
    encode(data, key) {
        convertMessage(data, key, encodeStruct);
    },
    decode(data, key) {
        convertMessage(data, key, decodeStruct);
    }
};

const value = {
    encode(data, key) {
        convertMessage(data, key, encodeValue);
    },
    decode(data, key) {
        convertMessage(data, key, decodeValue);
    }
};

const list = {
    encode(data, key) {
        convertMessage(data, key, encodeListValue);
    },
    decode(data, key) {
        convertMessage(data, key, decodeListValue);
    }
};

export {
    struct,
    value,
    list
};