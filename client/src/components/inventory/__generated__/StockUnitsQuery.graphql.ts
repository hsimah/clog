/**
 * @generated SignedSource<<874899f5dbddbb1131f86166a05ab0aa>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type StockUnitsQuery$variables = {
  item: string;
  location: string;
};
export type StockUnitsQuery$data = {
  readonly " $fragmentSpreads": FragmentRefs<"StockUnits_query">;
};
export type StockUnitsQuery = {
  response: StockUnitsQuery$data;
  variables: StockUnitsQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
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
v1 = [
  {
    "kind": "Variable",
    "name": "item",
    "variableName": "item"
  },
  {
    "kind": "Variable",
    "name": "location",
    "variableName": "location"
  }
],
v2 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 25
  },
  {
    "fields": (v1/*:: as any*/),
    "kind": "ObjectValue",
    "name": "where"
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "StockUnitsQuery",
    "selections": [
      {
        "args": (v1/*:: as any*/),
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
    "name": "StockUnitsQuery",
    "selections": [
      {
        "alias": null,
        "args": (v2/*:: as any*/),
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
        "args": (v2/*:: as any*/),
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
    "cacheID": "e91dedbd885711c620cc7746b36c87fc",
    "id": null,
    "metadata": {},
    "name": "StockUnitsQuery",
    "operationKind": "query",
    "text": "query StockUnitsQuery(\n  $item: ID!\n  $location: ID!\n) {\n  ...StockUnits_query_1o6FPU\n}\n\nfragment StockUnits_query_1o6FPU on RootQuery {\n  clogInventorySearch(first: 25, where: {item: $item, location: $location}) {\n    totalCount\n    edges {\n      node {\n        id\n        dateAdded\n        __typename\n      }\n      cursor\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "2f6483345a8064d3b437a1bf1fffdcf4";

export default node;
