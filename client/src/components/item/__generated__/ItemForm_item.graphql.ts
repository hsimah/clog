/**
 * @generated SignedSource<<22bbd79333f5bf979af0343c54966c5f>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ItemForm_item$data = {
  readonly barcode: string | null | undefined;
  readonly id: string;
  readonly name: string;
  readonly " $fragmentType": "ItemForm_item";
};
export type ItemForm_item$key = {
  readonly " $data"?: ItemForm_item$data;
  readonly " $fragmentSpreads": FragmentRefs<"ItemForm_item">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ItemForm_item",
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
    }
  ],
  "type": "ClogItem",
  "abstractKey": null
};

(node as any).hash = "3e6684e5e23cc846236ef8037073dff7";

export default node;
