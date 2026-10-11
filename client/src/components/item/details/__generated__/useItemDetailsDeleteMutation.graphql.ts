/**
 * @generated SignedSource<<c8fe69b2fe13a27b1548a87bff2f85bf>>
 * @relayHash 98ebf594542cbc14e267ec86aed65220
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 98ebf594542cbc14e267ec86aed65220

import { ConcreteRequest } from 'relay-runtime';
export type DeleteClogItemInput = {
  clientMutationId?: string | null | undefined;
  id: string;
};
export type useItemDetailsDeleteMutation$variables = {
  input: DeleteClogItemInput;
};
export type useItemDetailsDeleteMutation$data = {
  readonly deleteClogItem: {
    readonly deletedId: string | null | undefined;
  } | null | undefined;
};
export type useItemDetailsDeleteMutation = {
  response: useItemDetailsDeleteMutation$data;
  variables: useItemDetailsDeleteMutation$variables;
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
    "name": "useItemDetailsDeleteMutation",
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
    "name": "useItemDetailsDeleteMutation",
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
    "cacheID": "98ebf594542cbc14e267ec86aed65220",
    "id": "98ebf594542cbc14e267ec86aed65220",
    "metadata": {},
    "name": "useItemDetailsDeleteMutation",
    "operationKind": "mutation",
    "text": "mutation useItemDetailsDeleteMutation(\n  $input: DeleteClogItemInput!\n) {\n  deleteClogItem(input: $input) {\n    deletedId\n  }\n}\n"
  }
};
})();

(node as any).hash = "f07d64e7864e9ee2356279596819ebbd";

export default node;
