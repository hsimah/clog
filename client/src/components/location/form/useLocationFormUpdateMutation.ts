import { graphql } from "react-relay";
import { useSaveMutation } from "../../../relay/useSaveMutation";
import type { useLocationFormUpdateMutation as useLocationFormUpdateMutationOperation } from "./__generated__/useLocationFormUpdateMutation.graphql";

export function useLocationFormUpdateMutation() {
  return useSaveMutation<useLocationFormUpdateMutationOperation>(graphql`
    mutation useLocationFormUpdateMutation($input: UpdateClogLocationInput!) {
      updateClogLocation(input: $input) {
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
