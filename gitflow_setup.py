import os
import subprocess
import sys
from pathlib import Path

repo = Path(r"C:\Users\ramiro\Downloads\proyecto\SMARTFAST")
os.chdir(repo)

# Buscar git
git_candidates = [
    r"C:\Program Files\Git\bin\git.exe",
    r"C:\Program Files (x86)\Git\bin\git.exe",
    os.path.expandvars(r"%LOCALAPPDATA%\Programs\Git\bin\git.exe"),
]
git = None
for c in git_candidates:
    if os.path.exists(c):
        git = c
        break

if not git:
    # intentar con where
    try:
        result = subprocess.run(["where", "git"], capture_output=True, text=True, shell=True)
        if result.returncode == 0 and result.stdout.strip():
            git = result.stdout.strip().splitlines()[0]
    except:
        pass

if not git:
    print("ERROR: No se encontró git.exe")
    sys.exit(1)

print(f"Usando git: {git}")
subprocess.run([git, "--version"])

# Inicializar si no existe
if not (repo / ".git").exists():
    print("\n[INFO] Inicializando repositorio...")
    subprocess.run([git, "init"])

# Configurar usuario
print("\n[INFO] Configurando usuario local...")
subprocess.run([git, "config", "user.email", "dev@smartfast.local"])
subprocess.run([git, "config", "user.name", "Smartfast Dev"])

# Añadir y commitear
print("\n[INFO] Añadiendo archivos...")
subprocess.run([git, "add", "."])

# Comprobar si hay cambios
result = subprocess.run([git, "diff-index", "--quiet", "HEAD"], capture_output=True)
if result.returncode != 0:
    print("[INFO] Creando commit inicial...")
    subprocess.run([git, "commit", "-m", "chore: initial commit - base proyecto SMARTFAST con esquema SQL normalizado"])
    print("[OK] Commit creado")
else:
    print("[SKIP] Sin cambios para commitear")

# Configurar ramas main/develop
print("\n[INFO] Configurando ramas Gitflow...")
subprocess.run([git, "branch", "-M", "main"])

# Comprobar develop
result = subprocess.run([git, "branch", "--list", "develop"], capture_output=True, text=True)
if "develop" not in result.stdout:
    print("[INFO] Creando rama develop...")
    subprocess.run([git, "checkout", "-b", "develop"])
else:
    print("[INFO] Cambiando a rama develop...")
    subprocess.run([git, "checkout", "develop"])

print(f"[OK] Rama activa: {subprocess.check_output([git, 'branch', '--show-current'], text=True).strip()}")

# Crear docs/GITFLOW.md
print("\n[INFO] Creando documentación Gitflow...")
docs_dir = repo / "docs"
docs_dir.mkdir(exist_ok=True)

gitflow_content = """# Gitflow - SMARTFAST

## Ramas principales
- `main` -> Código en producción (estable). Solo se mergea desde `release/*` o `hotfix/*`.
- `develop` -> Rama de integración. Aquí van todas las `feature/*` completadas.

## Ramas de apoyo
- `feature/<nombre>` -> Parte de `develop`. Se mergea a `develop` con `--no-ff`.
- `release/<version>` -> Parte de `develop`. Se mergea a `main` y de vuelta a `develop` con `--no-ff`. Generar tag `v<version>`.
- `hotfix/<nombre>` -> Parte de `main`. Se mergea a `main` y de vuelta a `develop` con `--no-ff`. Generar tag `vX.Y.Z`.

## Convención de commits (Conventional Commits)
- `feat:` Nueva funcionalidad
- `fix:` Corrección de bug
- `refactor:` Refactor sin cambio funcional
- `chore:` Tareas de mantenimiento/configuración
- `docs:` Documentación
- `style:` Cambios de formato (sin código)
- `test:` Añadir o modificar tests
- `perf:` Mejora de rendimiento

## Flujo rápido

### Nueva feature
```bash
git checkout develop
git checkout -b feature/multi-restaurante
# ... desarrollar ...
git checkout develop
git merge --no-ff feature/multi-restaurante
git branch -d feature/multi-restaurante
```

### Release
```bash
git checkout develop
git checkout -b release/1.0.0
# ... ajustes finales ...
git checkout main
git merge --no-ff release/1.0.0
git tag -a v1.0.0 -m "Release v1.0.0"
git checkout develop
git merge --no-ff release/1.0.0
git branch -d release/1.0.0
```

### Hotfix
```bash
git checkout main
git checkout -b hotfix/correccion-urgente
# ... corrección ...
git checkout main
git merge --no-ff hotfix/correccion-urgente
git tag -a v1.0.1 -m "Hotfix v1.0.1"
git checkout develop
git merge --no-ff hotfix/correccion-urgente
git branch -d hotfix/correccion-urgente
```
"""

with open(docs_dir / "GITFLOW.md", "w", encoding="utf-8") as f:
    f.write(gitflow_content)

print("[OK] docs/GITFLOW.md creado")

# Commitear docs
print("\n[INFO] Commiteando documentación...")
subprocess.run([git, "add", "docs/GITFLOW.md", ".gitignore"])
result = subprocess.run([git, "diff-index", "--quiet", "HEAD"], capture_output=True)
if result.returncode != 0:
    subprocess.run([git, "commit", "-m", "docs: añadir guía Gitflow y .gitignore"])
    print("[OK] Commit de documentación creado")
else:
    print("[SKIP] Sin cambios para commitear")

# Mostrar estado
print("\n=== RAMAS ===")
subprocess.run([git, "branch", "-a"])

print("\n=== ÚLTIMOS COMMITS ===")
subprocess.run([git, "log", "--oneline", "-5"])

print("\n=== GITFLOW CONFIGURADO CORRECTAMENTE ===")
print(f"Rama activa: {subprocess.check_output([git, 'branch', '--show-current'], text=True).strip()}")
print(f"Ubicación: {repo}")
