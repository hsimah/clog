/**
 * @generated SignedSource<<3e855b5549e6e14cbe20259fcee6faf8>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ItemPageQuery$variables = {
  id: string;
};
export type ItemPageQuery$data = {
  readonly clogItem: {
    readonly id: string;
    readonly " $fragmentSpreads": FragmentRefs<"ItemDetails_item" | "ItemForm_item">;
  } | null | undefined;
};
export type ItemPageQuery = {
  response: ItemPageQuery$data;
  variables: ItemPageQuery$variables;
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
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "ItemPageQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
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
    "type": "RootQuery",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "ItemPageQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
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
    ]
  },
  "params": {
    "cacheID": "0b817f81a2f6c104dc993c95f7a2efce",
    "id": null,
    "metadata": {},
    "name": "ItemPageQuery",
    "operationKind": "query",
    "text": "query ItemPageQuery(\n  $id: ID!\n) {\n  clogItem(id: $id) {\n    id\n    ...ItemDetails_item\n    ...ItemForm_item\n  }\n}\n\nfragment ItemDetails_item on ClogItem {\n  id\n  name\n  barcode\n  createdAt\n  stockCount\n}\n\nfragment ItemForm_item on ClogItem {\n  id\n  name\n  barcode\n}\n"
  }
};
})();

(node as any).hash = "28c0711274de44278413782234033190";

export default node;
