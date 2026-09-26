/**
 * @generated SignedSource<<95b2e05c3e4606e28874a851a3eae109>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type DeleteClogLocationInput = {
  clientMutationId?: string | null | undefined;
  id: string;
};
export type LocationDetailsDeleteMutation$variables = {
  input: DeleteClogLocationInput;
};
export type LocationDetailsDeleteMutation$data = {
  readonly deleteClogLocation: {
    readonly deletedId: string | null | undefined;
  } | null | undefined;
};
export type LocationDetailsDeleteMutation = {
  response: LocationDetailsDeleteMutation$data;
  variables: LocationDetailsDeleteMutation$variables;
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
    "name": "LocationDetailsDeleteMutation",
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
    "name": "LocationDetailsDeleteMutation",
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
    "cacheID": "79ba2077ee5310371cc98d5db6d1471a",
    "id": null,
    "metadata": {},
    "name": "LocationDetailsDeleteMutation",
    "operationKind": "mutation",
    "text": "mutation LocationDetailsDeleteMutation(\n  $input: DeleteClogLocationInput!\n) {\n  deleteClogLocation(input: $input) {\n    deletedId\n  }\n}\n"
  }
};
})();

(node as any).hash = "93cb32c211aac3505d2b904460a126ce";

export default node;
