import { useId } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { PlatformPage } from "@/shared/ui/platform";
import { crmCopy } from "../../model/i18n";
import { resizeImageFileToDataUrl } from "../../model/resizeAvatarImage";
import {
  getCrmLocaleTag,
  getStatusClassName,
  getUserInitials,
  getUserRoleCode,
} from "../../model/lib";
import { emitAppNotification } from "@/shared/lib/notify";
import type { UsersSectionProps } from "./sectionTypes";

export function UsersSection({
  crmLang,
  usersView,
  isCreateUser,
  usersWithMeta,
  userSearch,
  setUserSearch,
  usersOrderBy,
  setUsersOrderBy,
  usersOrderDir,
  setUsersOrderDir,
  setSelectedUserId,
  setUsersView,
  selectedUser,
  userForm,
  setUserForm,
  onSaveUser,
  onNavigateCreateUser,
}: UsersSectionProps) {
  const ui = crmCopy[crmLang];
  const dateLocale = getCrmLocaleTag(crmLang);
  const newUserAvatarInputId = useId();

  if (usersView === "list") {
    return (
      <PlatformPage
        title={ui.users}
        subtitle={String(usersWithMeta.length)}
        actions={
          <button
            type="button"
            className="crm-btn crm-btn--primary crm-btn--add-user"
            onClick={onNavigateCreateUser}
          >
            {ui.addUser}
          </button>
        }
      >
        <article className="crm-panel crm-table-card">
          <label className="crm-users-search">
            <input
              className="spx-input crm-input"
              placeholder={ui.userSearchPlaceholder}
              value={userSearch}
              onChange={(event) => setUserSearch(event.target.value)}
            />
          </label>
          <div className="crm-chip-row">
            <button
              type="button"
              className={
                usersOrderBy === "createdAt"
                  ? "crm-chip crm-chip--active"
                  : "crm-chip"
              }
              onClick={() => setUsersOrderBy("createdAt")}
            >
              {ui.sortCreated}
            </button>
            <button
              type="button"
              className={
                usersOrderBy === "login"
                  ? "crm-chip crm-chip--active"
                  : "crm-chip"
              }
              onClick={() => setUsersOrderBy("login")}
            >
              {ui.sortLogin}
            </button>
            <button
              type="button"
              className={
                usersOrderBy === "email"
                  ? "crm-chip crm-chip--active"
                  : "crm-chip"
              }
              onClick={() => setUsersOrderBy("email")}
            >
              {ui.sortEmail}
            </button>
            <button
              type="button"
              className={
                usersOrderBy === "displayName"
                  ? "crm-chip crm-chip--active"
                  : "crm-chip"
              }
              onClick={() => setUsersOrderBy("displayName")}
            >
              {ui.sortName}
            </button>
            <button
              type="button"
              className="crm-chip"
              onClick={() =>
                setUsersOrderDir((prev) => (prev === "asc" ? "desc" : "asc"))
              }
            >
              {usersOrderDir.toUpperCase()}
            </button>
          </div>
          <div className="crm-table-wrap">
            <table className="crm-data-table">
              <thead>
                <tr>
                  <th>{ui.tableIndex}</th>
                  <th>{ui.tableName}</th>
                  <th>{ui.tableLogin}</th>
                  <th>{ui.tableEmail}</th>
                  <th>{ui.tableRole}</th>
                  <th>{ui.tableCountry}</th>
                  <th>{ui.tableCreated}</th>
                </tr>
              </thead>
              <tbody>
                {usersWithMeta.map((user) => (
                  <tr
                    key={user.id}
                    onClick={() => {
                      setSelectedUserId(user.id);
                    }}
                  >
                    <td>{user.index}</td>
                    <td>{user.displayName}</td>
                    <td>{user.login ?? "—"}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={getStatusClassName(user.roleCode)}>
                        {ui.userRoles[user.roleCode]}
                      </span>
                    </td>
                    <td>{user.country}</td>
                    <td>
                      {new Date(user.createdAt).toLocaleDateString(dateLocale)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </PlatformPage>
    );
  }

  const showEditor = isCreateUser || selectedUser;
  if (!showEditor) {
    return null;
  }

  const roleLabel = selectedUser
    ? ui.userRoles[getUserRoleCode(selectedUser)]
    : null;

  return (
    <PlatformPage
      title={isCreateUser ? ui.newUserTitle : selectedUser!.displayName}
      subtitle={isCreateUser ? ui.newUserSubtitle : roleLabel ?? undefined}
      actions={
        <button
          type="button"
          className="crm-btn crm-btn--ghost"
          onClick={() => setUsersView("list")}
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          {ui.backToUsers}
        </button>
      }
    >
      <article className="crm-user-editor crm-panel">
        {isCreateUser ? (
          <div className="crm-user-card crm-user-card--create">
            <label className="crm-user-avatar-upload" htmlFor={newUserAvatarInputId}>
              {userForm.avatarUrl &&
              (userForm.avatarUrl.startsWith("data:") ||
                userForm.avatarUrl.startsWith("http")) ? (
                <img src={userForm.avatarUrl} alt="" />
              ) : (
                <span className="crm-user-avatar-upload__fallback">+</span>
              )}
              <input
                id={newUserAvatarInputId}
                type="file"
                accept="image/*"
                className="crm-user-avatar-upload__input"
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  event.target.value = "";
                  if (!file) {
                    return;
                  }
                  try {
                    const url = await resizeImageFileToDataUrl(file);
                    setUserForm((prev) => ({ ...prev, avatarUrl: url }));
                  } catch (error) {
                    const code = (error as Error).message;
                    emitAppNotification(
                      code === "not_image"
                        ? ui.userAvatarNotImage
                        : ui.userAvatarTooLarge,
                    );
                  }
                }}
              />
            </label>
            <div>
              <h2>{ui.newUserTitle}</h2>
              <p>{ui.newUserSubtitle}</p>
              <p className="crm-muted crm-user-avatar-hint">{ui.userAvatarHint}</p>
            </div>
          </div>
        ) : selectedUser ? (
          <div className="crm-user-card">
            <div className="crm-user-card__avatar">
              {getUserInitials(selectedUser.displayName)}
            </div>
            <div>
              <h2>{selectedUser.displayName}</h2>
              {roleLabel ? <p>{roleLabel}</p> : null}
            </div>
          </div>
        ) : null}

        <div className="crm-form-grid">
          <label>
            <span>{ui.fieldLogin}</span>
            <input
              className="spx-input crm-input crm-input--editor"
              value={userForm.login}
              onChange={(event) =>
                setUserForm((prev) => ({
                  ...prev,
                  login: event.target.value,
                }))
              }
            />
          </label>
          <label>
            <span>{ui.fieldEmail}</span>
            <input
              className="spx-input crm-input crm-input--editor"
              value={userForm.email}
              onChange={(event) =>
                setUserForm((prev) => ({
                  ...prev,
                  email: event.target.value,
                }))
              }
            />
          </label>
          <label>
            <span>{ui.fieldName}</span>
            <input
              className="spx-input crm-input crm-input--editor"
              value={userForm.name}
              onChange={(event) =>
                setUserForm((prev) => ({
                  ...prev,
                  name: event.target.value,
                }))
              }
            />
          </label>
          <label>
            <span>{ui.fieldSurname}</span>
            <input
              className="spx-input crm-input crm-input--editor"
              value={userForm.surname}
              onChange={(event) =>
                setUserForm((prev) => ({
                  ...prev,
                  surname: event.target.value,
                }))
              }
            />
          </label>
          <label>
            <span>{ui.fieldLastname}</span>
            <input
              className="spx-input crm-input crm-input--editor"
              value={userForm.lastname}
              onChange={(event) =>
                setUserForm((prev) => ({
                  ...prev,
                  lastname: event.target.value,
                }))
              }
            />
          </label>
          <label>
            <span>{ui.fieldCountry}</span>
            <input
              className="spx-input crm-input crm-input--editor"
              value={userForm.country}
              onChange={(event) =>
                setUserForm((prev) => ({
                  ...prev,
                  country: event.target.value,
                }))
              }
            />
          </label>
          <label>
            <span>{ui.fieldRole}</span>
            <select
              className="spx-input crm-input crm-input--editor"
              value={userForm.permissions}
              onChange={(event) =>
                setUserForm((prev) => ({
                  ...prev,
                  permissions: event.target.value,
                }))
              }
            >
              <option value="0">{ui.roleUser}</option>
              <option value="1">{ui.roleAdmin}</option>
            </select>
          </label>
          <label>
            <span>{ui.fieldAvatarUrl}</span>
            <input
              className="spx-input crm-input crm-input--editor"
              value={userForm.avatarUrl}
              onChange={(event) =>
                setUserForm((prev) => ({
                  ...prev,
                  avatarUrl: event.target.value,
                }))
              }
            />
          </label>
          <label className="crm-form-grid__wide">
            <span>{ui.fieldAdminNote}</span>
            <textarea
              className="spx-input crm-input crm-input--editor crm-textarea"
              value={userForm.note}
              onChange={(event) =>
                setUserForm((prev) => ({
                  ...prev,
                  note: event.target.value,
                }))
              }
            />
          </label>
          <label className="crm-form-grid__wide">
            <span>{ui.fieldPassword}</span>
            <input
              className="spx-input crm-input crm-input--editor"
              type="password"
              autoComplete="new-password"
              value={userForm.password}
              onChange={(event) =>
                setUserForm((prev) => ({
                  ...prev,
                  password: event.target.value,
                }))
              }
            />
            <span className="crm-field-hint">
              {isCreateUser ? ui.fieldPasswordCreateHint : ui.fieldPasswordHint}
            </span>
          </label>
        </div>
        <button
          type="button"
          className="crm-btn crm-btn--primary"
          onClick={() => void onSaveUser()}
        >
          {isCreateUser ? ui.createUser : ui.saveUser}
        </button>
      </article>
    </PlatformPage>
  );
}
