import { JSX } from "react/jsx-runtime";
import { useEffect } from "react";
import { ServerError, ServerParseError } from "@apollo/client";

import { useGetMe } from "../../hooks/useGetMe";
import excludedRoutes from "../../constants/excluded-routes";
import { authenticatedVar } from "../../constants/authenticated";
import { snackVar } from "../../constants/snack";
import { UNKNOWN_ERROR_SNACK_MESSAGE } from "../../constants/errors";

interface GuardProps {
  children: JSX.Element;
}

const Guard = ({ children }: GuardProps) => {
  const { data: user, error } = useGetMe();

  useEffect(() => {
    authenticatedVar(Boolean(user?.me));
  }, [user]);

  useEffect(() => {
    if (!error) return;

    if (ServerError.is(error) || ServerParseError.is(error)) {
      snackVar(UNKNOWN_ERROR_SNACK_MESSAGE);
    }
  }, [error]);

  return (
    <>
      {excludedRoutes.includes(window.location.pathname)
        ? children
        : user && children}
    </>
  );
};

export default Guard;