import { graphql } from 'react-relay';
import { useSaveMutation } from '@/relay/useSaveMutation';
import type { useAddStockMutation } from './__generated__/useAddStockMutation.graphql';

export function useAddStock() {
  return useSaveMutation<useAddStockMutation>(graphql`
    mutation useAddStockMutation($input: CreateClogInventoryInput!) {
      createClogInventory(input: $input) {
        clogInventory { id dateAdded createdAt item { id stockCount } location { id stockCount } }
      }
    }
  `);
}
