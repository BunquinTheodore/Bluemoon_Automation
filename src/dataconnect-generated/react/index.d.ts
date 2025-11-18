import { CreateLoyaltyRewardData, CreateLoyaltyRewardVariables, ListMenuItemsByCategoryData, ListMenuItemsByCategoryVariables, UpdateIngredientStockData, UpdateIngredientStockVariables, GetCafeDetailsData, GetCafeDetailsVariables } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useCreateLoyaltyReward(options?: useDataConnectMutationOptions<CreateLoyaltyRewardData, FirebaseError, CreateLoyaltyRewardVariables>): UseDataConnectMutationResult<CreateLoyaltyRewardData, CreateLoyaltyRewardVariables>;
export function useCreateLoyaltyReward(dc: DataConnect, options?: useDataConnectMutationOptions<CreateLoyaltyRewardData, FirebaseError, CreateLoyaltyRewardVariables>): UseDataConnectMutationResult<CreateLoyaltyRewardData, CreateLoyaltyRewardVariables>;

export function useListMenuItemsByCategory(vars: ListMenuItemsByCategoryVariables, options?: useDataConnectQueryOptions<ListMenuItemsByCategoryData>): UseDataConnectQueryResult<ListMenuItemsByCategoryData, ListMenuItemsByCategoryVariables>;
export function useListMenuItemsByCategory(dc: DataConnect, vars: ListMenuItemsByCategoryVariables, options?: useDataConnectQueryOptions<ListMenuItemsByCategoryData>): UseDataConnectQueryResult<ListMenuItemsByCategoryData, ListMenuItemsByCategoryVariables>;

export function useUpdateIngredientStock(options?: useDataConnectMutationOptions<UpdateIngredientStockData, FirebaseError, UpdateIngredientStockVariables>): UseDataConnectMutationResult<UpdateIngredientStockData, UpdateIngredientStockVariables>;
export function useUpdateIngredientStock(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateIngredientStockData, FirebaseError, UpdateIngredientStockVariables>): UseDataConnectMutationResult<UpdateIngredientStockData, UpdateIngredientStockVariables>;

export function useGetCafeDetails(vars: GetCafeDetailsVariables, options?: useDataConnectQueryOptions<GetCafeDetailsData>): UseDataConnectQueryResult<GetCafeDetailsData, GetCafeDetailsVariables>;
export function useGetCafeDetails(dc: DataConnect, vars: GetCafeDetailsVariables, options?: useDataConnectQueryOptions<GetCafeDetailsData>): UseDataConnectQueryResult<GetCafeDetailsData, GetCafeDetailsVariables>;
