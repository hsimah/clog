/**
 * @generated SignedSource<<1a424d92e5a6793391f3c277ad2a7fb5>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type DeleteClogItemInput = {
  clientMutationId?: string | null | undefined;
  id: string;
};
export type ItemDetailsDeleteMutation$variables = {
  input: DeleteClogItemInput;
};
export type ItemDetailsDeleteMutation$data = {
  readonly deleteClogItem: {
    readonly deletedId: string | null | undefined;
  } | null | undefined;
};
export type ItemDetailsDeleteMutation = {
  response: ItemDetailsDeleteMutation$data;
  variables: ItemDetailsDeleteMutation$variables;
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
  "name": "deletedId",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "ItemDetailsDeleteMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
        "concreteType": "DeleteClogItemPayload",
        "kind": "LinkedField",
        "name": "deleteClogItem",
        "plural": false,
        "selections": [
          (v2/*:: as any*/)
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
    "name": "ItemDetailsDeleteMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
        "concreteType": "DeleteClogItemPayload",
        "kind": "LinkedField",
        "name": "deleteClogItem",
        "plural": false,
        "selections": [
          (v2/*:: as any*/),
          {
            "alias": null,
            "args": null,
            "filters": null,
            "handle": "deleteRecord",
            "key": "",
            "kind": "ScalarHandle",
            "name": "deletedId"
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "4d41692b473da99c5162e6687a0ac50b",
    "id": null,
    "metadata": {},
    "name": "ItemDetailsDeleteMutation",
    "operationKind": "mutation",
    "text": "mutation ItemDetailsDeleteMutation(\n  $input: DeleteClogItemInput!\n) {\n  deleteClogItem(input: $input) {\n    deletedId\n  }\n}\n"
  }
};
})();

(node as any).hash = "55a42a43d414039c146fb6b545732041";

export default node;
