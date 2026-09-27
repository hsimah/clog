/**
 * @generated SignedSource<<f192af4edd0d5edad59b0c943666b2ae>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type LocationsPageQuery$variables = {
  term?: string | null | undefined;
};
export type LocationsPageQuery$data = {
  readonly " $fragmentSpreads": FragmentRefs<"LocationList_query">;
};
export type LocationsPageQuery = {
  response: LocationsPageQuery$data;
  variables: LocationsPageQuery$variables;
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
    "name": "LocationsPageQuery",
    "selections": [
      {
        "args": (v1/*:: as any*/),
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
    "name": "LocationsPageQuery",
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
    "cacheID": "6d6bd1468876651bb3032ee0c6d7ba06",
    "id": null,
    "metadata": {},
    "name": "LocationsPageQuery",
    "operationKind": "query",
    "text": "query LocationsPageQuery(\n  $term: String\n) {\n  ...LocationList_query_4hh6ED\n}\n\nfragment LocationList_query_4hh6ED on RootQuery {\n  clogLocationSearch(first: 25, where: {term: $term}) {\n    totalCount\n    edges {\n      node {\n        id\n        name\n        createdAt\n        stockCount\n        __typename\n      }\n      cursor\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "b9950a3fe11a5ee19c6a325af7c680fb";

export default node;
