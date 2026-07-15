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
  const subject = "Код входа в Devuko CRM";

  const text = [
    "Devuko CRM",
    "",
    `Ваш код для входа: ${code}`,
    "",
    "Код действует 10 минут.",
    "Если вы не запрашивали вход, проигнорируйте это письмо.",
  ].join("\n");

  const html = `<!DOCTYPE html>
<html lang="ru">
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:24px;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:480px;margin:0 auto;background:#fff;border:1px solid #e4e4e7;border-radius:14px;">
    <tr><td style="height:4px;background:#8b5cf6;"></td></tr>
    <tr>
      <td style="padding:28px 24px;">
        <p style="margin:0 0 8px;font-size:12px;color:#7c3aed;font-weight:700;letter-spacing:.08em;text-transform:uppercase;">Devuko CRM</p>
        <h1 style="margin:0 0 12px;font-size:22px;color:#18181b;">Код для входа</h1>
        <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#52525b;">Введите код на экране авторизации. Он действует 10 минут.</p>
        <p style="margin:0;font-size:32px;font-weight:700;letter-spacing:.24em;color:#4c1d95;font-family:Consolas,Monaco,monospace;">${safeCode}</p>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, text, html };
}

export function isMailRuFamily(email: string) {
  const domain = email.trim().toLowerCase().split("@")[1] ?? "";
  return ["mail.ru", "inbox.ru", "list.ru", "bk.ru", "internet.ru"].includes(domain);
}
