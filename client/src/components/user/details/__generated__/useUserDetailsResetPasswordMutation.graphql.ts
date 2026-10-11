/**
 * @generated SignedSource<<c5dde417fe2ccbdc17950938443e8be5>>
 * @relayHash f48e0529e28a39b5c6091ad31ed24e83
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID f48e0529e28a39b5c6091ad31ed24e83

import { ConcreteRequest } from 'relay-runtime';
export type ResetClogUserPasswordInput = {
  clientMutationId?: string | null | undefined;
  id: string;
  newPassword: string;
};
export type useUserDetailsResetPasswordMutation$variables = {
  input: ResetClogUserPasswordInput;
};
export type useUserDetailsResetPasswordMutation$data = {
  readonly resetClogUserPassword: {
    readonly clogUser: {
      readonly id: string;
    };
  } | null | undefined;
};
export type useUserDetailsResetPasswordMutation = {
  response: useUserDetailsResetPasswordMutation$data;
  variables: useUserDetailsResetPasswordMutation$variables;
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
    "concreteType": "ResetClogUserPasswordPayload",
    "kind": "LinkedField",
    "name": "resetClogUserPassword",
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
    "name": "useUserDetailsResetPasswordMutation",
    "selections": (v1/*:: as any*/),
    "type": "RootMutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "useUserDetailsResetPasswordMutation",
    "selections": (v1/*:: as any*/)
  },
  "params": {
    "cacheID": "f48e0529e28a39b5c6091ad31ed24e83",
    "id": "f48e0529e28a39b5c6091ad31ed24e83",
    "metadata": {},
    "name": "useUserDetailsResetPasswordMutation",
    "operationKind": "mutation",
    "text": "mutation useUserDetailsResetPasswordMutation(\n  $input: ResetClogUserPasswordInput!\n) {\n  resetClogUserPassword(input: $input) {\n    clogUser {\n      id\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "d11d9a7ecf0fc584cb0a76cbfaa6b32a";

export default node;
