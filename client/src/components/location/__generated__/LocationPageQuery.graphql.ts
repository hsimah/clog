/**
 * @generated SignedSource<<aa1b756e17136f9ecafd5bbbc4ba40a1>>
 * @relayHash cceefb75b98d9f9d92c4bc91329a4722
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID cceefb75b98d9f9d92c4bc91329a4722

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type LocationPageQuery$variables = {
  term?: string | null | undefined;
};
export type LocationPageQuery$data = {
  readonly " $fragmentSpreads": FragmentRefs<"LocationList_query">;
};
export type LocationPageQuery = {
  response: LocationPageQuery$data;
  variables: LocationPageQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": "",
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
    "name": "LocationPageQuery",
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
    "name": "LocationPageQuery",
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
    "cacheID": "cceefb75b98d9f9d92c4bc91329a4722",
    "id": "cceefb75b98d9f9d92c4bc91329a4722",
    "metadata": {},
    "name": "LocationPageQuery",
    "operationKind": "query",
    "text": "query LocationPageQuery(\n  $term: String = \"\"\n) {\n  ...LocationList_query_4hh6ED\n}\n\nfragment LocationList_query_4hh6ED on RootQuery {\n  clogLocationSearch(first: 25, where: {term: $term}) {\n    totalCount\n    edges {\n      node {\n        id\n        name\n        createdAt\n        stockCount\n        __typename\n      }\n      cursor\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "8b0d433a68c81dccfb975465d4396471";

export default node;
