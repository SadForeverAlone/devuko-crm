type CrmLoginScreenProps = {
  title: string;
  subtitle: string;
  loginLabel: string;
  passwordLabel: string;
  loginPlaceholder: string;
  passwordPlaceholder: string;
  submitLabel: string;
  login: string;
  password: string;
  loginError: string | null;
  onLoginChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: () => void;
};

export function CrmLoginScreen({
  title,
  subtitle,
  loginLabel,
  passwordLabel,
  loginPlaceholder,
  passwordPlaceholder,
  submitLabel,
  login,
  password,
  loginError,
  onLoginChange,
  onPasswordChange,
  onSubmit,
}: CrmLoginScreenProps) {
  return (
    <main className="crm-root crm-root--auth">
      <div className="crm-login-shell">
        <section className="crm-login crm-panel">
          <div className="crm-login__brand">
            <span className="crm-logo-dot" />
            <div>
              <h1>{title}</h1>
              <p>{subtitle}</p>
            </div>
          </div>
          <div className="crm-login__form">
            <label className="crm-field">
              <span>{loginLabel}</span>
              <input
                className="spx-input crm-input"
                placeholder={loginPlaceholder}
                value={login}
                onChange={(event) => onLoginChange(event.target.value)}
              />
            </label>
            <label className="crm-field">
              <span>{passwordLabel}</span>
              <input
                className="spx-input crm-input"
                placeholder={passwordPlaceholder}
                type="password"
                value={password}
                onChange={(event) => onPasswordChange(event.target.value)}
              />
            </label>
            {loginError ? <p className="spx-form-error">{loginError}</p> : null}
            <button type="button" className="crm-btn crm-btn--primary" onClick={onSubmit}>
              {submitLabel}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
