/**
 * @generated SignedSource<<b5ac29ad4f2a504e58aebe09ecbbf64f>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type ClogUserRole = "EDITOR" | "READER" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type UserDetails_user$data = {
  readonly id: string;
  readonly isAdmin: boolean;
  readonly isEnabled: boolean;
  readonly isViewer: boolean;
  readonly role: ClogUserRole;
  readonly username: string;
  readonly " $fragmentType": "UserDetails_user";
};
export type UserDetails_user$key = {
  readonly " $data"?: UserDetails_user$data;
  readonly " $fragmentSpreads": FragmentRefs<"UserDetails_user">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "UserDetails_user",
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
      "name": "username",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "role",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "isAdmin",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "isEnabled",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "isViewer",
      "storageKey": null
    }
  ],
  "type": "ClogUser",
  "abstractKey": null
};

(node as any).hash = "507999788298d538a758ca9c92d203b4";

export default node;
