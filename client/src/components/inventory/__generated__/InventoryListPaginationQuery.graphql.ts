/**
 * @generated SignedSource<<31035221300c4d9b0dcb503a2b8b43de>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type InventoryListPaginationQuery$variables = {
  count?: number | null | undefined;
  cursor?: string | null | undefined;
  location?: string | null | undefined;
  term?: string | null | undefined;
};
export type InventoryListPaginationQuery$data = {
  readonly " $fragmentSpreads": FragmentRefs<"InventoryList_query">;
};
export type InventoryListPaginationQuery = {
  response: InventoryListPaginationQuery$data;
  variables: InventoryListPaginationQuery$variables;
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
    "name": "location"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "term"
  }
],
v1 = {
  "kind": "Variable",
  "name": "location",
  "variableName": "location"
},
v2 = {
  "kind": "Variable",
  "name": "term",
  "variableName": "term"
},
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
    "fields": [
      (v1/*:: as any*/),
      (v2/*:: as any*/)
    ],
    "kind": "ObjectValue",
    "name": "where"
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "InventoryListPaginationQuery",
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
          (v1/*:: as any*/),
          (v2/*:: as any*/)
        ],
        "kind": "FragmentSpread",
        "name": "InventoryList_query"
      }
    ],
    "type": "RootQuery",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "InventoryListPaginationQuery",
    "selections": [
      {
        "alias": null,
        "args": (v3/*:: as any*/),
        "concreteType": "RootQueryToClogStockedItemsConnection",
        "kind": "LinkedField",
        "name": "clogStockedItems",
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
            "concreteType": "RootQueryToClogStockedItemsConnectionEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "ClogItem",
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
                    "args": [
                      (v1/*:: as any*/)
                    ],
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
            "concreteType": "RootQueryToClogStockedItemsConnectionPageInfo",
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
        "key": "InventoryList__clogStockedItems",
        "kind": "LinkedHandle",
        "name": "clogStockedItems"
      }
    ]
  },
  "params": {
    "cacheID": "0f6ed5b13431bc5c6dd8139a0d04e354",
    "id": null,
    "metadata": {},
    "name": "InventoryListPaginationQuery",
    "operationKind": "query",
    "text": "query InventoryListPaginationQuery(\n  $count: Int = 25\n  $cursor: String\n  $location: ID\n  $term: String\n) {\n  ...InventoryList_query_3fLU7O\n}\n\nfragment InventoryList_query_3fLU7O on RootQuery {\n  clogStockedItems(first: $count, after: $cursor, where: {term: $term, location: $location}) {\n    totalCount\n    edges {\n      node {\n        id\n        name\n        stockCount(location: $location)\n        __typename\n      }\n      cursor\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "0bf7be05b09d6ea7c6146ec978dc3de2";

export default node;
