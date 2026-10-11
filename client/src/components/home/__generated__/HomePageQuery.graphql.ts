/**
 * @generated SignedSource<<a8cfcf29f419f535a62a0a7ef848dc5c>>
 * @relayHash aec0b1f528b151b0088a0672f5d7d5d6
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID aec0b1f528b151b0088a0672f5d7d5d6

import { ConcreteRequest } from 'relay-runtime';
export type HomePageQuery$variables = Record<PropertyKey, never>;
export type HomePageQuery$data = {
  readonly clogSummary: {
    readonly inventory: number;
    readonly items: number;
    readonly locations: number;
  } | null | undefined;
};
export type HomePageQuery = {
  response: HomePageQuery$data;
  variables: HomePageQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "ClogSummary",
    "kind": "LinkedField",
    "name": "clogSummary",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "items",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "locations",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "inventory",
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "HomePageQuery",
    "selections": (v0/*:: as any*/),
    "type": "RootQuery",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "HomePageQuery",
    "selections": (v0/*:: as any*/)
  },
  "params": {
    "cacheID": "aec0b1f528b151b0088a0672f5d7d5d6",
    "id": "aec0b1f528b151b0088a0672f5d7d5d6",
    "metadata": {},
    "name": "HomePageQuery",
    "operationKind": "query",
    "text": "query HomePageQuery {\n  clogSummary {\n    items\n    locations\n    inventory\n  }\n}\n"
  }
};
})();

(node as any).hash = "1d71be8b6f0d3e87c260a27a54ca25dd";

export default node;
