$ErrorActionPreference = "SilentlyContinue"

$git = "C:\Program Files\Git\bin\git.exe"
$repo = "C:\Users\ramiro\Downloads\proyecto\SMARTFAST"

Set-Location $repo

Write-Host "=== Gitflow Setup ===" -ForegroundColor Cyan
Write-Host "Git: $git"
& $git --version
Write-Host ""

# Inicializar si no existe
if (-not (Test-Path ".git")) {
    Write-Host "[INFO] Inicializando repositorio..." -ForegroundColor Yellow
    & $git init
    Write-Host ""
}

# Configurar usuario local
Write-Host "[INFO] Configurando usuario local..." -ForegroundColor Yellow
& $git config user.email "dev@smartfast.local"
& $git config user.name "Smartfast Dev"
Write-Host ""

# Añadir y commitear si hay cambios
Write-Host "[INFO] Comprobando cambios..." -ForegroundColor Yellow
& $git add .
& $git diff-index --quiet HEAD
if ($LASTEXITCODE -ne 0) {
    Write-Host "[INFO] Creando commit inicial..." -ForegroundColor Yellow
    & $git commit -m "chore: initial commit - base proyecto SMARTFAST con esquema SQL normalizado"
    Write-Host "[OK] Commit creado" -ForegroundColor Green
} else {
    Write-Host "[SKIP] Sin cambios para commitear" -ForegroundColor Gray
}
Write-Host ""

# Configurar ramas
Write-Host "[INFO] Configurando ramas Gitflow..." -ForegroundColor Yellow
& $git branch -M main

$branches = & $git branch --list
if ($branches -notmatch "develop") {
    Write-Host "[INFO] Creando rama develop..." -ForegroundColor Yellow
    & $git checkout -b develop
} else {
    Write-Host "[INFO] Cambiando a rama develop..." -ForegroundColor Yellow
    & $git checkout develop
}
Write-Host "[OK] En rama: $(git branch --show-current)" -ForegroundColor Green
Write-Host ""

# Crear documentación
Write-Host "[INFO] Creando documentación Gitflow..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path "docs" | Out-Null

$gitflowDoc = @"
# Gitflow - SMARTFAST

## Ramas principales
- ``main`` -> Código en producción (estable). Solo se mergea desde ``release/*`` o ``hotfix/*``.
- ``develop`` -> Rama de integración. Aquí van todas las ``feature/*`` completadas.

## Ramas de apoyo
- ``feature/<nombre>`` -> Parte de ``develop``. Se mergea a ``develop`` con ``--no-ff``.
- ``release/<version>`` -> Parte de ``develop``. Se mergea a ``main`` y de vuelta a ``develop`` con ``--no-ff``. Generar tag ``v<version>``.
- ``hotfix/<nombre>`` -> Parte de ``main``. Se mergea a ``main`` y de vuelta a ``develop`` con ``--no-ff``. Generar tag ``vX.Y.Z``.

## Convención de commits (Conventional Commits)
- ``feat:`` Nueva funcionalidad
- ``fix:`` Corrección de bug
- ``refactor:`` Refactor sin cambio funcional
- ``chore:`` Tareas de mantenimiento/configuración
- ``docs:`` Documentación
- ``style:`` Cambios de formato (sin código)
- ``test:`` Añadir o modificar tests
- ``perf:`` Mejora de rendimiento

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
"@

$gitflowDoc | Out-File -FilePath "docs\GITFLOW.md" -Encoding UTF8
Write-Host "[OK] docs/GITFLOW.md creado" -ForegroundColor Green
Write-Host ""

# Commit docs
Write-Host "[INFO] Commiteando documentación..." -ForegroundColor Yellow
& $git add docs/GITFLOW.md .gitignore
& $git diff-index --quiet HEAD
if ($LASTEXITCODE -ne 0) {
    & $git commit -m "docs: añadir guía Gitflow y .gitignore"
    Write-Host "[OK] Commit de documentación creado" -ForegroundColor Green
} else {
    Write-Host "[SKIP] Sin cambios para commitear" -ForegroundColor Gray
}
Write-Host ""

# Mostrar estado
Write-Host "=== RAMAS ===" -ForegroundColor Cyan
& $git branch -a
Write-Host ""
Write-Host "=== ÚLTIMOS COMMITS ===" -ForegroundColor Cyan
& $git log --oneline -5
Write-Host ""
Write-Host "=== GITFLOW CONFIGURADO CORRECTAMENTE ===" -ForegroundColor Green
Write-Host "Rama activa: $(git branch --show-current)"
Write-Host ""
