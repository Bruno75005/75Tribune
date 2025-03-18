"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "react-hot-toast";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const settingsFormSchema = z.object({
  siteName: z.string().min(2, {
    message: "Le nom du site doit contenir au moins 2 caractères.",
  }),
  siteUrl: z.string().url({
    message: "Veuillez entrer une URL valide.",
  }),
  contactEmail: z.string().email({
    message: "Veuillez entrer une adresse email valide.",
  }),
  adminEmail: z.string().email({
    message: "Veuillez entrer une adresse email valide.",
  }),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      siteName: "",
      siteUrl: "",
      contactEmail: "",
      adminEmail: "",
    },
  });

  // Charger les paramètres actuels
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/settings");
        if (!response.ok)
          throw new Error("Erreur lors du chargement des paramètres");

        const settings = await response.json();
        form.reset(settings);
      } catch (error) {
        toast.error("Erreur lors du chargement des paramètres");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [form]);

  async function onSubmit(data: SettingsFormValues) {
    try {
      setIsLoading(true);
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok)
        throw new Error("Erreur lors de la mise à jour des paramètres");

      toast.success("Paramètres mis à jour avec succès");
    } catch (error) {
      toast.error("Erreur lors de la mise à jour des paramètres");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Paramètres du site</CardTitle>
          <CardDescription>
            Configurez les paramètres généraux de votre application.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="siteName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom du site</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="75Tribune"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormDescription>
                      Le nom qui sera affiché dans le titre du site et les
                      emails.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="siteUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL du site</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://75Tribune.com"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormDescription>
                      L&apos;URL principale de votre site.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              <FormField
                control={form.control}
                name="contactEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email de contact</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="contact@75Tribune.com"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormDescription>
                      L&apos;adresse email de contact principale.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="adminEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email administrateur</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="admin@75Tribune.com"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormDescription>
                      L&apos;adresse email pour les notifications
                      administrateur.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? "Enregistrement..."
                  : "Enregistrer les modifications"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
