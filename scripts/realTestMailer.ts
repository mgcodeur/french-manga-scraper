import nodemailer from "nodemailer";

import * as dotenv from "dotenv";
dotenv.config();

const {
  MAIL_HOST,
  MAIL_PORT,
  MAIL_USER,
  MAIL_PASS,
  MAIL_TO,
  MAIL_FROM
} = process.env;

async function sendMail() {
  const transporter = nodemailer.createTransport({
    host: MAIL_HOST,
    port: parseInt(MAIL_PORT || "587"),
    secure: false,
    auth: {
      user: MAIL_USER,
      pass: MAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: MAIL_FROM,
    to: MAIL_TO,
    subject: "🚨 Manga Scraper - TEST D'ÉCHEC",
    text: "Les tests d'intégration (réels) ont échoué. Vérifie que le site ScanVF n'a pas changé.",
  });

  console.log("📨 Mail envoyé avec succès !");
}

sendMail().catch((err) => {
  console.error("❌ Erreur d'envoi d'email :", err);
  process.exit(1);
});
