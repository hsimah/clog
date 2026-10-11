/**
 * @generated SignedSource<<3b8af9d9ac37f12a3e91f3a852c0c390>>
 * @relayHash 1c226492edf35a5dca00e0451ea228d6
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 1c226492edf35a5dca00e0451ea228d6

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type InventoryLocationsPaginationQuery$variables = {
  count?: number | null | undefined;
  cursor?: string | null | undefined;
};
export type InventoryLocationsPaginationQuery$data = {
  readonly " $fragmentSpreads": FragmentRefs<"InventoryLocations_query">;
};
export type InventoryLocationsPaginationQuery = {
  response: InventoryLocationsPaginationQuery$data;
  variables: InventoryLocationsPaginationQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": 25,
    "kind": "LocalArgument",
    "name": "count"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "cursor"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "after",
    "variableName": "cursor"
  },
  {
    "kind": "Variable",
    "name": "first",
    "variableName": "count"
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "InventoryLocationsPaginationQuery",
    "selections": [
      {
        "args": [
          {
            "kind": "Variable",
            "name": "count",
            "variableName": "count"
          },
          {
            "kind": "Variable",
            "name": "cursor",
            "variableName": "cursor"
          }
        ],
        "kind": "FragmentSpread",
        "name": "InventoryLocations_query"
      }
    ],
    "type": "RootQuery",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "InventoryLocationsPaginationQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
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
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "id",
                    "storageKey": null
                  },
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
        "storageKey": null
      },
      {
        "alias": null,
        "args": (v1/*:: as any*/),
        "filters": null,
        "handle": "connection",
        "key": "InventoryLocations__clogLocationSearch",
        "kind": "LinkedHandle",
        "name": "clogLocationSearch"
      }
    ]
  },
  "params": {
    "cacheID": "1c226492edf35a5dca00e0451ea228d6",
    "id": "1c226492edf35a5dca00e0451ea228d6",
    "metadata": {},
    "name": "InventoryLocationsPaginationQuery",
    "operationKind": "query",
    "text": "query InventoryLocationsPaginationQuery(\n  $count: Int = 25\n  $cursor: String\n) {\n  ...InventoryLocations_query_1G22uz\n}\n\nfragment InventoryLocations_query_1G22uz on RootQuery {\n  clogLocationSearch(first: $count, after: $cursor) {\n    edges {\n      node {\n        id\n        name\n        __typename\n      }\n      cursor\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "d3f8e62422035f9c9157c79e59cc0f11";

export default node;
