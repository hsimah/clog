/**
 * @generated SignedSource<<addacf24577bab0b2d5bc1d6d49766da>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type StockUnits_query$data = {
  readonly clogInventorySearch: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly dateAdded: string;
        readonly id: string;
      } | null | undefined;
    } | null | undefined> | null | undefined;
    readonly totalCount: number | null | undefined;
  } | null | undefined;
  readonly " $fragmentType": "StockUnits_query";
};
export type StockUnits_query$key = {
  readonly " $data"?: StockUnits_query$data;
  readonly " $fragmentSpreads": FragmentRefs<"StockUnits_query">;
};

import StockUnitsPaginationQuery_graphql from './StockUnitsPaginationQuery.graphql';

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
      "operation": StockUnitsPaginationQuery_graphql
    }
  },
  "name": "StockUnits_query",
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
      "name": "__StockUnits__clogInventorySearch_connection",
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
    }
  ],
  "type": "RootQuery",
  "abstractKey": null
};
})();

(node as any).hash = "bfeac29bfb36577c5fd98dfe9cf08270";

export default node;
