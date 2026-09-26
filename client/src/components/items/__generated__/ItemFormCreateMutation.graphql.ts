/**
 * @generated SignedSource<<4fc017ed9a898978769e0cea5a9256b6>>
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
export type ItemFormCreateMutation$variables = {
  input: CreateClogItemInput;
};
export type ItemFormCreateMutation$data = {
  readonly createClogItem: {
    readonly clogItem: {
      readonly id: string;
      readonly " $fragmentSpreads": FragmentRefs<"ItemDetails_item" | "ItemForm_item">;
    } | null | undefined;
  } | null | undefined;
};
export type ItemFormCreateMutation = {
  response: ItemFormCreateMutation$data;
  variables: ItemFormCreateMutation$variables;
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
    "name": "ItemFormCreateMutation",
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
    "name": "ItemFormCreateMutation",
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
    "cacheID": "0050546883acbcb9beb7d2169c5b4873",
    "id": null,
    "metadata": {},
    "name": "ItemFormCreateMutation",
    "operationKind": "mutation",
    "text": "mutation ItemFormCreateMutation(\n  $input: CreateClogItemInput!\n) {\n  createClogItem(input: $input) {\n    clogItem {\n      id\n      ...ItemDetails_item\n      ...ItemForm_item\n    }\n  }\n}\n\nfragment ItemDetails_item on ClogItem {\n  id\n  name\n  barcode\n  createdAt\n  stockCount\n}\n\nfragment ItemForm_item on ClogItem {\n  id\n  name\n  barcode\n}\n"
  }
};
})();

(node as any).hash = "6a99448ffd0710eba2a5d67e1c436439";

export default node;
