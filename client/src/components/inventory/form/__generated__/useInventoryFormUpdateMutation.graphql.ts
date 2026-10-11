/**
 * @generated SignedSource<<76f0f68703a44449fd98ca98cb762977>>
 * @relayHash c5ea0a49c400a7b5d9d2ed6ef399e6bc
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID c5ea0a49c400a7b5d9d2ed6ef399e6bc

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
export type useInventoryFormUpdateMutation$variables = {
  input: UpdateClogInventoryInput;
};
export type useInventoryFormUpdateMutation$data = {
  readonly updateClogInventory: {
    readonly clogInventory: {
      readonly id: string;
      readonly " $fragmentSpreads": FragmentRefs<"InventoryDetails_inventory" | "InventoryForm_inventory">;
    } | null | undefined;
  } | null | undefined;
};
export type useInventoryFormUpdateMutation = {
  response: useInventoryFormUpdateMutation$data;
  variables: useInventoryFormUpdateMutation$variables;
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
    "name": "useInventoryFormUpdateMutation",
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
    "name": "useInventoryFormUpdateMutation",
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
    "cacheID": "c5ea0a49c400a7b5d9d2ed6ef399e6bc",
    "id": "c5ea0a49c400a7b5d9d2ed6ef399e6bc",
    "metadata": {},
    "name": "useInventoryFormUpdateMutation",
    "operationKind": "mutation",
    "text": "mutation useInventoryFormUpdateMutation(\n  $input: UpdateClogInventoryInput!\n) {\n  updateClogInventory(input: $input) {\n    clogInventory {\n      id\n      ...InventoryDetails_inventory\n      ...InventoryForm_inventory\n    }\n  }\n}\n\nfragment InventoryDetails_inventory on ClogInventory {\n  id\n  dateAdded\n  createdAt\n  item {\n    id\n    name\n  }\n  location {\n    id\n    name\n  }\n}\n\nfragment InventoryForm_inventory on ClogInventory {\n  id\n  dateAdded\n  item {\n    id\n    name\n  }\n  location {\n    id\n    name\n  }\n}\n"
  }
};
})();

(node as any).hash = "0ab07f0a3379c22011d9faa9109790f0";

export default node;
