/**
 * @generated SignedSource<<feb6981069467b38b2d46bd51c01ffa6>>
 * @relayHash 356c68480ea571cdcdc917cae61483df
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 356c68480ea571cdcdc917cae61483df

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type LocationListPaginationQuery$variables = {
  count?: number | null | undefined;
  cursor?: string | null | undefined;
  term?: string | null | undefined;
};
export type LocationListPaginationQuery$data = {
  readonly " $fragmentSpreads": FragmentRefs<"LocationList_query">;
};
export type LocationListPaginationQuery = {
  response: LocationListPaginationQuery$data;
  variables: LocationListPaginationQuery$variables;
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
    "name": "term"
  }
],
v1 = {
  "kind": "Variable",
  "name": "term",
  "variableName": "term"
},
v2 = [
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
      (v1/*:: as any*/)
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
    "name": "LocationListPaginationQuery",
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
        "name": "LocationList_query"
      }
    ],
    "type": "RootQuery",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "LocationListPaginationQuery",
    "selections": [
      {
        "alias": null,
        "args": (v2/*:: as any*/),
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
        "key": "LocationList__clogLocationSearch",
        "kind": "LinkedHandle",
        "name": "clogLocationSearch"
      }
    ]
  },
  "params": {
    "cacheID": "356c68480ea571cdcdc917cae61483df",
    "id": "356c68480ea571cdcdc917cae61483df",
    "metadata": {},
    "name": "LocationListPaginationQuery",
    "operationKind": "query",
    "text": "query LocationListPaginationQuery(\n  $count: Int = 25\n  $cursor: String\n  $term: String\n) {\n  ...LocationList_query_4j0hnM\n}\n\nfragment LocationList_query_4j0hnM on RootQuery {\n  clogLocationSearch(first: $count, after: $cursor, where: {term: $term}) {\n    totalCount\n    edges {\n      node {\n        id\n        name\n        createdAt\n        stockCount\n        __typename\n      }\n      cursor\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "150852c5e175fb49fa8d058bffb4584a";

export default node;
