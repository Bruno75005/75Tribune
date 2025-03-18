import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const settings = await prisma.settings.findFirst()
    return NextResponse.json(settings)
  } catch (error) {
    console.error("Erreur lors de la récupération des paramètres:", error)
    return new NextResponse("Erreur interne du serveur", { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    
    const settings = await prisma.settings.upsert({
      where: {
        id: 1, // Nous utilisons un ID fixe car nous n'avons qu'un seul enregistrement de paramètres
      },
      update: {
        siteName: body.siteName,
        siteUrl: body.siteUrl,
        contactEmail: body.contactEmail,
        adminEmail: body.adminEmail,
      },
      create: {
        siteName: body.siteName,
        siteUrl: body.siteUrl,
        contactEmail: body.contactEmail,
        adminEmail: body.adminEmail,
      },
    })

    return NextResponse.json(settings)
  } catch (error) {
    console.error("Erreur lors de la mise à jour des paramètres:", error)
    return new NextResponse("Erreur interne du serveur", { status: 500 })
  }
}
