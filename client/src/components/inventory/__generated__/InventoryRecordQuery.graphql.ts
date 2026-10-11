/**
 * @generated SignedSource<<856871412f4addd1d9db28dd7da32cc5>>
 * @relayHash de56b93ba681a723abb243bca2cf2514
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID de56b93ba681a723abb243bca2cf2514

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type InventoryRecordQuery$variables = {
  id: string;
};
export type InventoryRecordQuery$data = {
  readonly clogInventory: {
    readonly id: string;
    readonly " $fragmentSpreads": FragmentRefs<"InventoryDetails_inventory" | "InventoryForm_inventory">;
  } | null | undefined;
};
export type InventoryRecordQuery = {
  response: InventoryRecordQuery$data;
  variables: InventoryRecordQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "id"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v3 = [
  (v2/*:: as any*/),
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "name",
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "InventoryRecordQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
        "concreteType": "ClogInventory",
        "kind": "LinkedField",
        "name": "clogInventory",
        "plural": false,
        "selections": [
          (v2/*:: as any*/),
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "InventoryDetails_inventory"
          },
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "InventoryForm_inventory"
          }
        ],
        "storageKey": null
      }
    ],
    "type": "RootQuery",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "InventoryRecordQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
        "concreteType": "ClogInventory",
        "kind": "LinkedField",
        "name": "clogInventory",
        "plural": false,
        "selections": [
          (v2/*:: as any*/),
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
            "selections": (v3/*:: as any*/),
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "ClogLocation",
            "kind": "LinkedField",
            "name": "location",
            "plural": false,
            "selections": (v3/*:: as any*/),
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "de56b93ba681a723abb243bca2cf2514",
    "id": "de56b93ba681a723abb243bca2cf2514",
    "metadata": {},
    "name": "InventoryRecordQuery",
    "operationKind": "query",
    "text": "query InventoryRecordQuery(\n  $id: ID!\n) {\n  clogInventory(id: $id) {\n    id\n    ...InventoryDetails_inventory\n    ...InventoryForm_inventory\n  }\n}\n\nfragment InventoryDetails_inventory on ClogInventory {\n  id\n  dateAdded\n  createdAt\n  item {\n    id\n    name\n  }\n  location {\n    id\n    name\n  }\n}\n\nfragment InventoryForm_inventory on ClogInventory {\n  id\n  dateAdded\n  item {\n    id\n    name\n  }\n  location {\n    id\n    name\n  }\n}\n"
  }
};
})();

(node as any).hash = "be19af0d688e78a0cef77cca6608033d";

export default node;
