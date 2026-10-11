/**
 * @generated SignedSource<<4c3229ddf6bbf0ae370871b16ec5f8b2>>
 * @relayHash 03a593afbfa084c26103c6729b1eadfc
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 03a593afbfa084c26103c6729b1eadfc

import { ConcreteRequest } from 'relay-runtime';
export type DeleteClogLocationInput = {
  clientMutationId?: string | null | undefined;
  id: string;
};
export type useLocationDetailsDeleteMutation$variables = {
  input: DeleteClogLocationInput;
};
export type useLocationDetailsDeleteMutation$data = {
  readonly deleteClogLocation: {
    readonly deletedId: string | null | undefined;
  } | null | undefined;
};
export type useLocationDetailsDeleteMutation = {
  response: useLocationDetailsDeleteMutation$data;
  variables: useLocationDetailsDeleteMutation$variables;
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
    "name": "useLocationDetailsDeleteMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
        "concreteType": "DeleteClogLocationPayload",
        "kind": "LinkedField",
        "name": "deleteClogLocation",
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
    "name": "useLocationDetailsDeleteMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
        "concreteType": "DeleteClogLocationPayload",
        "kind": "LinkedField",
        "name": "deleteClogLocation",
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
    "cacheID": "03a593afbfa084c26103c6729b1eadfc",
    "id": "03a593afbfa084c26103c6729b1eadfc",
    "metadata": {},
    "name": "useLocationDetailsDeleteMutation",
    "operationKind": "mutation",
    "text": "mutation useLocationDetailsDeleteMutation(\n  $input: DeleteClogLocationInput!\n) {\n  deleteClogLocation(input: $input) {\n    deletedId\n  }\n}\n"
  }
};
})();

(node as any).hash = "45fa49e989ebb2e80808532f3b0e567d";

export default node;
