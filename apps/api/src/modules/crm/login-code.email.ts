function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function buildLoginCodeEmail(code: string) {
  const safeCode = escapeHtml(code);
  // Plain subject — marketing-styled HTML gets Mail.ru spam-rejected.
  const subject = "Код входа в Devuko CRM";

  const text = [
    "Код для входа в Devuko CRM:",
    code,
    "",
    "Код действует 10 минут.",
    "Если вы не запрашивали вход, проигнорируйте это письмо.",
  ].join("\n");

  const html = `<!DOCTYPE html>
<html lang="ru">
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:16px;font-family:Arial,Helvetica,sans-serif;color:#111;font-size:15px;line-height:1.5;">
  <p style="margin:0 0 12px;">Код для входа в Devuko CRM:</p>
  <p style="margin:0 0 16px;font-size:28px;font-weight:700;font-family:Consolas,Monaco,monospace;letter-spacing:0.12em;">${safeCode}</p>
  <p style="margin:0;color:#444;">Код действует 10 минут. Если вы не запрашивали вход, проигнорируйте это письмо.</p>
</body>
</html>`;

  return { subject, text, html };
}

export function isMailRuFamily(email: string) {
  const domain = email.trim().toLowerCase().split("@")[1] ?? "";
  return ["mail.ru", "inbox.ru", "list.ru", "bk.ru", "internet.ru"].includes(domain);
}
