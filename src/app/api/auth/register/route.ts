import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  hashPassword,
  createToken,
  setAuthCookie,
  generateVerificationToken,
} from "@/lib/auth.utils";
import { RegisterCredentials } from "@/types/auth";
import { sendEmail } from "@/lib/email";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as RegisterCredentials;
    const { email, password, name } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email et mot de passe requis" },
        { status: 400 }
      );
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Cet email est déjà utilisé" },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);
    const verificationToken = await generateVerificationToken();
    console.log("Token généré:", verificationToken);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: "USER",
        subscriptionType: "FREE",
        emailVerificationToken: verificationToken,
        emailVerified: false,
      },
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
        emailVerificationToken: true,
      },
    });

    console.log("Utilisateur créé avec token:", user.emailVerificationToken);

    // Envoyer l'email de vérification
    const verificationUrl = `${
      process.env.NEXTAUTH_URL
    }/verify-email?token=${verificationToken}&email=${encodeURIComponent(
      email
    )}`;

    try {
      await sendEmail({
        to: email,
        subject: "Vérification de votre compte - 75Tribune",
        text: `Bonjour ${name},\n\nMerci de vous être inscrit sur 75Tribune. Pour vérifier votre compte, veuillez cliquer sur le lien suivant :\n\n${verificationUrl}\n\nSi vous n'avez pas créé de compte sur 75Tribune, vous pouvez ignorer cet email.\n\nCordialement,\nL'équipe 75Tribune`,
        html: `
          <h1>Bienvenue sur 75Tribune !</h1>
          <p>Bonjour ${name},</p>
          <p>Merci de vous être inscrit sur 75Tribune. Pour vérifier votre compte, veuillez cliquer sur le lien suivant :</p>
          <p><a href="${verificationUrl}">Vérifier mon compte</a></p>
          <p>Si vous n'avez pas créé de compte sur 75Tribune, vous pouvez ignorer cet email.</p>
          <p>Cordialement,<br>L'équipe 75Tribune</p>
        `,
      });
      console.log("Email de vérification envoyé à:", email);
    } catch (emailError) {
      console.error("Erreur détaillée lors de l'envoi de l'email:", emailError);
      // On continue malgré l'erreur d'email, l'utilisateur pourra utiliser la fonction de renvoi
    }

    const token = await createToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json({
      success: true,
      message: "Inscription réussie. Veuillez vérifier votre email.",
      debug:
        process.env.NODE_ENV === "development"
          ? { verificationToken }
          : undefined,
    });

    await setAuthCookie(response, token);
    return response;
  } catch (error) {
    console.error("Erreur complète lors de l'inscription:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de l'inscription" },
      { status: 500 }
    );
  }
}
