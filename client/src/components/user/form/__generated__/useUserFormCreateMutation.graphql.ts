/**
 * @generated SignedSource<<410abe436dafaf561745feacc15483c1>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ClogUserRole = "EDITOR" | "READER" | "%future added value";
export type CreateClogUserInput = {
  clientMutationId?: string | null | undefined;
  isAdmin: boolean;
  password: string;
  role: ClogUserRole;
  username: string;
};
export type useUserFormCreateMutation$variables = {
  input: CreateClogUserInput;
};
export type useUserFormCreateMutation$data = {
  readonly createClogUser: {
    readonly clogUser: {
      readonly id: string;
    };
  } | null | undefined;
};
export type useUserFormCreateMutation = {
  response: useUserFormCreateMutation$data;
  variables: useUserFormCreateMutation$variables;
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
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "input",
        "variableName": "input"
      }
    ],
    "concreteType": "CreateClogUserPayload",
    "kind": "LinkedField",
    "name": "createClogUser",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "ClogUser",
        "kind": "LinkedField",
        "name": "clogUser",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "useUserFormCreateMutation",
    "selections": (v1/*:: as any*/),
    "type": "RootMutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "useUserFormCreateMutation",
    "selections": (v1/*:: as any*/)
  },
  "params": {
    "cacheID": "7cfb4d63754cd2ce74803b4f559268fc",
    "id": null,
    "metadata": {},
    "name": "useUserFormCreateMutation",
    "operationKind": "mutation",
    "text": "mutation useUserFormCreateMutation(\n  $input: CreateClogUserInput!\n) {\n  createClogUser(input: $input) {\n    clogUser {\n      id\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "f24e1c63e5c3a0f1dcd9bd0a3c734aad";

export default node;
