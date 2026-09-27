import { graphql } from "react-relay";
import { useSaveMutation } from "../../../relay/useSaveMutation";
import type { useLocationFormCreateMutation as useLocationFormCreateMutationOperation } from "./__generated__/useLocationFormCreateMutation.graphql";

export function useLocationFormCreateMutation() {
  return useSaveMutation<useLocationFormCreateMutationOperation>(graphql`
    mutation useLocationFormCreateMutation($input: CreateClogLocationInput!) {
      createClogLocation(input: $input) {
        clogLocation {
          id
          name
          ...LocationDetails_location
          ...LocationForm_location
        }
      }
    }
  `);
}
