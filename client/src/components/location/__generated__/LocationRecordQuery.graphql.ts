/**
 * @generated SignedSource<<7c3f2b16cbb5418126c96450f1854504>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type LocationRecordQuery$variables = {
  id: string;
};
export type LocationRecordQuery$data = {
  readonly clogLocation: {
    readonly id: string;
    readonly " $fragmentSpreads": FragmentRefs<"LocationDetails_location" | "LocationForm_location">;
  } | null | undefined;
};
export type LocationRecordQuery = {
  response: LocationRecordQuery$data;
  variables: LocationRecordQuery$variables;
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
    "name": "LocationRecordQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
        "concreteType": "ClogLocation",
        "kind": "LinkedField",
        "name": "clogLocation",
        "plural": false,
        "selections": [
          (v2/*:: as any*/),
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
    "type": "RootQuery",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "LocationRecordQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
        "concreteType": "ClogLocation",
        "kind": "LinkedField",
        "name": "clogLocation",
        "plural": false,
        "selections": [
          (v2/*:: as any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "name",
            "storageKey": null
          },
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
    ]
  },
  "params": {
    "cacheID": "124d2cdad58d6ef5a1ad1dcd2856c776",
    "id": null,
    "metadata": {},
    "name": "LocationRecordQuery",
    "operationKind": "query",
    "text": "query LocationRecordQuery(\n  $id: ID!\n) {\n  clogLocation(id: $id) {\n    id\n    ...LocationDetails_location\n    ...LocationForm_location\n  }\n}\n\nfragment LocationDetails_location on ClogLocation {\n  id\n  name\n  createdAt\n  stockCount\n}\n\nfragment LocationForm_location on ClogLocation {\n  id\n  name\n}\n"
  }
};
})();

(node as any).hash = "4a04d142fe29696a347f995d56391f78";

export default node;
