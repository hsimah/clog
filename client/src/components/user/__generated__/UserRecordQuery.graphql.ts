/**
 * @generated SignedSource<<47c501bbaf69114277ec59187460dbeb>>
 * @relayHash 89934d3b3a3b6a0f06e89798bf310c3a
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 89934d3b3a3b6a0f06e89798bf310c3a

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type UserRecordQuery$variables = {
  id: string;
};
export type UserRecordQuery$data = {
  readonly clogUser: {
    readonly id: string;
    readonly " $fragmentSpreads": FragmentRefs<"UserDetails_user">;
  } | null | undefined;
};
export type UserRecordQuery = {
  response: UserRecordQuery$data;
  variables: UserRecordQuery$variables;
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
    "name": "UserRecordQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
        "concreteType": "ClogUser",
        "kind": "LinkedField",
        "name": "clogUser",
        "plural": false,
        "selections": [
          (v2/*:: as any*/),
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "UserDetails_user"
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
    "name": "UserRecordQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
        "concreteType": "ClogUser",
        "kind": "LinkedField",
        "name": "clogUser",
        "plural": false,
        "selections": [
          (v2/*:: as any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "username",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "role",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "isAdmin",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "isEnabled",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "isViewer",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "89934d3b3a3b6a0f06e89798bf310c3a",
    "id": "89934d3b3a3b6a0f06e89798bf310c3a",
    "metadata": {},
    "name": "UserRecordQuery",
    "operationKind": "query",
    "text": "query UserRecordQuery(\n  $id: ID!\n) {\n  clogUser(id: $id) {\n    id\n    ...UserDetails_user\n  }\n}\n\nfragment UserDetails_user on ClogUser {\n  id\n  username\n  role\n  isAdmin\n  isEnabled\n  isViewer\n}\n"
  }
};
})();

(node as any).hash = "9da9b6ba85f5c1fbc0ec2206a2b5a5c2";

export default node;
