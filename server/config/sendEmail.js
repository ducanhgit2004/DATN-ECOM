import { sendEmail } from "./emailService.js";

const sendEmailFun = async (toOrOptions, subject, text, html) => {
  let to = toOrOptions;
  // support call signature sendEmailFun({ sendTo, subject, text, html })
  if (typeof toOrOptions === "object" && toOrOptions !== null) {
    to = toOrOptions.sendTo || toOrOptions.to || toOrOptions.email;
    subject = toOrOptions.subject;
    text = toOrOptions.text;
    html = toOrOptions.html;
  }

  if (!to) {
    console.error("sendEmailFun: missing recipient 'to'");
    return false;
  }

  const result = await sendEmail(to, subject || "", text || "", html || "");
  return result && result.success ? true : false;
};

export default sendEmailFun;
