/**
 * @generated SignedSource<<e0b8bb5e82bd703c2a6515685f7a5c6e>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ItemDetails_item$data = {
  readonly barcode: string | null | undefined;
  readonly createdAt: string;
  readonly id: string;
  readonly name: string;
  readonly stockCount: number;
  readonly " $fragmentType": "ItemDetails_item";
};
export type ItemDetails_item$key = {
  readonly " $data"?: ItemDetails_item$data;
  readonly " $fragmentSpreads": FragmentRefs<"ItemDetails_item">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ItemDetails_item",
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
    }
  ],
  "type": "ClogItem",
  "abstractKey": null
};

(node as any).hash = "27c97f58ea94f22c18639c6cfabde991";

export default node;
