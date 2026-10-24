# Gitflow - SMARTFAST

## Ramas principales
- `main` -> Código en producción (estable). Solo se mergea desde `release/*` o `hotfix/*`.
- `develop` -> Rama de integración. Aquí van todas las `feature/*` completadas.

## Ramas de apoyo
- `feature/<nombre>` - Parte de `develop`. Se mergea a `develop` con `--no-ff`.
- `hotfix/<nombre>` - Parte de `main`. Se mergea a `main` y de vuelta a `develop` con `--no-ff`. Generar tag `vX.Y.Z+1`.

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

```bash
# Crear feature
git checkout develop
git checkout -b feature/multi-restaurante

# Finalizar feature
git checkout develop
git merge --no-ff feature/multi-restaurante
git branch -d feature/multi-restaurante

# Crear release
git checkout develop
git checkout -b release/1.0.0
# ... ajustes finales ...
git checkout main
git merge --no-ff release/1.0.0
git tag -a v1.0.0 -m "Release v1.0.0"
git checkout develop
git merge --no-ff release/1.0.0
git branch -d release/1.0.0

# Crear hotfix
git checkout main
git checkout -b hotfix/ajuste-urgente
# ... corrección ...
git checkout main
git merge --no-ff hotfix/ajuste-urgente
git tag -a v1.0.1 -m "Hotfix v1.0.1"
git checkout develop
git merge --no-ff hotfix/ajuste-urgente
git branch -d hotfix/ajuste-urgente
```
