import { graphql, usePreloadedQuery, type PreloadedQuery } from "react-relay";
import { Text } from "@astryxdesign/core/Text";
import { UserDetails } from "./UserDetails";
import type { UserRecordQuery } from "./__generated__/UserRecordQuery.graphql";

const QUERY = graphql`
  query UserRecordQuery($id: ID!) {
    clogUser(id: $id) {
      id
      ...UserDetails_user
    }
  }
`;

export function UserRecord({
  reference,
}: {
  reference: PreloadedQuery<UserRecordQuery>;
}) {
  const { clogUser } = usePreloadedQuery<UserRecordQuery>(QUERY, reference);
  if (!clogUser) return <Text>User not found</Text>;
  return <UserDetails key={clogUser.id} userRef={clogUser} />;
}
