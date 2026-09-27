/**
 * @generated SignedSource<<dc84e731413a8fd5ebacb400898185c8>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type UpdateClogLocationInput = {
  clientMutationId?: string | null | undefined;
  id: string;
  name?: string | null | undefined;
};
export type LocationFormUpdateMutation$variables = {
  input: UpdateClogLocationInput;
};
export type LocationFormUpdateMutation$data = {
  readonly updateClogLocation: {
    readonly clogLocation: {
      readonly id: string;
      readonly name: string;
      readonly " $fragmentSpreads": FragmentRefs<"LocationDetails_location" | "LocationForm_location">;
    } | null | undefined;
  } | null | undefined;
};
export type LocationFormUpdateMutation = {
  response: LocationFormUpdateMutation$data;
  variables: LocationFormUpdateMutation$variables;
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
  "name": "id",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "LocationFormUpdateMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
        "concreteType": "UpdateClogLocationPayload",
        "kind": "LinkedField",
        "name": "updateClogLocation",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "ClogLocation",
            "kind": "LinkedField",
            "name": "clogLocation",
            "plural": false,
            "selections": [
              (v2/*:: as any*/),
              (v3/*:: as any*/),
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "LocationDetails_location"
              },
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "LocationForm_location"
              }
            ],
            "storageKey": null
          }
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
    "name": "LocationFormUpdateMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
        "concreteType": "UpdateClogLocationPayload",
        "kind": "LinkedField",
        "name": "updateClogLocation",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "ClogLocation",
            "kind": "LinkedField",
            "name": "clogLocation",
            "plural": false,
            "selections": [
              (v2/*:: as any*/),
              (v3/*:: as any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "createdAt",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "stockCount",
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "94a5d319ab59806ee086a2264e2d6b1d",
    "id": null,
    "metadata": {},
    "name": "LocationFormUpdateMutation",
    "operationKind": "mutation",
    "text": "mutation LocationFormUpdateMutation(\n  $input: UpdateClogLocationInput!\n) {\n  updateClogLocation(input: $input) {\n    clogLocation {\n      id\n      name\n      ...LocationDetails_location\n      ...LocationForm_location\n    }\n  }\n}\n\nfragment LocationDetails_location on ClogLocation {\n  id\n  name\n  createdAt\n  stockCount\n}\n\nfragment LocationForm_location on ClogLocation {\n  id\n  name\n}\n"
  }
};
})();

(node as any).hash = "4d2a44197f8a65a9ba2d9eb0fa9b19ef";

export default node;
