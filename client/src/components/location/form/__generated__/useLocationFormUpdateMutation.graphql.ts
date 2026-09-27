/**
 * @generated SignedSource<<419c6edf13ee3ad4749f747bd5b1f28a>>
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
export type useLocationFormUpdateMutation$variables = {
  input: UpdateClogLocationInput;
};
export type useLocationFormUpdateMutation$data = {
  readonly updateClogLocation: {
    readonly clogLocation: {
      readonly id: string;
      readonly name: string;
      readonly " $fragmentSpreads": FragmentRefs<"LocationDetails_location" | "LocationForm_location">;
    } | null | undefined;
  } | null | undefined;
};
export type useLocationFormUpdateMutation = {
  response: useLocationFormUpdateMutation$data;
  variables: useLocationFormUpdateMutation$variables;
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
    "name": "useLocationFormUpdateMutation",
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
    "name": "useLocationFormUpdateMutation",
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
    "cacheID": "b83004f1a8a318f3f954236ff293d178",
    "id": null,
    "metadata": {},
    "name": "useLocationFormUpdateMutation",
    "operationKind": "mutation",
    "text": "mutation useLocationFormUpdateMutation(\n  $input: UpdateClogLocationInput!\n) {\n  updateClogLocation(input: $input) {\n    clogLocation {\n      id\n      name\n      ...LocationDetails_location\n      ...LocationForm_location\n    }\n  }\n}\n\nfragment LocationDetails_location on ClogLocation {\n  id\n  name\n  createdAt\n  stockCount\n}\n\nfragment LocationForm_location on ClogLocation {\n  id\n  name\n}\n"
  }
};
})();

(node as any).hash = "671e0a7d41c4d6e508d8c4de6f8974a6";

export default node;
