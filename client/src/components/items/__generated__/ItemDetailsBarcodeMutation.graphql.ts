/**
 * @generated SignedSource<<41536e41a71a27e266553264a79eabc0>>
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
export type ItemDetailsBarcodeMutation$variables = {
  input: UpdateClogItemInput;
};
export type ItemDetailsBarcodeMutation$data = {
  readonly updateClogItem: {
    readonly clogItem: {
      readonly " $fragmentSpreads": FragmentRefs<"ItemDetails_item">;
    } | null | undefined;
  } | null | undefined;
};
export type ItemDetailsBarcodeMutation = {
  response: ItemDetailsBarcodeMutation$data;
  variables: ItemDetailsBarcodeMutation$variables;
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
    "name": "ItemDetailsBarcodeMutation",
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
    "name": "ItemDetailsBarcodeMutation",
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
    "cacheID": "4ad3dc399b78f676b779fdfc9039da87",
    "id": null,
    "metadata": {},
    "name": "ItemDetailsBarcodeMutation",
    "operationKind": "mutation",
    "text": "mutation ItemDetailsBarcodeMutation(\n  $input: UpdateClogItemInput!\n) {\n  updateClogItem(input: $input) {\n    clogItem {\n      ...ItemDetails_item\n      id\n    }\n  }\n}\n\nfragment ItemDetails_item on ClogItem {\n  id\n  name\n  barcode\n  createdAt\n  stockCount\n}\n"
  }
};
})();

(node as any).hash = "6036d7436027890c3f6d18124fccdbde";

export default node;
