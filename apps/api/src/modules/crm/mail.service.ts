import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createTransport, type Transporter } from "nodemailer";
import { pickMailChildEnv } from "../../common/child-env.util";
import { buildLoginCodeEmail, isMailRuFamily } from "./login-code.email";

type SenderProfile = {
  key: string;
  transporter: Transporter;
  from: string;
  bounceMailbox: string;
};

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly senders = new Map<string, SenderProfile>();
  private readonly echoOtp: boolean;
  private readonly smtpHost: string;
  private readonly smtpPort: number;
  private readonly smtpPass: string;

  constructor(private readonly config: ConfigService) {
    this.echoOtp = this.config.get<string>("AUTH_OTP_ECHO") === "true";
    this.smtpHost = this.config.get<string>("AUTH_SMTP_HOST")?.trim() || "mail.hosting.reg.ru";
    this.smtpPort = Number(this.config.get<string>("AUTH_SMTP_PORT") ?? "465");
    this.smtpPass = this.config.get<string>("AUTH_SMTP_PASS")?.trim() ?? "";

    const noreplyUser = this.config.get<string>("AUTH_SMTP_USER")?.trim() || "noreply@devuko.ru";
    const noreplyFrom =
      this.config.get<string>("AUTH_EMAIL_FROM")?.trim() || "Devuko CRM <noreply@devuko.ru>";
    const supportUser =
      this.config.get<string>("AUTH_SMTP_USER_SUPPORT")?.trim() || "support@devuko.ru";
    const supportFrom =
      this.config.get<string>("AUTH_EMAIL_FROM_SUPPORT")?.trim() || "Devuko CRM <support@devuko.ru>";

    this.registerSender("noreply", noreplyUser, noreplyFrom);
    this.registerSender("support", supportUser, supportFrom);
  }

  private registerSender(key: string, user: string, from: string) {
    if (!user || !this.smtpPass) return;
    const transporter = createTransport({
      host: this.smtpHost,
      port: this.smtpPort,
      secure: this.smtpPort === 465,
      auth: { user, pass: this.smtpPass },
    });
    this.senders.set(key, { key, transporter, from, bounceMailbox: user });
  }

  private pickSender(email: string): SenderProfile {
    const profile = isMailRuFamily(email)
      ? this.senders.get("support")
      : this.senders.get("noreply");
    const fallback = this.senders.get("noreply") ?? this.senders.get("support");
    const selected = profile ?? fallback;
    if (!selected) {
      throw new Error("SMTP is not configured");
    }
    return selected;
  }

  private async sleep(ms: number) {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async hasRecentBounce(mailbox: string, recipient: string) {
    const script = `
import imaplib, email, sys, time, os
mailbox = sys.argv[1]
recipient = sys.argv[2].lower()
password = os.environ.get("SMTP_PASS", "")
host = sys.argv[3]
try:
    M = imaplib.IMAP4_SSL(host)
    M.login(mailbox, password)
    M.select('INBOX')
    typ, data = M.search(None, 'ALL')
    ids = data[0].split()[-8:]
    for i in reversed(ids):
        typ, msgdata = M.fetch(i, '(RFC822)')
        msg = email.message_from_bytes(msgdata[0][1])
        subject = (msg.get('Subject') or '').lower()
        if 'mail delivery failed' not in subject and 'delivery failed' not in subject:
            continue
        body = ''
        if msg.is_multipart():
            for part in msg.walk():
                if part.get_content_type() == 'text/plain':
                    payload = part.get_payload(decode=True)
                    if payload:
                        body = payload.decode(errors='replace').lower()
                        break
        else:
            payload = msg.get_payload(decode=True)
            if payload:
                body = payload.decode(errors='replace').lower()
        if recipient in body and ('spam message rejected' in body or 'could not be delivered' in body):
            print('BOUNCE')
            sys.exit(0)
    M.logout()
except Exception as e:
    print('ERROR', e, file=sys.stderr)
print('OK')
`;

    const { execFile } = await import("node:child_process");
    const { promisify } = await import("node:util");
    const execFileAsync = promisify(execFile);

    try {
      const { stdout } = await execFileAsync(
        "python3",
        ["-c", script, mailbox, recipient, this.smtpHost],
        {
          timeout: 12_000,
          env: pickMailChildEnv({ SMTP_PASS: this.smtpPass }),
        }
      );
      return stdout.includes("BOUNCE");
    } catch {
      return false;
    }
  }

  async sendLoginCode(email: string, code: string) {
    if (this.echoOtp) {
      this.logger.warn(`AUTH_OTP_ECHO: login code for ${email}: ${code}`);
      return;
    }

    const { subject, text, html } = buildLoginCodeEmail(code);
    const sender = this.pickSender(email);

    const result = await sender.transporter.sendMail({
      from: sender.from,
      to: email,
      replyTo: this.senders.get("support")?.from ?? sender.from,
      subject,
      text,
      html,
      headers: {
        "Auto-Submitted": "auto-generated",
        "X-Auto-Response-Suppress": "All",
      },
      envelope: {
        from: sender.bounceMailbox,
        to: email,
      },
    });

    await this.sleep(8_000);
    const bounced = await this.hasRecentBounce(sender.bounceMailbox, email);
    if (bounced) {
      this.logger.error(`Login code bounce for ${email} via ${sender.bounceMailbox}`);
      throw new Error(`Email rejected by recipient server for ${email}`);
    }

    this.logger.log(
      `Login code sent to ${email} via ${sender.bounceMailbox} (${result.messageId ?? "no-id"})`
    );
  }
}
