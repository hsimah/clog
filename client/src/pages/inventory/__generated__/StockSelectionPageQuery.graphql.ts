/**
 * @generated SignedSource<<4870fd7cc07a3d46e29ee207afd3345f>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type StockSelectionPageQuery$variables = {
  item: string;
  location?: string | null | undefined;
};
export type StockSelectionPageQuery$data = {
  readonly " $fragmentSpreads": FragmentRefs<"StockSelectionPage_query">;
};
export type StockSelectionPageQuery = {
  response: StockSelectionPageQuery$data;
  variables: StockSelectionPageQuery$variables;
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
],
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v4 = [
  (v3/*:: as any*/),
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
    "name": "StockSelectionPageQuery",
    "selections": [
      {
        "args": (v1/*:: as any*/),
        "kind": "FragmentSpread",
        "name": "StockSelectionPage_query"
      }
    ],
    "type": "RootQuery",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "StockSelectionPageQuery",
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
                  (v3/*:: as any*/),
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
                    "selections": (v4/*:: as any*/),
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "ClogLocation",
                    "kind": "LinkedField",
                    "name": "location",
                    "plural": false,
                    "selections": (v4/*:: as any*/),
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
        "key": "StockSelectionPage__clogInventorySearch",
        "kind": "LinkedHandle",
        "name": "clogInventorySearch"
      }
    ]
  },
  "params": {
    "cacheID": "7dee3356f29d3d240040a0be551e7be6",
    "id": null,
    "metadata": {},
    "name": "StockSelectionPageQuery",
    "operationKind": "query",
    "text": "query StockSelectionPageQuery(\n  $item: ID!\n  $location: ID\n) {\n  ...StockSelectionPage_query_1o6FPU\n}\n\nfragment InventoryDetails_inventory on ClogInventory {\n  id\n  dateAdded\n  createdAt\n  item {\n    id\n    name\n  }\n  location {\n    id\n    name\n  }\n}\n\nfragment StockSelectionPage_query_1o6FPU on RootQuery {\n  clogInventorySearch(first: 25, where: {item: $item, location: $location}) {\n    totalCount\n    edges {\n      node {\n        id\n        ...InventoryDetails_inventory\n        __typename\n      }\n      cursor\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "4b03d118a2a3708875d4429ebd216f75";

export default node;
