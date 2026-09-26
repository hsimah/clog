/**
 * @generated SignedSource<<162b91556134824ecdf865cef212ab08>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type CreateClogLocationInput = {
  clientMutationId?: string | null | undefined;
  name: string;
};
export type LocationFormCreateMutation$variables = {
  input: CreateClogLocationInput;
};
export type LocationFormCreateMutation$data = {
  readonly createClogLocation: {
    readonly clogLocation: {
      readonly id: string;
      readonly name: string;
      readonly " $fragmentSpreads": FragmentRefs<"LocationDetails_location" | "LocationForm_location">;
    } | null | undefined;
  } | null | undefined;
};
export type LocationFormCreateMutation = {
  response: LocationFormCreateMutation$data;
  variables: LocationFormCreateMutation$variables;
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
    "name": "LocationFormCreateMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
        "concreteType": "CreateClogLocationPayload",
        "kind": "LinkedField",
        "name": "createClogLocation",
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
    "name": "LocationFormCreateMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
        "concreteType": "CreateClogLocationPayload",
        "kind": "LinkedField",
        "name": "createClogLocation",
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
    "cacheID": "045c6971edad8e0fe80b34e39d504e93",
    "id": null,
    "metadata": {},
    "name": "LocationFormCreateMutation",
    "operationKind": "mutation",
    "text": "mutation LocationFormCreateMutation(\n  $input: CreateClogLocationInput!\n) {\n  createClogLocation(input: $input) {\n    clogLocation {\n      id\n      name\n      ...LocationDetails_location\n      ...LocationForm_location\n    }\n  }\n}\n\nfragment LocationDetails_location on ClogLocation {\n  id\n  name\n  createdAt\n  stockCount\n}\n\nfragment LocationForm_location on ClogLocation {\n  id\n  name\n}\n"
  }
};
})();

(node as any).hash = "ca4939d64e8b20b025003ceead0bd5a5";

export default node;
