/**
 * @generated SignedSource<<8e75e3cc7dce30add0d44b09d538b034>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ItemList_query$data = {
  readonly clogItemSearch: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly barcode: string | null | undefined;
        readonly createdAt: string;
        readonly id: string;
        readonly name: string;
        readonly stockCount: number;
      };
    }>;
    readonly totalCount: number | null | undefined;
  } | null | undefined;
  readonly " $fragmentType": "ItemList_query";
};
export type ItemList_query$key = {
  readonly " $data"?: ItemList_query$data;
  readonly " $fragmentSpreads": FragmentRefs<"ItemList_query">;
};

import ItemListPaginationQuery_graphql from './ItemListPaginationQuery.graphql';

const node: ReaderFragment = (function(){
var v0 = [
  "clogItemSearch"
];
return {
  "argumentDefinitions": [
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
  "kind": "Fragment",
  "metadata": {
    "connection": [
      {
        "count": "count",
        "cursor": "cursor",
        "direction": "forward",
        "path": (v0/*:: as any*/)
      }
    ],
    "refetch": {
      "connection": {
        "forward": {
          "count": "count",
          "cursor": "cursor"
        },
        "backward": null,
        "path": (v0/*:: as any*/)
      },
      "fragmentPathInResult": [],
      "operation": ItemListPaginationQuery_graphql
    }
  },
  "name": "ItemList_query",
  "selections": [
    {
      "alias": "clogItemSearch",
      "args": [
        {
          "fields": [
            {
              "kind": "Variable",
              "name": "term",
              "variableName": "term"
            }
          ],
          "kind": "ObjectValue",
          "name": "where"
        }
      ],
      "concreteType": "RootQueryToClogItemSearchConnection",
      "kind": "LinkedField",
      "name": "__ItemList__clogItemSearch_connection",
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
    }
  ],
  "type": "RootQuery",
  "abstractKey": null
};
})();

(node as any).hash = "74a28ecbc3f4cbc642bd337fc1405940";

export default node;
