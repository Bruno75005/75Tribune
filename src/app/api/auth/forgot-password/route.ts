import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";
import { sendEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email requis" }, { status: 400 });
    }

    // Générer un token de réinitialisation
    const passwordResetToken = randomBytes(32).toString("hex");
    const passwordResetExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 heures

    // Mettre à jour ou créer un token de réinitialisation
    await prisma.user.update({
      where: { email: email.toLowerCase() },
      data: {
        passwordResetToken,
        passwordResetExpires,
      },
    });

    // Construire l'URL de réinitialisation
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${passwordResetToken}`;

    // Envoyer l'email
    await sendEmail({
      to: email,
      subject: "Réinitialisation de votre mot de passe 75Tribune",
      text: `Pour réinitialiser votre mot de passe, cliquez sur ce lien : ${resetUrl}`,
      html: `
        <div>
          <h1>Réinitialisation de votre mot de passe</h1>
          <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
          <p>Cliquez sur le lien ci-dessous pour définir un nouveau mot de passe :</p>
          <a href="${resetUrl}">Réinitialiser mon mot de passe</a>
          <p>Ce lien expirera dans 24 heures.</p>
          <p>Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email.</p>
        </div>
      `,
    });

    // Pour des raisons de sécurité, nous retournons toujours un succès
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur lors de la réinitialisation du mot de passe:", error);
    // Pour des raisons de sécurité, nous retournons toujours un succès
    return NextResponse.json({ success: true });
  }
}
