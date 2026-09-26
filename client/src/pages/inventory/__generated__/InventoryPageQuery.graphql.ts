/**
 * @generated SignedSource<<a05b38fed2304b2c03b38b55988027a8>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type InventoryPageQuery$variables = {
  location?: string | null | undefined;
  term?: string | null | undefined;
};
export type InventoryPageQuery$data = {
  readonly " $fragmentSpreads": FragmentRefs<"InventoryList_query">;
};
export type InventoryPageQuery = {
  response: InventoryPageQuery$data;
  variables: InventoryPageQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "location"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "term"
},
v2 = {
  "kind": "Variable",
  "name": "location",
  "variableName": "location"
},
v3 = [
  (v2/*:: as any*/),
  {
    "kind": "Variable",
    "name": "term",
    "variableName": "term"
  }
],
v4 = [
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
      (v1/*:: as any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "InventoryPageQuery",
    "selections": [
      {
        "args": (v3/*:: as any*/),
        "kind": "FragmentSpread",
        "name": "InventoryList_query"
      }
    ],
    "type": "RootQuery",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*:: as any*/),
      (v0/*:: as any*/)
    ],
    "kind": "Operation",
    "name": "InventoryPageQuery",
    "selections": [
      {
        "alias": null,
        "args": (v4/*:: as any*/),
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
                      (v2/*:: as any*/)
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
        "args": (v4/*:: as any*/),
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
    "cacheID": "ecaca49b8bb8b8891cf23b3dabf45f07",
    "id": null,
    "metadata": {},
    "name": "InventoryPageQuery",
    "operationKind": "query",
    "text": "query InventoryPageQuery(\n  $term: String\n  $location: ID\n) {\n  ...InventoryList_query_1Tmkwq\n}\n\nfragment InventoryList_query_1Tmkwq on RootQuery {\n  clogStockedItems(first: 25, where: {term: $term, location: $location}) {\n    totalCount\n    edges {\n      node {\n        id\n        name\n        stockCount(location: $location)\n        __typename\n      }\n      cursor\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "de12dbec1e01f8c2ff962bc069af9af6";

export default node;
