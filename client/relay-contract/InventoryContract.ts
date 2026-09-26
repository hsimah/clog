// Compile-only coverage for the inventory workspace GraphQL contract.
declare function graphql(strings: TemplateStringsArray): unknown;

export const query = graphql`
  query InventoryContractQuery($term: String, $location: ID, $id: ID!, $first: Int!, $after: String) {
    clogSummary { items locations inventory }
    node(id: $id) {
      id
      ... on ClogItem { name barcode stockCount(location: $location) }
    }
    clogItemSearch(first: $first, after: $after, where: {term: $term, location: $location})
      @connection(key: "InventoryContract__clogItemSearch", filters: ["where"]) {
      totalCount
      edges { cursor node { id name barcode stockCount(location: $location) } }
      pageInfo { hasNextPage endCursor }
    }
    clogStockedItems(first: $first, after: $after, where: {term: $term, location: $location})
      @connection(key: "InventoryContract__clogStockedItems", filters: ["where"]) {
      totalCount
      edges { cursor node { id name barcode stockCount(location: $location) } }
      pageInfo { hasNextPage endCursor }
    }
    clogLocationSearch(first: 20, where: {item: $id}) {
      totalCount
      nodes { id name stockCount(item: $id) }
      pageInfo { hasNextPage endCursor }
    }
    clogInventorySearch(first: 20, where: {item: $id, location: $location}) {
      totalCount
      nodes { id dateAdded item { id } location { id } }
      pageInfo { hasNextPage endCursor }
    }
  }
`;
