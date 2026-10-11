/**
 * @generated SignedSource<<9d4d4a0e28e8e63120fbf779cef50ab0>>
 * @relayHash 6a04f4279c1f2ce6786937e51a57c854
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 6a04f4279c1f2ce6786937e51a57c854

import { ConcreteRequest } from 'relay-runtime';
export type CreateClogInventoryInput = {
  clientMutationId?: string | null | undefined;
  dateAdded: string;
  item?: string | null | undefined;
  location?: string | null | undefined;
  name?: string | null | undefined;
};
export type useAddStockMutation$variables = {
  input: CreateClogInventoryInput;
};
export type useAddStockMutation$data = {
  readonly createClogInventory: {
    readonly clogInventory: {
      readonly createdAt: string;
      readonly dateAdded: string;
      readonly id: string;
      readonly item: {
        readonly id: string;
        readonly stockCount: number;
      } | null | undefined;
      readonly location: {
        readonly id: string;
        readonly stockCount: number;
      } | null | undefined;
    } | null | undefined;
  } | null | undefined;
};
export type useAddStockMutation = {
  response: useAddStockMutation$data;
  variables: useAddStockMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "input"
  }
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v2 = [
  (v1/*:: as any*/),
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "stockCount",
    "storageKey": null
  }
],
v3 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "input",
        "variableName": "input"
      }
    ],
    "concreteType": "CreateClogInventoryPayload",
    "kind": "LinkedField",
    "name": "createClogInventory",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "ClogInventory",
        "kind": "LinkedField",
        "name": "clogInventory",
        "plural": false,
        "selections": [
          (v1/*:: as any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "dateAdded",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "createdAt",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "ClogItem",
            "kind": "LinkedField",
            "name": "item",
            "plural": false,
            "selections": (v2/*:: as any*/),
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "ClogLocation",
            "kind": "LinkedField",
            "name": "location",
            "plural": false,
            "selections": (v2/*:: as any*/),
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "useAddStockMutation",
    "selections": (v3/*:: as any*/),
    "type": "RootMutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "useAddStockMutation",
    "selections": (v3/*:: as any*/)
  },
  "params": {
    "cacheID": "6a04f4279c1f2ce6786937e51a57c854",
    "id": "6a04f4279c1f2ce6786937e51a57c854",
    "metadata": {},
    "name": "useAddStockMutation",
    "operationKind": "mutation",
    "text": "mutation useAddStockMutation(\n  $input: CreateClogInventoryInput!\n) {\n  createClogInventory(input: $input) {\n    clogInventory {\n      id\n      dateAdded\n      createdAt\n      item {\n        id\n        stockCount\n      }\n      location {\n        id\n        stockCount\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "8fd87c13bfdd3002d589f8ab5f37841d";

export default node;
