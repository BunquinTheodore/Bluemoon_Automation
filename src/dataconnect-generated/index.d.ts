import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface Cafe_Key {
  id: UUIDString;
  __typename?: 'Cafe_Key';
}

export interface CreateLoyaltyRewardData {
  loyaltyReward_insert: LoyaltyReward_Key;
}

export interface CreateLoyaltyRewardVariables {
  cafeId: UUIDString;
  description: string;
  name: string;
  pointsRequired: number;
}

export interface Customer_Key {
  id: UUIDString;
  __typename?: 'Customer_Key';
}

export interface GetCafeDetailsData {
  cafe?: {
    id: UUIDString;
    name: string;
    address: string;
    phoneNumber: string;
    openingHours?: string | null;
    website?: string | null;
    email?: string | null;
  } & Cafe_Key;
}

export interface GetCafeDetailsVariables {
  cafeId: UUIDString;
}

export interface Ingredient_Key {
  id: UUIDString;
  __typename?: 'Ingredient_Key';
}

export interface ListMenuItemsByCategoryData {
  menuItems: ({
    id: UUIDString;
    name: string;
    description?: string | null;
    price: number;
    imageUrl?: string | null;
    isAvailable?: boolean | null;
  } & MenuItem_Key)[];
}

export interface ListMenuItemsByCategoryVariables {
  category: string;
}

export interface LoyaltyReward_Key {
  id: UUIDString;
  __typename?: 'LoyaltyReward_Key';
}

export interface MenuItem_Key {
  id: UUIDString;
  __typename?: 'MenuItem_Key';
}

export interface OrderItem_Key {
  id: UUIDString;
  __typename?: 'OrderItem_Key';
}

export interface Order_Key {
  id: UUIDString;
  __typename?: 'Order_Key';
}

export interface UpdateIngredientStockData {
  ingredient_update?: Ingredient_Key | null;
}

export interface UpdateIngredientStockVariables {
  id: UUIDString;
  currentStock: number;
}

interface CreateLoyaltyRewardRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateLoyaltyRewardVariables): MutationRef<CreateLoyaltyRewardData, CreateLoyaltyRewardVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateLoyaltyRewardVariables): MutationRef<CreateLoyaltyRewardData, CreateLoyaltyRewardVariables>;
  operationName: string;
}
export const createLoyaltyRewardRef: CreateLoyaltyRewardRef;

export function createLoyaltyReward(vars: CreateLoyaltyRewardVariables): MutationPromise<CreateLoyaltyRewardData, CreateLoyaltyRewardVariables>;
export function createLoyaltyReward(dc: DataConnect, vars: CreateLoyaltyRewardVariables): MutationPromise<CreateLoyaltyRewardData, CreateLoyaltyRewardVariables>;

interface ListMenuItemsByCategoryRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListMenuItemsByCategoryVariables): QueryRef<ListMenuItemsByCategoryData, ListMenuItemsByCategoryVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ListMenuItemsByCategoryVariables): QueryRef<ListMenuItemsByCategoryData, ListMenuItemsByCategoryVariables>;
  operationName: string;
}
export const listMenuItemsByCategoryRef: ListMenuItemsByCategoryRef;

export function listMenuItemsByCategory(vars: ListMenuItemsByCategoryVariables): QueryPromise<ListMenuItemsByCategoryData, ListMenuItemsByCategoryVariables>;
export function listMenuItemsByCategory(dc: DataConnect, vars: ListMenuItemsByCategoryVariables): QueryPromise<ListMenuItemsByCategoryData, ListMenuItemsByCategoryVariables>;

interface UpdateIngredientStockRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateIngredientStockVariables): MutationRef<UpdateIngredientStockData, UpdateIngredientStockVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateIngredientStockVariables): MutationRef<UpdateIngredientStockData, UpdateIngredientStockVariables>;
  operationName: string;
}
export const updateIngredientStockRef: UpdateIngredientStockRef;

export function updateIngredientStock(vars: UpdateIngredientStockVariables): MutationPromise<UpdateIngredientStockData, UpdateIngredientStockVariables>;
export function updateIngredientStock(dc: DataConnect, vars: UpdateIngredientStockVariables): MutationPromise<UpdateIngredientStockData, UpdateIngredientStockVariables>;

interface GetCafeDetailsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetCafeDetailsVariables): QueryRef<GetCafeDetailsData, GetCafeDetailsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetCafeDetailsVariables): QueryRef<GetCafeDetailsData, GetCafeDetailsVariables>;
  operationName: string;
}
export const getCafeDetailsRef: GetCafeDetailsRef;

export function getCafeDetails(vars: GetCafeDetailsVariables): QueryPromise<GetCafeDetailsData, GetCafeDetailsVariables>;
export function getCafeDetails(dc: DataConnect, vars: GetCafeDetailsVariables): QueryPromise<GetCafeDetailsData, GetCafeDetailsVariables>;

