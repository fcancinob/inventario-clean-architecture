# 📦 Sistema de Gestión de Inventario (Inventory Management API & Client)

> **Caso de Estudio / Desafío Técnico:** Este repositorio contiene la solución a un desafío técnico diseñado según requerimientos reales de la industria. Se implementó una solución fullstack end-to-end orientada a un **MVP (Producto Mínimo Viable)** 100% funcional, aplicando arquitectura limpia, bajo acoplamiento y buenas prácticas de ingeniería de software.

---

## 🛠️ Stack Tecnológico

* **Backend:** C# | .NET 8 Web API | Entity Framework Core
* **Base de Datos:** SQL Server / PostgreSQL | Redis (Caching)
* **Frontend:** React + Vite | Tailwind CSS
* **Herramientas & Herramientas:** Docker | Postman / Swagger UI

---

## 🚀 Arquitectura y Decisiones Técnicas

El proyecto fue estructurado siguiendo principios de **Clean Architecture** y **SOLID** para garantizar escalabilidad y mantenibilidad:

* **Separación de Capas:** Dominio, Aplicación, Infraestructura y API claramente delimitados.
* **Optimización de Rendimiento:** Implementación de Redis para consultas frecuentes de lectura y reducción de latencia.
* **Resiliencia & Manejo de Errores:** Middleware global de excepciones para respuestas HTTP estandarizadas y controladas.
* **Seguridad & Configuración:** Aislamiento de variables de entorno sensibles y configuración mediante patrones de opciones (`IOptions`).

---

## ✨ Funcionalidades Principales

- [x] **CRUD Completo de Inventario:** Creación, edición, eliminación y listado de productos/categorías.
- [x] **Filtros Avanzados y Paginado:** Paginación eficiente en base de datos para manejo de volumen.
- [x] **Integración RESTful:** Consumo estructurado de endpoints con validaciones en frontend y backend.
- [x] **Interfaz Reactiva:** Frontend dinámico optimizado para respuesta rápida al usuario.

---

## ⚙️ Ejecución Local (Quick Start)

### Requisitos previos
* .NET 8 SDK
* Node.js (v18+)
* Docker & Docker Compose (Opcional)

### Pasos para ejecutar

1. **Clonar el repositorio:**
   ```bash
   git clone [https://github.com/TU_USUARIO/TU_REPOSITORIO.git](https://github.com/TU_USUARIO/TU_REPOSITORIO.git)
   cd TU_REPOSITORIO
