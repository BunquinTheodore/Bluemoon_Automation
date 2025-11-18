# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

**If you're looking for the `React README`, you can find it at [`dataconnect-generated/react/README.md`](./react/README.md)**

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*ListMenuItemsByCategory*](#listmenuitemsbycategory)
  - [*GetCafeDetails*](#getcafedetails)
- [**Mutations**](#mutations)
  - [*CreateLoyaltyReward*](#createloyaltyreward)
  - [*UpdateIngredientStock*](#updateingredientstock)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## ListMenuItemsByCategory
You can execute the `ListMenuItemsByCategory` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listMenuItemsByCategory(vars: ListMenuItemsByCategoryVariables): QueryPromise<ListMenuItemsByCategoryData, ListMenuItemsByCategoryVariables>;

interface ListMenuItemsByCategoryRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListMenuItemsByCategoryVariables): QueryRef<ListMenuItemsByCategoryData, ListMenuItemsByCategoryVariables>;
}
export const listMenuItemsByCategoryRef: ListMenuItemsByCategoryRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listMenuItemsByCategory(dc: DataConnect, vars: ListMenuItemsByCategoryVariables): QueryPromise<ListMenuItemsByCategoryData, ListMenuItemsByCategoryVariables>;

interface ListMenuItemsByCategoryRef {
  ...
  (dc: DataConnect, vars: ListMenuItemsByCategoryVariables): QueryRef<ListMenuItemsByCategoryData, ListMenuItemsByCategoryVariables>;
}
export const listMenuItemsByCategoryRef: ListMenuItemsByCategoryRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listMenuItemsByCategoryRef:
```typescript
const name = listMenuItemsByCategoryRef.operationName;
console.log(name);
```

### Variables
The `ListMenuItemsByCategory` query requires an argument of type `ListMenuItemsByCategoryVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ListMenuItemsByCategoryVariables {
  category: string;
}
```
### Return Type
Recall that executing the `ListMenuItemsByCategory` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListMenuItemsByCategoryData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `ListMenuItemsByCategory`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listMenuItemsByCategory, ListMenuItemsByCategoryVariables } from '@dataconnect/generated';

// The `ListMenuItemsByCategory` query requires an argument of type `ListMenuItemsByCategoryVariables`:
const listMenuItemsByCategoryVars: ListMenuItemsByCategoryVariables = {
  category: ..., 
};

// Call the `listMenuItemsByCategory()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listMenuItemsByCategory(listMenuItemsByCategoryVars);
// Variables can be defined inline as well.
const { data } = await listMenuItemsByCategory({ category: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listMenuItemsByCategory(dataConnect, listMenuItemsByCategoryVars);

console.log(data.menuItems);

// Or, you can use the `Promise` API.
listMenuItemsByCategory(listMenuItemsByCategoryVars).then((response) => {
  const data = response.data;
  console.log(data.menuItems);
});
```

### Using `ListMenuItemsByCategory`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listMenuItemsByCategoryRef, ListMenuItemsByCategoryVariables } from '@dataconnect/generated';

// The `ListMenuItemsByCategory` query requires an argument of type `ListMenuItemsByCategoryVariables`:
const listMenuItemsByCategoryVars: ListMenuItemsByCategoryVariables = {
  category: ..., 
};

// Call the `listMenuItemsByCategoryRef()` function to get a reference to the query.
const ref = listMenuItemsByCategoryRef(listMenuItemsByCategoryVars);
// Variables can be defined inline as well.
const ref = listMenuItemsByCategoryRef({ category: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listMenuItemsByCategoryRef(dataConnect, listMenuItemsByCategoryVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.menuItems);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.menuItems);
});
```

## GetCafeDetails
You can execute the `GetCafeDetails` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getCafeDetails(vars: GetCafeDetailsVariables): QueryPromise<GetCafeDetailsData, GetCafeDetailsVariables>;

interface GetCafeDetailsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetCafeDetailsVariables): QueryRef<GetCafeDetailsData, GetCafeDetailsVariables>;
}
export const getCafeDetailsRef: GetCafeDetailsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getCafeDetails(dc: DataConnect, vars: GetCafeDetailsVariables): QueryPromise<GetCafeDetailsData, GetCafeDetailsVariables>;

interface GetCafeDetailsRef {
  ...
  (dc: DataConnect, vars: GetCafeDetailsVariables): QueryRef<GetCafeDetailsData, GetCafeDetailsVariables>;
}
export const getCafeDetailsRef: GetCafeDetailsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getCafeDetailsRef:
```typescript
const name = getCafeDetailsRef.operationName;
console.log(name);
```

### Variables
The `GetCafeDetails` query requires an argument of type `GetCafeDetailsVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetCafeDetailsVariables {
  cafeId: UUIDString;
}
```
### Return Type
Recall that executing the `GetCafeDetails` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetCafeDetailsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `GetCafeDetails`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getCafeDetails, GetCafeDetailsVariables } from '@dataconnect/generated';

// The `GetCafeDetails` query requires an argument of type `GetCafeDetailsVariables`:
const getCafeDetailsVars: GetCafeDetailsVariables = {
  cafeId: ..., 
};

// Call the `getCafeDetails()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getCafeDetails(getCafeDetailsVars);
// Variables can be defined inline as well.
const { data } = await getCafeDetails({ cafeId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getCafeDetails(dataConnect, getCafeDetailsVars);

console.log(data.cafe);

// Or, you can use the `Promise` API.
getCafeDetails(getCafeDetailsVars).then((response) => {
  const data = response.data;
  console.log(data.cafe);
});
```

### Using `GetCafeDetails`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getCafeDetailsRef, GetCafeDetailsVariables } from '@dataconnect/generated';

// The `GetCafeDetails` query requires an argument of type `GetCafeDetailsVariables`:
const getCafeDetailsVars: GetCafeDetailsVariables = {
  cafeId: ..., 
};

// Call the `getCafeDetailsRef()` function to get a reference to the query.
const ref = getCafeDetailsRef(getCafeDetailsVars);
// Variables can be defined inline as well.
const ref = getCafeDetailsRef({ cafeId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getCafeDetailsRef(dataConnect, getCafeDetailsVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.cafe);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.cafe);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## CreateLoyaltyReward
You can execute the `CreateLoyaltyReward` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createLoyaltyReward(vars: CreateLoyaltyRewardVariables): MutationPromise<CreateLoyaltyRewardData, CreateLoyaltyRewardVariables>;

interface CreateLoyaltyRewardRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateLoyaltyRewardVariables): MutationRef<CreateLoyaltyRewardData, CreateLoyaltyRewardVariables>;
}
export const createLoyaltyRewardRef: CreateLoyaltyRewardRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createLoyaltyReward(dc: DataConnect, vars: CreateLoyaltyRewardVariables): MutationPromise<CreateLoyaltyRewardData, CreateLoyaltyRewardVariables>;

interface CreateLoyaltyRewardRef {
  ...
  (dc: DataConnect, vars: CreateLoyaltyRewardVariables): MutationRef<CreateLoyaltyRewardData, CreateLoyaltyRewardVariables>;
}
export const createLoyaltyRewardRef: CreateLoyaltyRewardRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createLoyaltyRewardRef:
```typescript
const name = createLoyaltyRewardRef.operationName;
console.log(name);
```

### Variables
The `CreateLoyaltyReward` mutation requires an argument of type `CreateLoyaltyRewardVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateLoyaltyRewardVariables {
  cafeId: UUIDString;
  description: string;
  name: string;
  pointsRequired: number;
}
```
### Return Type
Recall that executing the `CreateLoyaltyReward` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateLoyaltyRewardData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateLoyaltyRewardData {
  loyaltyReward_insert: LoyaltyReward_Key;
}
```
### Using `CreateLoyaltyReward`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createLoyaltyReward, CreateLoyaltyRewardVariables } from '@dataconnect/generated';

// The `CreateLoyaltyReward` mutation requires an argument of type `CreateLoyaltyRewardVariables`:
const createLoyaltyRewardVars: CreateLoyaltyRewardVariables = {
  cafeId: ..., 
  description: ..., 
  name: ..., 
  pointsRequired: ..., 
};

// Call the `createLoyaltyReward()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createLoyaltyReward(createLoyaltyRewardVars);
// Variables can be defined inline as well.
const { data } = await createLoyaltyReward({ cafeId: ..., description: ..., name: ..., pointsRequired: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createLoyaltyReward(dataConnect, createLoyaltyRewardVars);

console.log(data.loyaltyReward_insert);

// Or, you can use the `Promise` API.
createLoyaltyReward(createLoyaltyRewardVars).then((response) => {
  const data = response.data;
  console.log(data.loyaltyReward_insert);
});
```

### Using `CreateLoyaltyReward`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createLoyaltyRewardRef, CreateLoyaltyRewardVariables } from '@dataconnect/generated';

// The `CreateLoyaltyReward` mutation requires an argument of type `CreateLoyaltyRewardVariables`:
const createLoyaltyRewardVars: CreateLoyaltyRewardVariables = {
  cafeId: ..., 
  description: ..., 
  name: ..., 
  pointsRequired: ..., 
};

// Call the `createLoyaltyRewardRef()` function to get a reference to the mutation.
const ref = createLoyaltyRewardRef(createLoyaltyRewardVars);
// Variables can be defined inline as well.
const ref = createLoyaltyRewardRef({ cafeId: ..., description: ..., name: ..., pointsRequired: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createLoyaltyRewardRef(dataConnect, createLoyaltyRewardVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.loyaltyReward_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.loyaltyReward_insert);
});
```

## UpdateIngredientStock
You can execute the `UpdateIngredientStock` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateIngredientStock(vars: UpdateIngredientStockVariables): MutationPromise<UpdateIngredientStockData, UpdateIngredientStockVariables>;

interface UpdateIngredientStockRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateIngredientStockVariables): MutationRef<UpdateIngredientStockData, UpdateIngredientStockVariables>;
}
export const updateIngredientStockRef: UpdateIngredientStockRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateIngredientStock(dc: DataConnect, vars: UpdateIngredientStockVariables): MutationPromise<UpdateIngredientStockData, UpdateIngredientStockVariables>;

interface UpdateIngredientStockRef {
  ...
  (dc: DataConnect, vars: UpdateIngredientStockVariables): MutationRef<UpdateIngredientStockData, UpdateIngredientStockVariables>;
}
export const updateIngredientStockRef: UpdateIngredientStockRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateIngredientStockRef:
```typescript
const name = updateIngredientStockRef.operationName;
console.log(name);
```

### Variables
The `UpdateIngredientStock` mutation requires an argument of type `UpdateIngredientStockVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateIngredientStockVariables {
  id: UUIDString;
  currentStock: number;
}
```
### Return Type
Recall that executing the `UpdateIngredientStock` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateIngredientStockData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateIngredientStockData {
  ingredient_update?: Ingredient_Key | null;
}
```
### Using `UpdateIngredientStock`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateIngredientStock, UpdateIngredientStockVariables } from '@dataconnect/generated';

// The `UpdateIngredientStock` mutation requires an argument of type `UpdateIngredientStockVariables`:
const updateIngredientStockVars: UpdateIngredientStockVariables = {
  id: ..., 
  currentStock: ..., 
};

// Call the `updateIngredientStock()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateIngredientStock(updateIngredientStockVars);
// Variables can be defined inline as well.
const { data } = await updateIngredientStock({ id: ..., currentStock: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateIngredientStock(dataConnect, updateIngredientStockVars);

console.log(data.ingredient_update);

// Or, you can use the `Promise` API.
updateIngredientStock(updateIngredientStockVars).then((response) => {
  const data = response.data;
  console.log(data.ingredient_update);
});
```

### Using `UpdateIngredientStock`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateIngredientStockRef, UpdateIngredientStockVariables } from '@dataconnect/generated';

// The `UpdateIngredientStock` mutation requires an argument of type `UpdateIngredientStockVariables`:
const updateIngredientStockVars: UpdateIngredientStockVariables = {
  id: ..., 
  currentStock: ..., 
};

// Call the `updateIngredientStockRef()` function to get a reference to the mutation.
const ref = updateIngredientStockRef(updateIngredientStockVars);
// Variables can be defined inline as well.
const ref = updateIngredientStockRef({ id: ..., currentStock: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateIngredientStockRef(dataConnect, updateIngredientStockVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.ingredient_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.ingredient_update);
});
```

