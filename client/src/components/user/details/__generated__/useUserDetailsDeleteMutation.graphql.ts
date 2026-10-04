/**
 * @generated SignedSource<<2005af3fad32b5ccce8af0d7d8bc786e>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type DeleteClogUserInput = {
  clientMutationId?: string | null | undefined;
  id: string;
};
export type useUserDetailsDeleteMutation$variables = {
  input: DeleteClogUserInput;
};
export type useUserDetailsDeleteMutation$data = {
  readonly deleteClogUser: {
    readonly deletedId: string;
  } | null | undefined;
};
export type useUserDetailsDeleteMutation = {
  response: useUserDetailsDeleteMutation$data;
  variables: useUserDetailsDeleteMutation$variables;
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
    "name": "useUserDetailsDeleteMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
        "concreteType": "DeleteClogUserPayload",
        "kind": "LinkedField",
        "name": "deleteClogUser",
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
    "name": "useUserDetailsDeleteMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
        "concreteType": "DeleteClogUserPayload",
        "kind": "LinkedField",
        "name": "deleteClogUser",
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
    "cacheID": "9c359a89d6da5f6b704b57a4b17561ee",
    "id": null,
    "metadata": {},
    "name": "useUserDetailsDeleteMutation",
    "operationKind": "mutation",
    "text": "mutation useUserDetailsDeleteMutation(\n  $input: DeleteClogUserInput!\n) {\n  deleteClogUser(input: $input) {\n    deletedId\n  }\n}\n"
  }
};
})();

(node as any).hash = "4000f6cfb5fb5ca5ac2c1c12d5843e03";

export default node;
