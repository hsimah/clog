/**
 * @generated SignedSource<<87d4cc0a313d0166aa28bd5b39751f8e>>
 * @relayHash da216d8c76e24cd763bf5fb7e003c98d
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID da216d8c76e24cd763bf5fb7e003c98d

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type UpdateClogItemInput = {
  barcode?: string | null | undefined;
  clientMutationId?: string | null | undefined;
  id: string;
  name?: string | null | undefined;
};
export type useItemFormUpdateMutation$variables = {
  input: UpdateClogItemInput;
};
export type useItemFormUpdateMutation$data = {
  readonly updateClogItem: {
    readonly clogItem: {
      readonly id: string;
      readonly " $fragmentSpreads": FragmentRefs<"ItemDetails_item" | "ItemForm_item">;
    } | null | undefined;
  } | null | undefined;
};
export type useItemFormUpdateMutation = {
  response: useItemFormUpdateMutation$data;
  variables: useItemFormUpdateMutation$variables;
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
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "useItemFormUpdateMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
        "concreteType": "UpdateClogItemPayload",
        "kind": "LinkedField",
        "name": "updateClogItem",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "ClogItem",
            "kind": "LinkedField",
            "name": "clogItem",
            "plural": false,
            "selections": [
              (v2/*:: as any*/),
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "ItemDetails_item"
              },
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "ItemForm_item"
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
    "name": "useItemFormUpdateMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
        "concreteType": "UpdateClogItemPayload",
        "kind": "LinkedField",
        "name": "updateClogItem",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "ClogItem",
            "kind": "LinkedField",
            "name": "clogItem",
            "plural": false,
            "selections": [
              (v2/*:: as any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "name",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "barcode",
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
                "kind": "ScalarField",
                "name": "stockCount",
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
    "cacheID": "da216d8c76e24cd763bf5fb7e003c98d",
    "id": "da216d8c76e24cd763bf5fb7e003c98d",
    "metadata": {},
    "name": "useItemFormUpdateMutation",
    "operationKind": "mutation",
    "text": "mutation useItemFormUpdateMutation(\n  $input: UpdateClogItemInput!\n) {\n  updateClogItem(input: $input) {\n    clogItem {\n      id\n      ...ItemDetails_item\n      ...ItemForm_item\n    }\n  }\n}\n\nfragment ItemDetails_item on ClogItem {\n  id\n  name\n  barcode\n  createdAt\n  stockCount\n}\n\nfragment ItemForm_item on ClogItem {\n  id\n  name\n  barcode\n}\n"
  }
};
})();

(node as any).hash = "164616f637d0cad01ed7f9e0a0a9c4e2";

export default node;
