/**
 * @generated SignedSource<<c368268c8be0c3043f58465ac0756f75>>
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
export type ItemFormUpdateMutation$variables = {
  input: UpdateClogItemInput;
};
export type ItemFormUpdateMutation$data = {
  readonly updateClogItem: {
    readonly clogItem: {
      readonly id: string;
      readonly " $fragmentSpreads": FragmentRefs<"ItemDetails_item" | "ItemForm_item">;
    } | null | undefined;
  } | null | undefined;
};
export type ItemFormUpdateMutation = {
  response: ItemFormUpdateMutation$data;
  variables: ItemFormUpdateMutation$variables;
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
    "name": "ItemFormUpdateMutation",
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
    "name": "ItemFormUpdateMutation",
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
    "cacheID": "daddf6f15e9804385bd615669f2c8d88",
    "id": null,
    "metadata": {},
    "name": "ItemFormUpdateMutation",
    "operationKind": "mutation",
    "text": "mutation ItemFormUpdateMutation(\n  $input: UpdateClogItemInput!\n) {\n  updateClogItem(input: $input) {\n    clogItem {\n      id\n      ...ItemDetails_item\n      ...ItemForm_item\n    }\n  }\n}\n\nfragment ItemDetails_item on ClogItem {\n  id\n  name\n  barcode\n  createdAt\n  stockCount\n}\n\nfragment ItemForm_item on ClogItem {\n  id\n  name\n  barcode\n}\n"
  }
};
})();

(node as any).hash = "2867c183c6171acec501bf38e75d9065";

export default node;
