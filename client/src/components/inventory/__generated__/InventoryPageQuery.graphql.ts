/**
 * @generated SignedSource<<39db50d94d7fa4dc382a63f4f993332a>>
 * @relayHash 52ec8892241662c4ef68cb91b86a46a5
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 52ec8892241662c4ef68cb91b86a46a5

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
  "defaultValue": "",
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
    "cacheID": "52ec8892241662c4ef68cb91b86a46a5",
    "id": "52ec8892241662c4ef68cb91b86a46a5",
    "metadata": {},
    "name": "InventoryPageQuery",
    "operationKind": "query",
    "text": "query InventoryPageQuery(\n  $term: String = \"\"\n  $location: ID\n) {\n  ...InventoryList_query_1Tmkwq\n}\n\nfragment InventoryList_query_1Tmkwq on RootQuery {\n  clogStockedItems(first: 25, where: {term: $term, location: $location}) {\n    totalCount\n    edges {\n      node {\n        id\n        name\n        stockCount(location: $location)\n        __typename\n      }\n      cursor\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "379b5f584aadbaa3ed5818eaed69ad17";

export default node;
