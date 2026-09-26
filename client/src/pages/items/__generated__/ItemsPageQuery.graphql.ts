/**
 * @generated SignedSource<<814d2ef15063fc409549707c50116f18>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ItemsPageQuery$variables = {
  term?: string | null | undefined;
};
export type ItemsPageQuery$data = {
  readonly " $fragmentSpreads": FragmentRefs<"ItemList_query">;
};
export type ItemsPageQuery = {
  response: ItemsPageQuery$data;
  variables: ItemsPageQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "term"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "term",
    "variableName": "term"
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
    "name": "ItemsPageQuery",
    "selections": [
      {
        "args": (v1/*:: as any*/),
        "kind": "FragmentSpread",
        "name": "ItemList_query"
      }
    ],
    "type": "RootQuery",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "ItemsPageQuery",
    "selections": [
      {
        "alias": null,
        "args": (v2/*:: as any*/),
        "concreteType": "RootQueryToClogItemSearchConnection",
        "kind": "LinkedField",
        "name": "clogItemSearch",
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
            "concreteType": "RootQueryToClogItemSearchConnectionEdge",
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
                    "args": null,
                    "kind": "ScalarField",
                    "name": "barcode",
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
            "concreteType": "RootQueryToClogItemSearchConnectionPageInfo",
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
        "key": "ItemList__clogItemSearch",
        "kind": "LinkedHandle",
        "name": "clogItemSearch"
      }
    ]
  },
  "params": {
    "cacheID": "86c6caa02b8bd6098c17c87afff18b44",
    "id": null,
    "metadata": {},
    "name": "ItemsPageQuery",
    "operationKind": "query",
    "text": "query ItemsPageQuery(\n  $term: String\n) {\n  ...ItemList_query_4hh6ED\n}\n\nfragment ItemList_query_4hh6ED on RootQuery {\n  clogItemSearch(first: 25, where: {term: $term}) {\n    totalCount\n    edges {\n      node {\n        id\n        name\n        barcode\n        createdAt\n        stockCount\n        __typename\n      }\n      cursor\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "faa66d4e21c83c21ce16ea841fa141e1";

export default node;
