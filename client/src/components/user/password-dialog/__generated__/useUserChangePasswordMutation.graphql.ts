/**
 * @generated SignedSource<<1e436178691f9c9895ed52ca5e9a83bd>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ChangeClogUserPasswordInput = {
  clientMutationId?: string | null | undefined;
  currentPassword: string;
  id: string;
  newPassword: string;
};
export type useUserChangePasswordMutation$variables = {
  input: ChangeClogUserPasswordInput;
};
export type useUserChangePasswordMutation$data = {
  readonly changeClogUserPassword: {
    readonly clogUser: {
      readonly id: string;
    };
  } | null | undefined;
};
export type useUserChangePasswordMutation = {
  response: useUserChangePasswordMutation$data;
  variables: useUserChangePasswordMutation$variables;
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
    "concreteType": "ChangeClogUserPasswordPayload",
    "kind": "LinkedField",
    "name": "changeClogUserPassword",
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
    "name": "useUserChangePasswordMutation",
    "selections": (v1/*:: as any*/),
    "type": "RootMutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "useUserChangePasswordMutation",
    "selections": (v1/*:: as any*/)
  },
  "params": {
    "cacheID": "77bab62f6fae20eb6f8f53ccc3e1f0d0",
    "id": null,
    "metadata": {},
    "name": "useUserChangePasswordMutation",
    "operationKind": "mutation",
    "text": "mutation useUserChangePasswordMutation(\n  $input: ChangeClogUserPasswordInput!\n) {\n  changeClogUserPassword(input: $input) {\n    clogUser {\n      id\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "0be5b9204da18b8679538348f1290694";

export default node;
