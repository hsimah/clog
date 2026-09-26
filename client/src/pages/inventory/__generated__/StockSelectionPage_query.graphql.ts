/**
 * @generated SignedSource<<50ac240ce7e216846fca75a8c63610e3>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type StockSelectionPage_query$data = {
  readonly clogInventorySearch: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly id: string;
        readonly " $fragmentSpreads": FragmentRefs<"InventoryDetails_inventory">;
      };
    }>;
    readonly totalCount: number | null | undefined;
  } | null | undefined;
  readonly " $fragmentType": "StockSelectionPage_query";
};
export type StockSelectionPage_query$key = {
  readonly " $data"?: StockSelectionPage_query$data;
  readonly " $fragmentSpreads": FragmentRefs<"StockSelectionPage_query">;
};

import StockSelectionPagePaginationQuery_graphql from './StockSelectionPagePaginationQuery.graphql';

const node: ReaderFragment = (function(){
var v0 = [
  "clogInventorySearch"
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
      "name": "item"
    },
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "location"
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
      "operation": StockSelectionPagePaginationQuery_graphql
    }
  },
  "name": "StockSelectionPage_query",
  "selections": [
    {
      "alias": "clogInventorySearch",
      "args": [
        {
          "fields": [
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
          "kind": "ObjectValue",
          "name": "where"
        }
      ],
      "concreteType": "RootQueryToClogInventorySearchConnection",
      "kind": "LinkedField",
      "name": "__StockSelectionPage__clogInventorySearch_connection",
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
                  "args": null,
                  "kind": "FragmentSpread",
                  "name": "InventoryDetails_inventory"
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
    }
  ],
  "type": "RootQuery",
  "abstractKey": null
};
})();

(node as any).hash = "8169e694cd0670ad6de187c2745a2b39";

export default node;
