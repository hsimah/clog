/**
 * @generated SignedSource<<7db8ae626d3c28efa6ca01ed98bcccd2>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ItemRecordQuery$variables = {
  id: string;
};
export type ItemRecordQuery$data = {
  readonly clogItem: {
    readonly id: string;
    readonly " $fragmentSpreads": FragmentRefs<"ItemDetails_item" | "ItemForm_item">;
  } | null | undefined;
};
export type ItemRecordQuery = {
  response: ItemRecordQuery$data;
  variables: ItemRecordQuery$variables;
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
    "name": "ItemRecordQuery",
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
    "name": "ItemRecordQuery",
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
    "cacheID": "19c402919682072017ecd1fd7c4825b9",
    "id": null,
    "metadata": {},
    "name": "ItemRecordQuery",
    "operationKind": "query",
    "text": "query ItemRecordQuery(\n  $id: ID!\n) {\n  clogItem(id: $id) {\n    id\n    ...ItemDetails_item\n    ...ItemForm_item\n  }\n}\n\nfragment ItemDetails_item on ClogItem {\n  id\n  name\n  barcode\n  createdAt\n  stockCount\n}\n\nfragment ItemForm_item on ClogItem {\n  id\n  name\n  barcode\n}\n"
  }
};
})();

(node as any).hash = "a80965b77943842ad74c451bb546e5fd";

export default node;
