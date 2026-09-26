/**
 * @generated SignedSource<<22d7ba35171af1285e2ac88ee0b1b875>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type InventoryForm_inventory$data = {
  readonly dateAdded: string;
  readonly id: string;
  readonly item: {
    readonly id: string;
    readonly name: string;
  } | null | undefined;
  readonly location: {
    readonly id: string;
    readonly name: string;
  } | null | undefined;
  readonly " $fragmentType": "InventoryForm_inventory";
};
export type InventoryForm_inventory$key = {
  readonly " $data"?: InventoryForm_inventory$data;
  readonly " $fragmentSpreads": FragmentRefs<"InventoryForm_inventory">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v1 = [
  (v0/*:: as any*/),
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "name",
    "storageKey": null
  }
];
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "InventoryForm_inventory",
  "selections": [
    (v0/*:: as any*/),
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
      "concreteType": "ClogItem",
      "kind": "LinkedField",
      "name": "item",
      "plural": false,
      "selections": (v1/*:: as any*/),
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "ClogLocation",
      "kind": "LinkedField",
      "name": "location",
      "plural": false,
      "selections": (v1/*:: as any*/),
      "storageKey": null
    }
  ],
  "type": "ClogInventory",
  "abstractKey": null
};
})();

(node as any).hash = "b23fdbdc8d11f6a32b419d02691301ce";

export default node;
