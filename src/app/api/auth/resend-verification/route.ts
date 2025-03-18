import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email requis" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        emailVerified: true,
        name: true,
      },
    });

    if (!user || user.emailVerified) {
      // Retourner une réponse positive même si l'utilisateur n'existe pas
      // pour éviter la divulgation d'informations
      return NextResponse.json({
        message:
          "Si un compte non vérifié existe avec cet email, un nouveau lien de vérification sera envoyé.",
      });
    }

    // Générer un nouveau token de vérification
    const verificationToken = crypto.randomBytes(32).toString("hex");

    // Mettre à jour le token dans la base de données
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: verificationToken,
      },
    });

    const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${verificationToken}`;

    // Envoyer l'email
    await sendEmail({
      to: email,
      subject: "Vérification de votre compte - 75Tribune",
      text: `Bonjour ${user.name},\n\nMerci de vous être inscrit sur 75Tribune. Pour vérifier votre compte, veuillez cliquer sur le lien suivant :\n\n${verificationUrl}\n\nSi vous n'avez pas créé de compte sur 75Tribune, vous pouvez ignorer cet email.\n\nCordialement,\nL'équipe 75Tribune`,
      html: `
        <h1>Vérification de votre compte</h1>
        <p>Bonjour ${user.name},</p>
        <p>Merci de vous être inscrit sur 75Tribune. Pour vérifier votre compte, veuillez cliquer sur le bouton ci-dessous :</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #0284c7; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Vérifier mon compte
          </a>
        </p>
        <p>Si le bouton ne fonctionne pas, vous pouvez copier et coller le lien suivant dans votre navigateur :</p>
        <p style="background-color: #f3f4f6; padding: 10px; word-break: break-all;">
          ${verificationUrl}
        </p>
        <p>Si vous n'avez pas créé de compte sur 75Tribune, vous pouvez ignorer cet email.</p>
        <p>Cordialement,<br>L'équipe 75Tribune</p>
      `,
    });

    return NextResponse.json({
      message:
        "Un nouveau lien de vérification a été envoyé à votre adresse email.",
    });
  } catch (error) {
    console.error("Erreur lors du renvoi du lien de vérification:", error);
    return NextResponse.json(
      {
        error:
          "Une erreur est survenue lors de l'envoi du lien de vérification.",
      },
      { status: 500 }
    );
  }
}
