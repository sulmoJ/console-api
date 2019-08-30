import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';

const createRegion = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.Region.create(params);

    return response;
};

const updateRegion = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.Region.update(params);

    return response;
};

const deleteRegion = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.Region.delete(params);

    return response;
};

const getRegion = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.Region.get(params);

    return response;
};

const addRegionAdmin = async (params) => {
    if (!params.users) {
        throw new Error('Required Parameter. (key = users)');
    }

    let inventoryV1 = await grpcClient.get('inventory', 'v1');

    let successCount = 0;
    let failCount = 0;
    let failItems = {};

    let promises = params.users.map(async (user_id) => {
        try {
            let reqParams = {
                user_id: user_id,
                region_id: params.region_id,
                tags: params.tags || {}
            };

            if (params.domain_id) {
                reqParams.domain_id = params.domain_id;
            };

            await inventoryV1.Region.add_admin(reqParams);
            successCount = successCount + 1;
        } catch (e) {
            failItems[user_id] = e.details || e.message;
            failCount = failCount + 1;
        }
    });
    await Promise.all(promises);

    if (failCount > 0) {
        let error = new Error(`Failed to add region admins. (success: ${successCount}, failure: ${failCount})`);
        error.fail_items = failItems;
        throw error;
    } else {
        return {};
    }
};

const modifyRegionAdmin = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.Region.modify_admin(params);

    return response;
};

const removeRegionAdmin = async (params) => {
    if (!params.users) {
        throw new Error('Required Parameter. (key = users)');
    }

    let inventoryV1 = await grpcClient.get('inventory', 'v1');

    let successCount = 0;
    let failCount = 0;
    let failItems = {};

    let promises = params.users.map(async (user_id) => {
        try {
            let reqParams = {
                user_id: user_id,
                region_id: params.region_id
            };

            if (params.domain_id) {
                reqParams.domain_id = params.domain_id;
            };

            await inventoryV1.Region.remove_admin(reqParams);
            successCount = successCount + 1;
        } catch (e) {
            failItems[user_id] = e.details || e.message;
            failCount = failCount + 1;
        }
    });
    await Promise.all(promises);

    if (failCount > 0) {
        let error = new Error(`Failed to remove region admins. (success: ${successCount}, failure: ${failCount})`);
        error.fail_items = failItems;
        throw error;
    } else {
        return {};
    }
};

const listRegionAdmins = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.Region.list_admins(params);

    return response;
};

const listRegions = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.Region.list(params);

    return response;
};

export {
    createRegion,
    updateRegion,
    deleteRegion,
    getRegion,
    addRegionAdmin,
    modifyRegionAdmin,
    removeRegionAdmin,
    listRegionAdmins,
    listRegions
};
