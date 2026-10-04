import { createElement } from "react";
import type { EntryPointProps } from "@tsquid/routes/entrypoint";
import type { RouteState } from "../../routes/RouteState";
import type { UserPageQuery } from "../user/__generated__/UserPageQuery.graphql";
import type { UserRecordQuery } from "../user/__generated__/UserRecordQuery.graphql";
import { UserPage } from "./UserPage";
import { UserRecord } from "./UserRecord";
import { UserForm } from "./UserForm";

export function UserRoute({ queries, extraProps }: UserRouteProps) {
  const detail =
    extraProps.view === "new"
      ? createElement(UserForm, {})
      : queries.record
        ? createElement(UserRecord, { reference: queries.record })
        : null;
  return createElement(UserPage, { reference: queries.page, detail });
}

export type UserRouteProps = EntryPointProps<
  UserRouteQueries,
  Empty,
  Empty,
  RouteState
>;

export type UserRouteQueries = {
  page: UserPageQuery;
  record?: UserRecordQuery;
};

type Empty = Record<string, never>;
