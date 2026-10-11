/**
 * @generated SignedSource<<99dc3270eefa25aa3c271f57c22bf282>>
 * @relayHash e75b8e5072645b2a6f171a8bba3e89d7
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID e75b8e5072645b2a6f171a8bba3e89d7

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type StockLocationsPaginationQuery$variables = {
  count?: number | null | undefined;
  cursor?: string | null | undefined;
  item: string;
};
export type StockLocationsPaginationQuery$data = {
  readonly " $fragmentSpreads": FragmentRefs<"StockLocations_query">;
};
export type StockLocationsPaginationQuery = {
  response: StockLocationsPaginationQuery$data;
  variables: StockLocationsPaginationQuery$variables;
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
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "item"
  }
],
v1 = {
  "kind": "Variable",
  "name": "item",
  "variableName": "item"
},
v2 = [
  (v1/*:: as any*/)
],
v3 = [
  {
    "kind": "Variable",
    "name": "after",
    "variableName": "cursor"
  },
  {
    "kind": "Variable",
    "name": "first",
    "variableName": "count"
  },
  {
    "fields": (v2/*:: as any*/),
    "kind": "ObjectValue",
    "name": "where"
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "StockLocationsPaginationQuery",
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
          },
          (v1/*:: as any*/)
        ],
        "kind": "FragmentSpread",
        "name": "StockLocations_query"
      }
    ],
    "type": "RootQuery",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "StockLocationsPaginationQuery",
    "selections": [
      {
        "alias": null,
        "args": (v3/*:: as any*/),
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
                    "args": (v2/*:: as any*/),
                    "kind": "ScalarField",
                    "name": "stockCount",
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
        "args": (v3/*:: as any*/),
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
  "params": {
    "cacheID": "e75b8e5072645b2a6f171a8bba3e89d7",
    "id": "e75b8e5072645b2a6f171a8bba3e89d7",
    "metadata": {},
    "name": "StockLocationsPaginationQuery",
    "operationKind": "query",
    "text": "query StockLocationsPaginationQuery(\n  $count: Int = 25\n  $cursor: String\n  $item: ID!\n) {\n  ...StockLocations_query_3GMh1f\n}\n\nfragment StockLocations_query_3GMh1f on RootQuery {\n  clogLocationSearch(first: $count, after: $cursor, where: {item: $item}) {\n    totalCount\n    edges {\n      node {\n        id\n        name\n        stockCount(item: $item)\n        __typename\n      }\n      cursor\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "a2bb6c6bafcd20d5171e5b1534f56b1a";

export default node;
