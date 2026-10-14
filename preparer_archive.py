import os
import zipfile
import shutil

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_ZIP = os.path.join(ROOT_DIR, "cs2-tactical-hq-deploy.zip")

EXCLUDE_DIRS = {
    'node_modules',
    '.venv',
    '__pycache__',
    '.git',
    '.system_generated'
}

EXCLUDE_EXTS = {
    '.pyc',
    '.pyo',
    '.db'
}

def create_deploy_zip():
    print(f"Création de l'archive de déploiement : {OUTPUT_ZIP}...")
    with zipfile.ZipFile(OUTPUT_ZIP, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(ROOT_DIR):
            # Filtrer les dossiers exclus
            dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
            
            for file in files:
                if file.endswith(tuple(EXCLUDE_EXTS)) or file == os.path.basename(OUTPUT_ZIP):
                    continue
                
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, ROOT_DIR)
                zipf.write(full_path, rel_path)
                
    print(f"Archive prête avec succès ({os.path.getsize(OUTPUT_ZIP) // 1024} Ko) !")

if __name__ == "__main__":
    create_deploy_zip()
