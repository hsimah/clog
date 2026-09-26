/**
 * @generated SignedSource<<f8166d04f04b30155a9a232657573907>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type StockUnitsPaginationQuery$variables = {
  count?: number | null | undefined;
  cursor?: string | null | undefined;
  item: string;
  location: string;
};
export type StockUnitsPaginationQuery$data = {
  readonly " $fragmentSpreads": FragmentRefs<"StockUnits_query">;
};
export type StockUnitsPaginationQuery = {
  response: StockUnitsPaginationQuery$data;
  variables: StockUnitsPaginationQuery$variables;
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
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "StockUnitsPaginationQuery",
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
        "name": "StockUnits_query"
      }
    ],
    "type": "RootQuery",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "StockUnitsPaginationQuery",
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
                    "name": "dateAdded",
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
            "concreteType": "RootQueryToClogInventorySearchConnectionPageInfo",
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
        "key": "StockUnits__clogInventorySearch",
        "kind": "LinkedHandle",
        "name": "clogInventorySearch"
      }
    ]
  },
  "params": {
    "cacheID": "eaeb9b653047ebbbf4a0a8880aa0c6c0",
    "id": null,
    "metadata": {},
    "name": "StockUnitsPaginationQuery",
    "operationKind": "query",
    "text": "query StockUnitsPaginationQuery(\n  $count: Int = 25\n  $cursor: String\n  $item: ID!\n  $location: ID!\n) {\n  ...StockUnits_query_LhK8L\n}\n\nfragment StockUnits_query_LhK8L on RootQuery {\n  clogInventorySearch(first: $count, after: $cursor, where: {item: $item, location: $location}) {\n    totalCount\n    edges {\n      node {\n        id\n        dateAdded\n        __typename\n      }\n      cursor\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "bfeac29bfb36577c5fd98dfe9cf08270";

export default node;
