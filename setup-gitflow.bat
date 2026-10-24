@echo off
setlocal

set "GIT=C:\Program Files\Git\bin\git.exe"
set "REPO=C:\Users\ramiro\Downloads\proyecto\SMARTFAST"

cd /d "%REPO%"

echo [INFO] Usando Git: %GIT%
"%GIT%" --version
echo.

if not exist ".git" (
    echo [INFO] Inicializando repositorio Git...
    "%GIT%" init
    echo.
)

echo [INFO] Configurando usuario local...
"%GIT%" config user.email "dev@smartfast.local"
"%GIT%" config user.name "Smartfast Dev"
echo.

echo [INFO] Añadiendo archivos y creando commit inicial si es necesario...
"%GIT%" add .
"%GIT%" diff-index --quiet HEAD 2>nul
if errorlevel 1 (
    "%GIT%" commit -m "chore: initial commit - base proyecto SMARTFAST con esquema SQL normalizado"
    echo [OK] Commit inicial creado
) else (
    echo [SKIP] No hay cambios para commitear
)
echo.

echo [INFO] Configurando ramas Gitflow (main / develop)...
"%GIT%" branch -M main

"%GIT%" show-ref --verify --quiet refs/heads/develop
if errorlevel 1 (
    echo [INFO] Creando rama develop...
    "%GIT%" checkout -b develop
) else (
    echo [INFO] Cambiando a rama develop...
    "%GIT%" checkout develop
)
echo.

echo [INFO] Generando documentación Gitflow...
if not exist "docs" mkdir docs

(
echo # Gitflow - SMARTFAST
echo.
echo ## Ramas principales
echo - `main` -^> Código en producción ^(estable^). Solo se mergea desde `release/*` o `hotfix/*`.
echo - `develop` -^> Rama de integración. Aquí van todas las `feature/*` completadas.
echo.
echo ## Ramas de apoyo
echo - `feature/^<nombre^>` - Parte de `develop`. Se mergea a `develop` con `--no-ff`.
echo - `release/^<version^>` - Parte de `develop`. Se mergea a `main` y de vuelta a `develop` con `--no-ff`. Generar tag `v<version>`.
echo - `hotfix/^<nombre^>` - Parte de `main`. Se mergea a `main` y de vuelta a `develop` con `--no-ff`. Generar tag `vX.Y.Z+1`.
echo.
echo ## Convención de commits ^(Conventional Commits^)
echo - `feat:` Nueva funcionalidad
echo - `fix:` Corrección de bug
echo - `refactor:` Refactor sin cambio funcional
echo - `chore:` Tareas de mantenimiento/configuración
echo - `docs:` Documentación
echo - `style:` Cambios de formato ^(sin código^)
echo - `test:` Añadir o modificar tests
echo - `perf:` Mejora de rendimiento
echo.
echo ## Flujo rápido
echo.
echo ```bash
echo # Crear feature
echo git checkout develop
echo git checkout -b feature/multi-restaurante
echo.
echo # Finalizar feature
echo git checkout develop
echo git merge --no-ff feature/multi-restaurante
echo git branch -d feature/multi-restaurante
echo.
echo # Crear release
echo git checkout develop
echo git checkout -b release/1.0.0
echo # ... ajustes finales ...
echo git checkout main
echo git merge --no-ff release/1.0.0
echo git tag -a v1.0.0 -m "Release v1.0.0"
echo git checkout develop
echo git merge --no-ff release/1.0.0
echo git branch -d release/1.0.0
echo.
echo # Crear hotfix
echo git checkout main
echo git checkout -b hotfix/ajuste-urgente
echo # ... corrección ...
echo git checkout main
echo git merge --no-ff hotfix/ajuste-urgente
echo git tag -a v1.0.1 -m "Hotfix v1.0.1"
echo git checkout develop
echo git merge --no-ff hotfix/ajuste-urgente
echo git branch -d hotfix/ajuste-urgente
echo ```
) > "docs\GITFLOW.md"

echo [INFO] Añadiendo docs/GITFLOW.md y .gitignore...
"%GIT%" add docs/GITFLOW.md .gitignore 2>nul
"%GIT%" diff-index --quiet HEAD 2>nul
if errorlevel 1 (
    "%GIT%" commit -m "docs: añadir guía Gitflow y .gitignore"
    echo [OK] Commit de documentación creado
) else (
    echo [SKIP] Sin cambios nuevos para commitear
)
echo.

echo ========== ESTADO ACTUAL ==========
"%GIT%" branch -a
echo.
echo ========== ÚLTIMOS COMMITS ==========
"%GIT%" log --oneline -5
echo.
echo [DONE] Gitflow configurado correctamente en %REPO%
echo Rama activa: 
"%GIT%" branch --show-current
echo.

endlocal
pause
