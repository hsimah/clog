/**
 * @generated SignedSource<<a42397b101648d13878e958cda52ccdb>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type CreateClogItemInput = {
  barcode?: string | null | undefined;
  clientMutationId?: string | null | undefined;
  name: string;
};
export type useItemFormCreateMutation$variables = {
  input: CreateClogItemInput;
};
export type useItemFormCreateMutation$data = {
  readonly createClogItem: {
    readonly clogItem: {
      readonly id: string;
      readonly " $fragmentSpreads": FragmentRefs<"ItemDetails_item" | "ItemForm_item">;
    } | null | undefined;
  } | null | undefined;
};
export type useItemFormCreateMutation = {
  response: useItemFormCreateMutation$data;
  variables: useItemFormCreateMutation$variables;
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
    "name": "useItemFormCreateMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
        "concreteType": "CreateClogItemPayload",
        "kind": "LinkedField",
        "name": "createClogItem",
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
    "name": "useItemFormCreateMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
        "concreteType": "CreateClogItemPayload",
        "kind": "LinkedField",
        "name": "createClogItem",
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
    "cacheID": "528bab8184cec96d19b282c6a41a6783",
    "id": null,
    "metadata": {},
    "name": "useItemFormCreateMutation",
    "operationKind": "mutation",
    "text": "mutation useItemFormCreateMutation(\n  $input: CreateClogItemInput!\n) {\n  createClogItem(input: $input) {\n    clogItem {\n      id\n      ...ItemDetails_item\n      ...ItemForm_item\n    }\n  }\n}\n\nfragment ItemDetails_item on ClogItem {\n  id\n  name\n  barcode\n  createdAt\n  stockCount\n}\n\nfragment ItemForm_item on ClogItem {\n  id\n  name\n  barcode\n}\n"
  }
};
})();

(node as any).hash = "a9ee5631efd5a58cc54b691535f4939e";

export default node;
