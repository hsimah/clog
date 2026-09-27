/**
 * @generated SignedSource<<cd04195086d215fe48c83e243cfc7513>>
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
export type useInventoryDetailsDeleteMutation$variables = {
  input: DeleteClogInventoryInput;
};
export type useInventoryDetailsDeleteMutation$data = {
  readonly deleteClogInventory: {
    readonly deletedId: string | null | undefined;
  } | null | undefined;
};
export type useInventoryDetailsDeleteMutation = {
  response: useInventoryDetailsDeleteMutation$data;
  variables: useInventoryDetailsDeleteMutation$variables;
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
    "name": "useInventoryDetailsDeleteMutation",
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
    "name": "useInventoryDetailsDeleteMutation",
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
    "cacheID": "861bb1c2cd97fc9ec6f808fec5c49e18",
    "id": null,
    "metadata": {},
    "name": "useInventoryDetailsDeleteMutation",
    "operationKind": "mutation",
    "text": "mutation useInventoryDetailsDeleteMutation(\n  $input: DeleteClogInventoryInput!\n) {\n  deleteClogInventory(input: $input) {\n    deletedId\n  }\n}\n"
  }
};
})();

(node as any).hash = "9819642f12208490db826853a3f82ccd";

export default node;
