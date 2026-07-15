import { useState } from "react";

export function useCrmFiltersState() {
  const [contactSearch, setContactSearch] = useState("");
  const [contactDateFrom, setContactDateFrom] = useState("");
  const [contactDateTo, setContactDateTo] = useState("");
  const [logFilter, setLogFilter] = useState("all");
  const [logDateFrom, setLogDateFrom] = useState("");
  const [logDateTo, setLogDateTo] = useState("");
  const [rowLimitInput, setRowLimitInput] = useState("15");
  const [userSearch, setUserSearch] = useState("");
  const [usersOrderBy, setUsersOrderBy] = useState<
    "createdAt" | "email" | "displayName" | "login"
  >("createdAt");
  const [usersOrderDir, setUsersOrderDir] = useState<"asc" | "desc">("desc");

  return {
    contactSearch,
    setContactSearch,
    contactDateFrom,
    setContactDateFrom,
    contactDateTo,
    setContactDateTo,
    logFilter,
    setLogFilter,
    logDateFrom,
    setLogDateFrom,
    logDateTo,
    setLogDateTo,
    rowLimitInput,
    setRowLimitInput,
    userSearch,
    setUserSearch,
    usersOrderBy,
    setUsersOrderBy,
    usersOrderDir,
    setUsersOrderDir,
  };
}
