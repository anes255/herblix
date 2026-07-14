import { useEffect, useState } from "react";
import { api } from "../lib/api.js";

// Checks the current admin session by calling /admin/me.
export function useAuth() {
  const [state, setState] = useState({ loading: true, admin: null });

  useEffect(() => {
    let active = true;
    api
      .get("/admin/me")
      .then((data) => active && setState({ loading: false, admin: data }))
      .catch(() => active && setState({ loading: false, admin: null }));
    return () => {
      active = false;
    };
  }, []);

  return state;
}
