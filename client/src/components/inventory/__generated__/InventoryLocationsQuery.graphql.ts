/**
 * @generated SignedSource<<ce2b10c80fdc89ad623bb02f1a5b9fd7>>
 * @relayHash 7c37b01e68965cb092585200c2c74477
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 7c37b01e68965cb092585200c2c74477

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type InventoryLocationsQuery$variables = {
  id: string;
  selected: boolean;
};
export type InventoryLocationsQuery$data = {
  readonly clogLocation?: {
    readonly id: string;
    readonly name: string;
  } | null | undefined;
  readonly " $fragmentSpreads": FragmentRefs<"InventoryLocations_query">;
};
export type InventoryLocationsQuery = {
  response: InventoryLocationsQuery$data;
  variables: InventoryLocationsQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "selected"
  }
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v3 = {
  "condition": "selected",
  "kind": "Condition",
  "passingValue": true,
  "selections": [
    {
      "alias": null,
      "args": [
        {
          "kind": "Variable",
          "name": "id",
          "variableName": "id"
        }
      ],
      "concreteType": "ClogLocation",
      "kind": "LinkedField",
      "name": "clogLocation",
      "plural": false,
      "selections": [
        (v1/*:: as any*/),
        (v2/*:: as any*/)
      ],
      "storageKey": null
    }
  ]
},
v4 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 25
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "InventoryLocationsQuery",
    "selections": [
      {
        "args": null,
        "kind": "FragmentSpread",
        "name": "InventoryLocations_query"
      },
      (v3/*:: as any*/)
    ],
    "type": "RootQuery",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "InventoryLocationsQuery",
    "selections": [
      {
        "alias": null,
        "args": (v4/*:: as any*/),
        "concreteType": "RootQueryToClogLocationSearchConnection",
        "kind": "LinkedField",
        "name": "clogLocationSearch",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "RootQueryToClogLocationSearchConnectionEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "ClogLocation",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  (v1/*:: as any*/),
                  (v2/*:: as any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "__typename",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "cursor",
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "PageInfo",
            "kind": "LinkedField",
            "name": "pageInfo",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "endCursor",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "hasNextPage",
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": "clogLocationSearch(first:25)"
      },
      {
        "alias": null,
        "args": (v4/*:: as any*/),
        "filters": null,
        "handle": "connection",
        "key": "InventoryLocations__clogLocationSearch",
        "kind": "LinkedHandle",
        "name": "clogLocationSearch"
      },
      (v3/*:: as any*/)
    ]
  },
  "params": {
    "cacheID": "7c37b01e68965cb092585200c2c74477",
    "id": "7c37b01e68965cb092585200c2c74477",
    "metadata": {},
    "name": "InventoryLocationsQuery",
    "operationKind": "query",
    "text": "query InventoryLocationsQuery(\n  $id: ID!\n  $selected: Boolean!\n) {\n  ...InventoryLocations_query\n  clogLocation(id: $id) @include(if: $selected) {\n    id\n    name\n  }\n}\n\nfragment InventoryLocations_query on RootQuery {\n  clogLocationSearch(first: 25) {\n    edges {\n      node {\n        id\n        name\n        __typename\n      }\n      cursor\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "c4d2e72e9b3be728d6e4ffd83548b79e";

export default node;
