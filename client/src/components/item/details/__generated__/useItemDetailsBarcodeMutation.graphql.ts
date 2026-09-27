/**
 * @generated SignedSource<<88110db199839421b8c75f00d5d23b13>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type UpdateClogItemInput = {
  barcode?: string | null | undefined;
  clientMutationId?: string | null | undefined;
  id: string;
  name?: string | null | undefined;
};
export type useItemDetailsBarcodeMutation$variables = {
  input: UpdateClogItemInput;
};
export type useItemDetailsBarcodeMutation$data = {
  readonly updateClogItem: {
    readonly clogItem: {
      readonly " $fragmentSpreads": FragmentRefs<"ItemDetails_item">;
    } | null | undefined;
  } | null | undefined;
};
export type useItemDetailsBarcodeMutation = {
  response: useItemDetailsBarcodeMutation$data;
  variables: useItemDetailsBarcodeMutation$variables;
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
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "useItemDetailsBarcodeMutation",
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
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "ItemDetails_item"
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
    "name": "useItemDetailsBarcodeMutation",
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
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "id",
                "storageKey": null
              },
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
    "cacheID": "0a649da4a3c340339c326f55f667f11a",
    "id": null,
    "metadata": {},
    "name": "useItemDetailsBarcodeMutation",
    "operationKind": "mutation",
    "text": "mutation useItemDetailsBarcodeMutation(\n  $input: UpdateClogItemInput!\n) {\n  updateClogItem(input: $input) {\n    clogItem {\n      ...ItemDetails_item\n      id\n    }\n  }\n}\n\nfragment ItemDetails_item on ClogItem {\n  id\n  name\n  barcode\n  createdAt\n  stockCount\n}\n"
  }
};
})();

(node as any).hash = "165b30f1cab70dec7ebc6694349df01c";

export default node;
