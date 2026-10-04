import { useState } from "react";
import { graphql, usePaginationFragment } from "react-relay";
import { Button } from "@astryxdesign/core/Button";
import { Link } from "@astryxdesign/core/Link";
import { Stack } from "@astryxdesign/core/Stack";
import { Text } from "@astryxdesign/core/Text";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from "@astryxdesign/core/Table";
import { useWorkspaceContext } from "../../app/useWorkspaceContext";
import { getUserAccessLabel } from "./__private__/getUserAccessLabel";
import type { UserList_query$key } from "./__generated__/UserList_query.graphql";
import type { UserListPaginationQuery } from "./__generated__/UserListPaginationQuery.graphql";

export function UserList({ queryRef }: { queryRef: UserList_query$key }) {
  const { userPath } = useWorkspaceContext();
  const { error, hasNext, isLoadingNext, connection, users, loadMore } =
    useUserList({ queryRef });
  if (!connection) {
    return <Text>Administrator access is required to manage users.</Text>;
  }
  return (
    <Stack gap={3}>
      <Text>{connection.totalCount ?? 0} users</Text>
      {users.length === 0 ? (
        <Text>No users found</Text>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHeaderCell>Username</TableHeaderCell>
              <TableHeaderCell>Access</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <Link href={userPath(user.id)}>{user.username}</Link>
                  {user.isViewer && " (you)"}
                </TableCell>
                <TableCell>{getUserAccessLabel(user)}</TableCell>
                <TableCell>{user.isEnabled ? "Active" : "Disabled"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      {error && <Text role="alert">{error}</Text>}
      {hasNext && (
        <Button
          label="Load more users"
          isLoading={isLoadingNext}
          onClick={loadMore}
        />
      )}
    </Stack>
  );
}

function useUserList({ queryRef }: { queryRef: UserList_query$key }) {
  const [error, setError] = useState("");
  const { data, loadNext, hasNext, isLoadingNext } = usePaginationFragment<
    UserListPaginationQuery,
    UserList_query$key
  >(
    graphql`
      fragment UserList_query on RootQuery
      @argumentDefinitions(
        count: { type: "Int", defaultValue: 25 }
        cursor: { type: "String" }
      )
      @refetchable(queryName: "UserListPaginationQuery") {
        clogUsers(first: $count, after: $cursor)
          @connection(key: "UserList__clogUsers") {
          totalCount
          edges {
            node {
              id
              username
              role
              isAdmin
              isEnabled
              isViewer
            }
          }
        }
      }
    `,
    queryRef,
  );
  const connection = data.clogUsers;
  const users =
    connection?.edges?.flatMap((edge) => (edge?.node ? [edge.node] : [])) ?? [];

  function loadMore() {
    setError("");
    loadNext(25, {
      onComplete: (failure) => {
        if (failure) setError(failure.message);
      },
    });
  }
  return { error, hasNext, isLoadingNext, connection, users, loadMore };
}
