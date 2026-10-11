/**
 * @generated SignedSource<<26fd93e5ed3a94c6392acbd43da80aec>>
 * @relayHash c576594a9f4ac233f089194939426a38
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID c576594a9f4ac233f089194939426a38

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type StockSelectionPaginationQuery$variables = {
  count?: number | null | undefined;
  cursor?: string | null | undefined;
  item: string;
  location?: string | null | undefined;
};
export type StockSelectionPaginationQuery$data = {
  readonly " $fragmentSpreads": FragmentRefs<"StockSelection_query">;
};
export type StockSelectionPaginationQuery = {
  response: StockSelectionPaginationQuery$data;
  variables: StockSelectionPaginationQuery$variables;
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
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "location"
  }
],
v1 = {
  "kind": "Variable",
  "name": "item",
  "variableName": "item"
},
v2 = {
  "kind": "Variable",
  "name": "location",
  "variableName": "location"
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
],
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v5 = [
  (v4/*:: as any*/),
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "name",
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "StockSelectionPaginationQuery",
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
        "name": "StockSelection_query"
      }
    ],
    "type": "RootQuery",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "StockSelectionPaginationQuery",
    "selections": [
      {
        "alias": null,
        "args": (v3/*:: as any*/),
        "concreteType": "RootQueryToClogInventorySearchConnection",
        "kind": "LinkedField",
        "name": "clogInventorySearch",
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
            "concreteType": "RootQueryToClogInventorySearchConnectionEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "ClogInventory",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  (v4/*:: as any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "dateAdded",
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
                    "concreteType": "ClogItem",
                    "kind": "LinkedField",
                    "name": "item",
                    "plural": false,
                    "selections": (v5/*:: as any*/),
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "ClogLocation",
                    "kind": "LinkedField",
                    "name": "location",
                    "plural": false,
                    "selections": (v5/*:: as any*/),
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
        "key": "StockSelection__clogInventorySearch",
        "kind": "LinkedHandle",
        "name": "clogInventorySearch"
      }
    ]
  },
  "params": {
    "cacheID": "c576594a9f4ac233f089194939426a38",
    "id": "c576594a9f4ac233f089194939426a38",
    "metadata": {},
    "name": "StockSelectionPaginationQuery",
    "operationKind": "query",
    "text": "query StockSelectionPaginationQuery(\n  $count: Int = 25\n  $cursor: String\n  $item: ID!\n  $location: ID\n) {\n  ...StockSelection_query_LhK8L\n}\n\nfragment InventoryDetails_inventory on ClogInventory {\n  id\n  dateAdded\n  createdAt\n  item {\n    id\n    name\n  }\n  location {\n    id\n    name\n  }\n}\n\nfragment StockSelection_query_LhK8L on RootQuery {\n  clogInventorySearch(first: $count, after: $cursor, where: {item: $item, location: $location}) {\n    totalCount\n    edges {\n      node {\n        id\n        ...InventoryDetails_inventory\n        __typename\n      }\n      cursor\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "0652ee662866bac350dc1554d2bcfb65";

export default node;
