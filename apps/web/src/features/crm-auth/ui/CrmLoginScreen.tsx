import { FormEvent, useEffect, useId, useRef, useState } from "react";
import { CrmOtpInput } from "./CrmOtpInput";

import type { CrmLang } from "@/widgets/crm-app/model/types";

type CrmLoginScreenProps = {
  crmLang: CrmLang;
  title: string;
  subtitle: string;
  stepCredentialsLabel: string;
  stepCodeLabel: string;
  loginLabel: string;
  loginPlaceholder: string;
  passwordLabel: string;
  passwordPlaceholder: string;
  codeLabel: string;
  continueLabel: string;
  verifyLabel: string;
  backLabel: string;
  sendingLabel: string;
  codeHint: string;
  login: string;
  password: string;
  code: string;
  authStep: "credentials" | "code";
  loginError: string | null;
  submitting: boolean;
  onLoginChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onCodeChange: (value: string) => void;
  onContinue: () => void;
  onVerify: () => void;
  onBack: () => void;
};

export function CrmLoginScreen({
  crmLang,
  title,
  subtitle,
  stepCredentialsLabel,
  stepCodeLabel,
  loginLabel,
  loginPlaceholder,
  passwordLabel,
  passwordPlaceholder,
  codeLabel,
  continueLabel,
  verifyLabel,
  backLabel,
  sendingLabel,
  codeHint,
  login,
  password,
  code,
  authStep,
  loginError,
  submitting,
  onLoginChange,
  onPasswordChange,
  onCodeChange,
  onContinue,
  onVerify,
  onBack,
}: CrmLoginScreenProps) {
  const isCodeStep = authStep === "code";
  const prevStep = useRef(authStep);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [shake, setShake] = useState(false);
  const errorId = useId();

  useEffect(() => {
    if (prevStep.current !== authStep) {
      setDirection(authStep === "code" ? "forward" : "back");
      prevStep.current = authStep;
    }
  }, [authStep]);

  useEffect(() => {
    if (!loginError || !isCodeStep) return;
    setShake(true);
    const timer = window.setTimeout(() => setShake(false), 520);
    return () => window.clearTimeout(timer);
  }, [isCodeStep, loginError]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (submitting) return;
    if (isCodeStep) onVerify();
    else onContinue();
  };

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

          <div
            className="crm-login__progress"
            role="group"
            aria-label={`${stepCredentialsLabel} / ${stepCodeLabel}`}
          >
            <div
              className={`crm-login__progress-step${!isCodeStep ? " crm-login__progress-step--active" : " crm-login__progress-step--done"}`}
              aria-current={!isCodeStep ? "step" : undefined}
            >
              <span className="crm-login__progress-dot" aria-hidden="true">
                1
              </span>
              <span>{stepCredentialsLabel}</span>
            </div>
            <span
              className={`crm-login__progress-line${isCodeStep ? " crm-login__progress-line--active" : ""}`}
              aria-hidden="true"
            />
            <div
              className={`crm-login__progress-step${isCodeStep ? " crm-login__progress-step--active" : ""}`}
              aria-current={isCodeStep ? "step" : undefined}
            >
              <span className="crm-login__progress-dot" aria-hidden="true">
                2
              </span>
              <span>{stepCodeLabel}</span>
            </div>
          </div>

          <form
            className={`crm-login__form${shake ? " crm-login__form--shake" : ""}`}
            data-step={authStep}
            data-direction={direction}
            onSubmit={handleSubmit}
            noValidate
          >
            <div key={authStep} className={`crm-login__pane crm-login__pane--${authStep}`}>
              {!isCodeStep ? (
                <>
                  <label className="crm-field">
                    <span>{loginLabel}</span>
                    <input
                      className="spx-input crm-input"
                      type="text"
                      autoComplete="username"
                      placeholder={loginPlaceholder}
                      value={login}
                      disabled={submitting}
                      aria-invalid={Boolean(loginError) && !isCodeStep}
                      aria-describedby={loginError ? errorId : undefined}
                      onChange={(event) => onLoginChange(event.target.value)}
                    />
                  </label>
                  <label className="crm-field">
                    <span>{passwordLabel}</span>
                    <input
                      className="spx-input crm-input"
                      type="password"
                      autoComplete="current-password"
                      placeholder={passwordPlaceholder}
                      value={password}
                      disabled={submitting}
                      aria-invalid={Boolean(loginError) && !isCodeStep}
                      aria-describedby={loginError ? errorId : undefined}
                      onChange={(event) => onPasswordChange(event.target.value)}
                    />
                  </label>
                </>
              ) : (
                <>
                  <div className="crm-login__code-banner">
                    <span className="crm-login__code-banner-icon" aria-hidden="true">
                      ✉
                    </span>
                    <p className="crm-login__hint">{codeHint}</p>
                  </div>
                  <div className="crm-field" role="group" aria-labelledby={`${errorId}-code-label`}>
                    <span id={`${errorId}-code-label`}>{codeLabel}</span>
                    <CrmOtpInput
                      value={code}
                      disabled={submitting}
                      hasError={Boolean(loginError)}
                      digitLabel={(index) =>
                        crmLang === "ru" ? `Цифра ${index + 1}` : `Digit ${index + 1}`
                      }
                      onChange={onCodeChange}
                      onComplete={() => {
                        if (!submitting) onVerify();
                      }}
                    />
                  </div>
                </>
              )}

              {loginError ? (
                <p id={errorId} className="crm-login__alert crm-login__alert--error" role="alert">
                  {loginError}
                </p>
              ) : null}

              {isCodeStep ? (
                <div className="crm-login__actions">
                  <button type="button" className="crm-btn crm-btn--ghost" disabled={submitting} onClick={onBack}>
                    {backLabel}
                  </button>
                  <button
                    type="submit"
                    className={`crm-btn crm-btn--primary${submitting ? " crm-btn--loading" : ""}`}
                    disabled={submitting || code.length < 6}
                    aria-busy={submitting}
                  >
                    {verifyLabel}
                  </button>
                </div>
              ) : (
                <button
                  type="submit"
                  className={`crm-btn crm-btn--primary${submitting ? " crm-btn--loading" : ""}`}
                  disabled={submitting}
                  aria-busy={submitting}
                >
                  {submitting ? sendingLabel : continueLabel}
                </button>
              )}
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
