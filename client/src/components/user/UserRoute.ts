import { createElement } from "react";
import { RouteName, useUserRouteContext } from "../../routes/__generated__/routes";
import type { EntryPointProps } from "@tsquid/routes/entrypoint";
import type { UserPageQuery } from "../user/__generated__/UserPageQuery.graphql";
import type { UserRecordQuery } from "../user/__generated__/UserRecordQuery.graphql";
import { UserPage } from "./UserPage";
import { UserRecord } from "./UserRecord";
import { UserForm } from "./UserForm";

export function UserRoute({ queries }: UserRouteProps) {
  const route = useUserRouteContext();
  const detail =
    route.currentRoute === RouteName.UserNew
      ? createElement(UserForm, {})
      : queries.record
        ? createElement(UserRecord, { reference: queries.record })
        : null;
  return createElement(UserPage, { reference: queries.page, detail });
}

export type UserRouteProps = EntryPointProps<UserRouteQueries>;

export type UserRouteQueries = {
  page: UserPageQuery;
  record?: UserRecordQuery;
};
