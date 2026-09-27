/**
 * @generated SignedSource<<ddd4e7f16d64ddd6c9ea09e20a4187c4>>
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
export type useLocationFormCreateMutation$variables = {
  input: CreateClogLocationInput;
};
export type useLocationFormCreateMutation$data = {
  readonly createClogLocation: {
    readonly clogLocation: {
      readonly id: string;
      readonly name: string;
      readonly " $fragmentSpreads": FragmentRefs<"LocationDetails_location" | "LocationForm_location">;
    } | null | undefined;
  } | null | undefined;
};
export type useLocationFormCreateMutation = {
  response: useLocationFormCreateMutation$data;
  variables: useLocationFormCreateMutation$variables;
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
    "name": "useLocationFormCreateMutation",
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
    "name": "useLocationFormCreateMutation",
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
    "cacheID": "3fe13cd144745e9a723ddde2004b22b2",
    "id": null,
    "metadata": {},
    "name": "useLocationFormCreateMutation",
    "operationKind": "mutation",
    "text": "mutation useLocationFormCreateMutation(\n  $input: CreateClogLocationInput!\n) {\n  createClogLocation(input: $input) {\n    clogLocation {\n      id\n      name\n      ...LocationDetails_location\n      ...LocationForm_location\n    }\n  }\n}\n\nfragment LocationDetails_location on ClogLocation {\n  id\n  name\n  createdAt\n  stockCount\n}\n\nfragment LocationForm_location on ClogLocation {\n  id\n  name\n}\n"
  }
};
})();

(node as any).hash = "39164cfb88f139db4e81f9ee62205a4c";

export default node;
