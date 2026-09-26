/**
 * @generated SignedSource<<f4579bca2bf3b000033a676e16419afc>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type UpdateClogInventoryInput = {
  clientMutationId?: string | null | undefined;
  dateAdded?: string | null | undefined;
  id: string;
  item?: string | null | undefined;
  location?: string | null | undefined;
  name?: string | null | undefined;
};
export type InventoryFormUpdateMutation$variables = {
  input: UpdateClogInventoryInput;
};
export type InventoryFormUpdateMutation$data = {
  readonly updateClogInventory: {
    readonly clogInventory: {
      readonly id: string;
      readonly " $fragmentSpreads": FragmentRefs<"InventoryDetails_inventory" | "InventoryForm_inventory">;
    } | null | undefined;
  } | null | undefined;
};
export type InventoryFormUpdateMutation = {
  response: InventoryFormUpdateMutation$data;
  variables: InventoryFormUpdateMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "input"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "input",
    "variableName": "input"
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
    "name": "InventoryFormUpdateMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
        "concreteType": "UpdateClogInventoryPayload",
        "kind": "LinkedField",
        "name": "updateClogInventory",
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
        "storageKey": null
      }
    ],
    "type": "RootMutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "InventoryFormUpdateMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
        "concreteType": "UpdateClogInventoryPayload",
        "kind": "LinkedField",
        "name": "updateClogInventory",
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
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "88dfd85848311b877986cff526096bcd",
    "id": null,
    "metadata": {},
    "name": "InventoryFormUpdateMutation",
    "operationKind": "mutation",
    "text": "mutation InventoryFormUpdateMutation(\n  $input: UpdateClogInventoryInput!\n) {\n  updateClogInventory(input: $input) {\n    clogInventory {\n      id\n      ...InventoryDetails_inventory\n      ...InventoryForm_inventory\n    }\n  }\n}\n\nfragment InventoryDetails_inventory on ClogInventory {\n  id\n  dateAdded\n  createdAt\n  item {\n    id\n    name\n  }\n  location {\n    id\n    name\n  }\n}\n\nfragment InventoryForm_inventory on ClogInventory {\n  id\n  dateAdded\n  item {\n    id\n    name\n  }\n  location {\n    id\n    name\n  }\n}\n"
  }
};
})();

(node as any).hash = "96bb3d7328a0f69dbd5a0090201a5eb0";

export default node;
