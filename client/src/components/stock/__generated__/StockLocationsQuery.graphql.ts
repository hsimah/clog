/**
 * @generated SignedSource<<ecf3d69ce15705dcb0655b5b62e1c6e1>>
 * @relayHash 4181f7021271b87f77371a477eff363d
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 4181f7021271b87f77371a477eff363d

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type StockLocationsQuery$variables = {
  filtered: boolean;
  item: string;
  location: string;
};
export type StockLocationsQuery$data = {
  readonly allLocations?: {
    readonly " $fragmentSpreads": FragmentRefs<"StockLocations_query">;
  } | null | undefined;
  readonly clogLocation?: {
    readonly id: string;
    readonly name: string;
    readonly stockCount: number;
  } | null | undefined;
};
export type StockLocationsQuery = {
  response: StockLocationsQuery$data;
  variables: StockLocationsQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "filtered"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "item"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "location"
},
v3 = [
  {
    "kind": "Variable",
    "name": "item",
    "variableName": "item"
  }
],
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": (v3/*:: as any*/),
  "kind": "ScalarField",
  "name": "stockCount",
  "storageKey": null
},
v7 = {
  "condition": "filtered",
  "kind": "Condition",
  "passingValue": true,
  "selections": [
    {
      "alias": null,
      "args": [
        {
          "kind": "Variable",
          "name": "id",
          "variableName": "location"
        }
      ],
      "concreteType": "ClogLocation",
      "kind": "LinkedField",
      "name": "clogLocation",
      "plural": false,
      "selections": [
        (v4/*:: as any*/),
        (v5/*:: as any*/),
        (v6/*:: as any*/)
      ],
      "storageKey": null
    }
  ]
},
v8 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 25
  },
  {
    "fields": (v3/*:: as any*/),
    "kind": "ObjectValue",
    "name": "where"
  }
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*:: as any*/),
      (v1/*:: as any*/),
      (v2/*:: as any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "StockLocationsQuery",
    "selections": [
      {
        "condition": "filtered",
        "kind": "Condition",
        "passingValue": false,
        "selections": [
          {
            "fragment": {
              "kind": "InlineFragment",
              "selections": [
                {
                  "args": (v3/*:: as any*/),
                  "kind": "FragmentSpread",
                  "name": "StockLocations_query"
                }
              ],
              "type": "RootQuery",
              "abstractKey": null
            },
            "kind": "AliasedInlineFragmentSpread",
            "name": "allLocations"
          }
        ]
      },
      (v7/*:: as any*/)
    ],
    "type": "RootQuery",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*:: as any*/),
      (v2/*:: as any*/),
      (v0/*:: as any*/)
    ],
    "kind": "Operation",
    "name": "StockLocationsQuery",
    "selections": [
      {
        "condition": "filtered",
        "kind": "Condition",
        "passingValue": false,
        "selections": [
          {
            "alias": null,
            "args": (v8/*:: as any*/),
            "concreteType": "RootQueryToClogLocationSearchConnection",
            "kind": "LinkedField",
            "name": "clogLocationSearch",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "totalCount",
                "storageKey": null
              },
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
                      (v4/*:: as any*/),
                      (v5/*:: as any*/),
                      (v6/*:: as any*/),
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
            "args": (v8/*:: as any*/),
            "filters": [
              "where"
            ],
            "handle": "connection",
            "key": "StockLocations__clogLocationSearch",
            "kind": "LinkedHandle",
            "name": "clogLocationSearch"
          }
        ]
      },
      (v7/*:: as any*/)
    ]
  },
  "params": {
    "cacheID": "4181f7021271b87f77371a477eff363d",
    "id": "4181f7021271b87f77371a477eff363d",
    "metadata": {},
    "name": "StockLocationsQuery",
    "operationKind": "query",
    "text": "query StockLocationsQuery(\n  $item: ID!\n  $location: ID!\n  $filtered: Boolean!\n) {\n  ...StockLocations_query_ZN5nG @skip(if: $filtered)\n  clogLocation(id: $location) @include(if: $filtered) {\n    id\n    name\n    stockCount(item: $item)\n  }\n}\n\nfragment StockLocations_query_ZN5nG on RootQuery {\n  clogLocationSearch(first: 25, where: {item: $item}) {\n    totalCount\n    edges {\n      node {\n        id\n        name\n        stockCount(item: $item)\n        __typename\n      }\n      cursor\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "8f1ed6ac844e2800497945e99bfaa46c";

export default node;
