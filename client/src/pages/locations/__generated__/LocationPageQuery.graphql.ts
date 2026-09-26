/**
 * @generated SignedSource<<c16c778fc1a6cd8c824f67496d29a683>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type LocationPageQuery$variables = {
  id: string;
};
export type LocationPageQuery$data = {
  readonly clogLocation: {
    readonly id: string;
    readonly " $fragmentSpreads": FragmentRefs<"LocationDetails_location" | "LocationForm_location">;
  } | null | undefined;
};
export type LocationPageQuery = {
  response: LocationPageQuery$data;
  variables: LocationPageQuery$variables;
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
    "name": "LocationPageQuery",
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
    "name": "LocationPageQuery",
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
    "cacheID": "62af18423437635c139610be4b104567",
    "id": null,
    "metadata": {},
    "name": "LocationPageQuery",
    "operationKind": "query",
    "text": "query LocationPageQuery(\n  $id: ID!\n) {\n  clogLocation(id: $id) {\n    id\n    ...LocationDetails_location\n    ...LocationForm_location\n  }\n}\n\nfragment LocationDetails_location on ClogLocation {\n  id\n  name\n  createdAt\n  stockCount\n}\n\nfragment LocationForm_location on ClogLocation {\n  id\n  name\n}\n"
  }
};
})();

(node as any).hash = "822186b9d7b7b387acf60e94cf7b8a9f";

export default node;
