/**
 * @generated SignedSource<<1dde096eadc9a8d34bc74ff03b4ea74d>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type DeleteClogInventoryInput = {
  clientMutationId?: string | null | undefined;
  id: string;
};
export type InventoryDetailsDeleteMutation$variables = {
  input: DeleteClogInventoryInput;
};
export type InventoryDetailsDeleteMutation$data = {
  readonly deleteClogInventory: {
    readonly deletedId: string | null | undefined;
  } | null | undefined;
};
export type InventoryDetailsDeleteMutation = {
  response: InventoryDetailsDeleteMutation$data;
  variables: InventoryDetailsDeleteMutation$variables;
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
    "name": "InventoryDetailsDeleteMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
        "concreteType": "DeleteClogInventoryPayload",
        "kind": "LinkedField",
        "name": "deleteClogInventory",
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
    "name": "InventoryDetailsDeleteMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
        "concreteType": "DeleteClogInventoryPayload",
        "kind": "LinkedField",
        "name": "deleteClogInventory",
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
    "cacheID": "c592f4f739a8d0ce12b8b6f390cb5d3d",
    "id": null,
    "metadata": {},
    "name": "InventoryDetailsDeleteMutation",
    "operationKind": "mutation",
    "text": "mutation InventoryDetailsDeleteMutation(\n  $input: DeleteClogInventoryInput!\n) {\n  deleteClogInventory(input: $input) {\n    deletedId\n  }\n}\n"
  }
};
})();

(node as any).hash = "108d93801f8915c4c380c9884771c66c";

export default node;
