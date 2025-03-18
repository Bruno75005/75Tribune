import os

def collect_project_files_content(source_dir, output_file, debug=False):
    """
    Parcourt le dossier source_dir et ses sous-dossiers, collecte le contenu
    de tous les fichiers ayant l'une des extensions voulues et les écrit dans output_file.

    Exclut les dossiers "node_modules", ".git", "env" et le fichier "package-lock.json".

    :param source_dir: Chemin vers le dossier du projet.
    :param output_file: Chemin du fichier de sortie (ex: results.txt).
    :param debug: Active l'affichage des fichiers trouvés.
    """
    # Dossiers à exclure
    excluded_dirs = {"node_modules", ".git", "env", "ui", ".next"}
    # Fichiers spécifiques à exclure
    excluded_files = {"package-lock.json"}
    # Extensions recherchées
    wanted_extensions = (".ejs", ".js", ".html", ".ts", ".tsx", ".json", ".md")

    file_count = 0  # Compteur de fichiers ajoutés

    # Vérifier si le dossier source existe
    if not os.path.exists(source_dir):
        print(f"❌ Le dossier {source_dir} n'existe pas. Vérifiez le chemin.")
        return

    try:
        with open(output_file, "w", encoding="utf-8") as outfile:
            outfile.write(f"### Résumé des fichiers trouvés dans {source_dir} ###\n\n")

            for root, dirs, files in os.walk(source_dir):
                # Supprime de la liste les dossiers qu'on ne souhaite pas parcourir
                dirs[:] = [d for d in dirs if d not in excluded_dirs]

                if debug:
                    print(f"📂 Exploration de {root} ({len(files)} fichiers)")

                for file in files:
                    # Vérifie l'extension ET le nom du fichier
                    if file.endswith(wanted_extensions) and file not in excluded_files:
                        file_path = os.path.join(root, file)
                        try:
                            with open(file_path, "r", encoding="utf-8", errors="ignore") as infile:
                                content = infile.read()

                            # Écrit dans results.txt
                            outfile.write(f"===== {file_path} =====\n\n")
                            outfile.write(content)
                            outfile.write("\n\n" + "=" * 80 + "\n\n")

                            file_count += 1
                            print(f"✅ Ajouté : {file_path}")
                        except Exception as e:
                            print(f"❌ Erreur lors de la lecture de {file_path} : {e}")

            outfile.write(f"\n### {file_count} fichiers enregistrés avec succès. ###\n")

        print(f"\n✅ Tous les fichiers ont été copiés dans {output_file} ({file_count} fichiers).")
    except Exception as e:
        print(f"❌ Erreur lors de l'écriture dans {output_file}: {e}")

# Exemple d'utilisation
if __name__ == "__main__":
    source_directory = r"C:\wamp64\www\75Tribune"  # Remplace par le chemin complet de ton projet
    output_file_path = "results.txt"

    collect_project_files_content(source_directory, output_file_path, debug=True)
