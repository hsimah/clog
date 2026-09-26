/**
 * @generated SignedSource<<6398d3169fd1fa7afa3ce452235f31fe>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type InventoryDetails_inventory$data = {
  readonly createdAt: string;
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
  readonly " $fragmentType": "InventoryDetails_inventory";
};
export type InventoryDetails_inventory$key = {
  readonly " $data"?: InventoryDetails_inventory$data;
  readonly " $fragmentSpreads": FragmentRefs<"InventoryDetails_inventory">;
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
  "name": "InventoryDetails_inventory",
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
      "kind": "ScalarField",
      "name": "createdAt",
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

(node as any).hash = "5cd8bd48f355de320358ae4eb528dfb3";

export default node;
