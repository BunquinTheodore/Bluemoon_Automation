const { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'example',
  service: 'blluemoonautomation',
  location: 'us-east4'
};
exports.connectorConfig = connectorConfig;

const createLoyaltyRewardRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateLoyaltyReward', inputVars);
}
createLoyaltyRewardRef.operationName = 'CreateLoyaltyReward';
exports.createLoyaltyRewardRef = createLoyaltyRewardRef;

exports.createLoyaltyReward = function createLoyaltyReward(dcOrVars, vars) {
  return executeMutation(createLoyaltyRewardRef(dcOrVars, vars));
};

const listMenuItemsByCategoryRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListMenuItemsByCategory', inputVars);
}
listMenuItemsByCategoryRef.operationName = 'ListMenuItemsByCategory';
exports.listMenuItemsByCategoryRef = listMenuItemsByCategoryRef;

exports.listMenuItemsByCategory = function listMenuItemsByCategory(dcOrVars, vars) {
  return executeQuery(listMenuItemsByCategoryRef(dcOrVars, vars));
};

const updateIngredientStockRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateIngredientStock', inputVars);
}
updateIngredientStockRef.operationName = 'UpdateIngredientStock';
exports.updateIngredientStockRef = updateIngredientStockRef;

exports.updateIngredientStock = function updateIngredientStock(dcOrVars, vars) {
  return executeMutation(updateIngredientStockRef(dcOrVars, vars));
};

const getCafeDetailsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetCafeDetails', inputVars);
}
getCafeDetailsRef.operationName = 'GetCafeDetails';
exports.getCafeDetailsRef = getCafeDetailsRef;

exports.getCafeDetails = function getCafeDetails(dcOrVars, vars) {
  return executeQuery(getCafeDetailsRef(dcOrVars, vars));
};
