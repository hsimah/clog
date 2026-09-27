/**
 * @generated SignedSource<<b4a25d8527b03484a02e830e96e58eed>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type LocationForm_location$data = {
  readonly id: string;
  readonly name: string;
  readonly " $fragmentType": "LocationForm_location";
};
export type LocationForm_location$key = {
  readonly " $data"?: LocationForm_location$data;
  readonly " $fragmentSpreads": FragmentRefs<"LocationForm_location">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "LocationForm_location",
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
    }
  ],
  "type": "ClogLocation",
  "abstractKey": null
};

(node as any).hash = "6b719abd7a24ebccc2d89311789c7c69";

export default node;
