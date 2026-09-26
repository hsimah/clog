/**
 * @generated SignedSource<<a27cfeb319eab243ac8ef0aed23199a3>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type InventoryContractQuery$variables = {
  after?: string | null | undefined;
  first: number;
  id: string;
  location?: string | null | undefined;
  term?: string | null | undefined;
};
export type InventoryContractQuery$data = {
  readonly clogInventorySearch: {
    readonly nodes: ReadonlyArray<{
      readonly dateAdded: string;
      readonly id: string;
      readonly item: {
        readonly id: string;
      } | null | undefined;
      readonly location: {
        readonly id: string;
      } | null | undefined;
    }>;
    readonly pageInfo: {
      readonly endCursor: string | null | undefined;
      readonly hasNextPage: boolean;
    };
    readonly totalCount: number | null | undefined;
  } | null | undefined;
  readonly clogItemSearch: {
    readonly edges: ReadonlyArray<{
      readonly cursor: string | null | undefined;
      readonly node: {
        readonly barcode: string | null | undefined;
        readonly id: string;
        readonly name: string;
        readonly stockCount: number;
      };
    }>;
    readonly pageInfo: {
      readonly endCursor: string | null | undefined;
      readonly hasNextPage: boolean;
    };
    readonly totalCount: number | null | undefined;
  } | null | undefined;
  readonly clogLocationSearch: {
    readonly nodes: ReadonlyArray<{
      readonly id: string;
      readonly name: string;
      readonly stockCount: number;
    }>;
    readonly pageInfo: {
      readonly endCursor: string | null | undefined;
      readonly hasNextPage: boolean;
    };
    readonly totalCount: number | null | undefined;
  } | null | undefined;
  readonly clogStockedItems: {
    readonly edges: ReadonlyArray<{
      readonly cursor: string | null | undefined;
      readonly node: {
        readonly barcode: string | null | undefined;
        readonly id: string;
        readonly name: string;
        readonly stockCount: number;
      };
    }>;
    readonly pageInfo: {
      readonly endCursor: string | null | undefined;
      readonly hasNextPage: boolean;
    };
    readonly totalCount: number | null | undefined;
  } | null | undefined;
  readonly clogSummary: {
    readonly inventory: number;
    readonly items: number;
    readonly locations: number;
  } | null | undefined;
  readonly node: {
    readonly barcode?: string | null | undefined;
    readonly id: string;
    readonly name?: string;
    readonly stockCount?: number;
  } | null | undefined;
};
export type InventoryContractQuery = {
  response: InventoryContractQuery$data;
  variables: InventoryContractQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "after"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "first"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "id"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "location"
},
v4 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "term"
},
v5 = {
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
},
v6 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "id"
  }
],
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "barcode",
  "storageKey": null
},
v10 = {
  "kind": "Variable",
  "name": "location",
  "variableName": "location"
},
v11 = {
  "alias": null,
  "args": [
    (v10/*:: as any*/)
  ],
  "kind": "ScalarField",
  "name": "stockCount",
  "storageKey": null
},
v12 = {
  "kind": "InlineFragment",
  "selections": [
    (v8/*:: as any*/),
    (v9/*:: as any*/),
    (v11/*:: as any*/)
  ],
  "type": "ClogItem",
  "abstractKey": null
},
v13 = {
  "fields": [
    (v10/*:: as any*/),
    {
      "kind": "Variable",
      "name": "term",
      "variableName": "term"
    }
  ],
  "kind": "ObjectValue",
  "name": "where"
},
v14 = [
  (v13/*:: as any*/)
],
v15 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "totalCount",
  "storageKey": null
},
v16 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v17 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "cursor",
    "storageKey": null
  },
  {
    "alias": null,
    "args": null,
    "concreteType": "ClogItem",
    "kind": "LinkedField",
    "name": "node",
    "plural": false,
    "selections": [
      (v7/*:: as any*/),
      (v8/*:: as any*/),
      (v9/*:: as any*/),
      (v11/*:: as any*/),
      (v16/*:: as any*/)
    ],
    "storageKey": null
  }
],
v18 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "hasNextPage",
    "storageKey": null
  },
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "endCursor",
    "storageKey": null
  }
],
v19 = [
  (v15/*:: as any*/),
  {
    "alias": null,
    "args": null,
    "concreteType": "RootQueryToClogItemSearchConnectionEdge",
    "kind": "LinkedField",
    "name": "edges",
    "plural": true,
    "selections": (v17/*:: as any*/),
    "storageKey": null
  },
  {
    "alias": null,
    "args": null,
    "concreteType": "RootQueryToClogItemSearchConnectionPageInfo",
    "kind": "LinkedField",
    "name": "pageInfo",
    "plural": false,
    "selections": (v18/*:: as any*/),
    "storageKey": null
  }
],
v20 = [
  (v15/*:: as any*/),
  {
    "alias": null,
    "args": null,
    "concreteType": "RootQueryToClogStockedItemsConnectionEdge",
    "kind": "LinkedField",
    "name": "edges",
    "plural": true,
    "selections": (v17/*:: as any*/),
    "storageKey": null
  },
  {
    "alias": null,
    "args": null,
    "concreteType": "RootQueryToClogStockedItemsConnectionPageInfo",
    "kind": "LinkedField",
    "name": "pageInfo",
    "plural": false,
    "selections": (v18/*:: as any*/),
    "storageKey": null
  }
],
v21 = {
  "kind": "Literal",
  "name": "first",
  "value": 20
},
v22 = {
  "kind": "Variable",
  "name": "item",
  "variableName": "id"
},
v23 = [
  (v22/*:: as any*/)
],
v24 = {
  "alias": null,
  "args": [
    (v21/*:: as any*/),
    {
      "fields": (v23/*:: as any*/),
      "kind": "ObjectValue",
      "name": "where"
    }
  ],
  "concreteType": "RootQueryToClogLocationSearchConnection",
  "kind": "LinkedField",
  "name": "clogLocationSearch",
  "plural": false,
  "selections": [
    (v15/*:: as any*/),
    {
      "alias": null,
      "args": null,
      "concreteType": "ClogLocation",
      "kind": "LinkedField",
      "name": "nodes",
      "plural": true,
      "selections": [
        (v7/*:: as any*/),
        (v8/*:: as any*/),
        {
          "alias": null,
          "args": (v23/*:: as any*/),
          "kind": "ScalarField",
          "name": "stockCount",
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "RootQueryToClogLocationSearchConnectionPageInfo",
      "kind": "LinkedField",
      "name": "pageInfo",
      "plural": false,
      "selections": (v18/*:: as any*/),
      "storageKey": null
    }
  ],
  "storageKey": null
},
v25 = [
  (v7/*:: as any*/)
],
v26 = {
  "alias": null,
  "args": [
    (v21/*:: as any*/),
    {
      "fields": [
        (v22/*:: as any*/),
        (v10/*:: as any*/)
      ],
      "kind": "ObjectValue",
      "name": "where"
    }
  ],
  "concreteType": "RootQueryToClogInventorySearchConnection",
  "kind": "LinkedField",
  "name": "clogInventorySearch",
  "plural": false,
  "selections": [
    (v15/*:: as any*/),
    {
      "alias": null,
      "args": null,
      "concreteType": "ClogInventory",
      "kind": "LinkedField",
      "name": "nodes",
      "plural": true,
      "selections": [
        (v7/*:: as any*/),
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
          "selections": (v25/*:: as any*/),
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "concreteType": "ClogLocation",
          "kind": "LinkedField",
          "name": "location",
          "plural": false,
          "selections": (v25/*:: as any*/),
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
      "selections": (v18/*:: as any*/),
      "storageKey": null
    }
  ],
  "storageKey": null
},
v27 = [
  {
    "kind": "Variable",
    "name": "after",
    "variableName": "after"
  },
  {
    "kind": "Variable",
    "name": "first",
    "variableName": "first"
  },
  (v13/*:: as any*/)
],
v28 = [
  "where"
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*:: as any*/),
      (v1/*:: as any*/),
      (v2/*:: as any*/),
      (v3/*:: as any*/),
      (v4/*:: as any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "InventoryContractQuery",
    "selections": [
      (v5/*:: as any*/),
      {
        "alias": null,
        "args": (v6/*:: as any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v7/*:: as any*/),
          (v12/*:: as any*/)
        ],
        "storageKey": null
      },
      {
        "alias": "clogItemSearch",
        "args": (v14/*:: as any*/),
        "concreteType": "RootQueryToClogItemSearchConnection",
        "kind": "LinkedField",
        "name": "__InventoryContract__clogItemSearch_connection",
        "plural": false,
        "selections": (v19/*:: as any*/),
        "storageKey": null
      },
      {
        "alias": "clogStockedItems",
        "args": (v14/*:: as any*/),
        "concreteType": "RootQueryToClogStockedItemsConnection",
        "kind": "LinkedField",
        "name": "__InventoryContract__clogStockedItems_connection",
        "plural": false,
        "selections": (v20/*:: as any*/),
        "storageKey": null
      },
      (v24/*:: as any*/),
      (v26/*:: as any*/)
    ],
    "type": "RootQuery",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v4/*:: as any*/),
      (v3/*:: as any*/),
      (v2/*:: as any*/),
      (v1/*:: as any*/),
      (v0/*:: as any*/)
    ],
    "kind": "Operation",
    "name": "InventoryContractQuery",
    "selections": [
      (v5/*:: as any*/),
      {
        "alias": null,
        "args": (v6/*:: as any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v16/*:: as any*/),
          (v7/*:: as any*/),
          (v12/*:: as any*/)
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": (v27/*:: as any*/),
        "concreteType": "RootQueryToClogItemSearchConnection",
        "kind": "LinkedField",
        "name": "clogItemSearch",
        "plural": false,
        "selections": (v19/*:: as any*/),
        "storageKey": null
      },
      {
        "alias": null,
        "args": (v27/*:: as any*/),
        "filters": (v28/*:: as any*/),
        "handle": "connection",
        "key": "InventoryContract__clogItemSearch",
        "kind": "LinkedHandle",
        "name": "clogItemSearch"
      },
      {
        "alias": null,
        "args": (v27/*:: as any*/),
        "concreteType": "RootQueryToClogStockedItemsConnection",
        "kind": "LinkedField",
        "name": "clogStockedItems",
        "plural": false,
        "selections": (v20/*:: as any*/),
        "storageKey": null
      },
      {
        "alias": null,
        "args": (v27/*:: as any*/),
        "filters": (v28/*:: as any*/),
        "handle": "connection",
        "key": "InventoryContract__clogStockedItems",
        "kind": "LinkedHandle",
        "name": "clogStockedItems"
      },
      (v24/*:: as any*/),
      (v26/*:: as any*/)
    ]
  },
  "params": {
    "cacheID": "cd73bcb0aad5770d81c801b11f4aefc6",
    "id": null,
    "metadata": {
      "connection": [
        {
          "count": "first",
          "cursor": "after",
          "direction": "forward",
          "path": [
            "clogItemSearch"
          ]
        },
        {
          "count": "first",
          "cursor": "after",
          "direction": "forward",
          "path": [
            "clogStockedItems"
          ]
        }
      ]
    },
    "name": "InventoryContractQuery",
    "operationKind": "query",
    "text": "query InventoryContractQuery(\n  $term: String\n  $location: ID\n  $id: ID!\n  $first: Int!\n  $after: String\n) {\n  clogSummary {\n    items\n    locations\n    inventory\n  }\n  node(id: $id) {\n    __typename\n    id\n    ... on ClogItem {\n      name\n      barcode\n      stockCount(location: $location)\n    }\n  }\n  clogItemSearch(first: $first, after: $after, where: {term: $term, location: $location}) {\n    totalCount\n    edges {\n      cursor\n      node {\n        id\n        name\n        barcode\n        stockCount(location: $location)\n        __typename\n      }\n    }\n    pageInfo {\n      hasNextPage\n      endCursor\n    }\n  }\n  clogStockedItems(first: $first, after: $after, where: {term: $term, location: $location}) {\n    totalCount\n    edges {\n      cursor\n      node {\n        id\n        name\n        barcode\n        stockCount(location: $location)\n        __typename\n      }\n    }\n    pageInfo {\n      hasNextPage\n      endCursor\n    }\n  }\n  clogLocationSearch(first: 20, where: {item: $id}) {\n    totalCount\n    nodes {\n      id\n      name\n      stockCount(item: $id)\n    }\n    pageInfo {\n      hasNextPage\n      endCursor\n    }\n  }\n  clogInventorySearch(first: 20, where: {item: $id, location: $location}) {\n    totalCount\n    nodes {\n      id\n      dateAdded\n      item {\n        id\n      }\n      location {\n        id\n      }\n    }\n    pageInfo {\n      hasNextPage\n      endCursor\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "9d4feca6c09f54567a3b6d992695f398";

export default node;
