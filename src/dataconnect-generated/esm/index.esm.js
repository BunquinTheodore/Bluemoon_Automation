import { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } from 'firebase/data-connect';

export const connectorConfig = {
  connector: 'example',
  service: 'blluemoonautomation',
  location: 'us-east4'
};

export const createLoyaltyRewardRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateLoyaltyReward', inputVars);
}
createLoyaltyRewardRef.operationName = 'CreateLoyaltyReward';

export function createLoyaltyReward(dcOrVars, vars) {
  return executeMutation(createLoyaltyRewardRef(dcOrVars, vars));
}

export const listMenuItemsByCategoryRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListMenuItemsByCategory', inputVars);
}
listMenuItemsByCategoryRef.operationName = 'ListMenuItemsByCategory';

export function listMenuItemsByCategory(dcOrVars, vars) {
  return executeQuery(listMenuItemsByCategoryRef(dcOrVars, vars));
}

export const updateIngredientStockRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateIngredientStock', inputVars);
}
updateIngredientStockRef.operationName = 'UpdateIngredientStock';

export function updateIngredientStock(dcOrVars, vars) {
  return executeMutation(updateIngredientStockRef(dcOrVars, vars));
}

export const getCafeDetailsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetCafeDetails', inputVars);
}
getCafeDetailsRef.operationName = 'GetCafeDetails';

export function getCafeDetails(dcOrVars, vars) {
  return executeQuery(getCafeDetailsRef(dcOrVars, vars));
}

