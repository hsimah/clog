/**
 * @generated SignedSource<<34f43454804c3349a1f1f1c75e3b2912>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type LocationDetails_location$data = {
  readonly createdAt: string;
  readonly id: string;
  readonly name: string;
  readonly stockCount: number;
  readonly " $fragmentType": "LocationDetails_location";
};
export type LocationDetails_location$key = {
  readonly " $data"?: LocationDetails_location$data;
  readonly " $fragmentSpreads": FragmentRefs<"LocationDetails_location">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "LocationDetails_location",
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
    }
  ],
  "type": "ClogLocation",
  "abstractKey": null
};

(node as any).hash = "3b169d8dc7b0477811af7d7f1b104fc7";

export default node;
