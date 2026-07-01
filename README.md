# 🍽️ TeamPlate - Sistema de Gestión de Restaurantes (Frontend)

Este proyecto constituye el núcleo visual de **TeamPlate**, una plataforma de gestión integral multiplataforma concebida para el sector HORECA (Hostelería, Restauración y Catering). Desarrollada con **Angular 20** y **Angular Material 3**, se enfoca en democratizar la gestión técnica para perfiles no digitalizados.

---

## 🚀 Tecnologías y Arquitectura

* **Framework:** Angular 20.3.x (Single Page Application).
* **Reactividad:** **Angular Signals** (reemplazando el uso intensivo de Zone.js y RxJS para una actualización de la interfaz de usuario a 60fps sin renderizados innecesarios).
* **UI/UX:** Angular Material 20.2.x y CSS3 nativo (MediaQueries, CSS Grid).
* **Interacciones Complejas:** Angular CDK `DragDropModule` para el diseño interactivo de los planos del restaurante.
* **Integración IA:** Chatbot con PNL (Procesamiento de Lenguaje Natural) impulsado por Google Gemini.
* **Enrutamiento:** Lazy Loading independiente sin módulos clásicos (Standalone Components).

---

## 🛡️ Jerarquía de Roles (RBAC) y Seguridad

El frontend cuenta con protecciones de ruta (AuthGuards) y directivas estructurales que se adaptan en tiempo real al Token JWT decodificado en el `AuthService`. 

La jerarquía estricta de permisos es la siguiente:
1. `ROLE_ADMIN` (Nivel 5) - Superusuario de la plataforma.
2. `ROLE_OWNER` (Nivel 4) - Dueño del restaurante, gestión total de su negocio.
3. `ROLE_MANAGER` (Nivel 3) - Encargado principal.
4. `ROLE_ASSISTANT_MANAGER` (Nivel 2) - Subencargado.
5. `ROLE_TEAM_LEADER` (Nivel 1) - Jefe de equipo / Maître.
6. `ROLE_EMPLOYEE` (Nivel 0) - Empleado estándar (acceso a sus turnos y mesas).

---

## 🎨 Funcionalidades Clave

* **Módulo de Diseño de Salón Interactivo:** Plano virtual de hasta 4000x3000px donde el encargado puede arrastrar, acercar (zoom) y colocar mesas visualmente. Utiliza `@HostListener` para calcular las geometrías de colisión.
* **Gestión de Turnos y Personal:** Tableros directos para asignar turnos y mesas a los empleados dados de alta.
* **Asistente NLP Integrado:** Chatbot que responde dudas del personal en lenguaje natural sobre sus turnos o estado del restaurante.
* **Theme Manager (Dark/Light):** Servicio reactivo que lee la preferencia del usuario (`prefers-color-scheme`) e inyecta dinámicamente atributos `data-theme` al body para prevenir la fatiga visual en turnos nocturnos.

---

## ⚙️ Guía de Inicio Local

### Requisitos Previos
* Node.js (v18 o superior).
* Angular CLI instalado globalmente (`npm install -g @angular/cli`).

### Pasos para levantar el proyecto
1. Clonar el repositorio.
2. Instalar las dependencias:
   ```bash
   npm install
   ```
3. Iniciar el servidor de desarrollo:
   ```bash
   ng serve -o
   ```
   *La aplicación se abrirá en `http://localhost:4200`.*

### Comandos de Desarrollo
* **Generar componente**: `ng generate component path/nombre-componente`
* **Generar servicio**: `ng generate service path/nombre-servicio`
* **Compilar producción**: `ng build`

---

## 📂 Organización del Código (`src/app/`)

* **`features/` o `pages/`**: Módulos funcionales separados por dominio (ej. `restaurant`, `dashboard`, `employee`) cargados bajo demanda (Lazy Loading).
* **`shared/`**: Componentes reutilizables (Botones, Paneles, Modales), Pipes y Directivas.
* **`core/`**: 
  * `services/`: Servicios singleton (`AuthService`, `RestaurantService`, `ThemeManagerService`).
  * `guards/`: Protecciones de enrutamiento basadas en roles.
* **`interfaces/`**: Contratos TypeScript estandarizados con base al Backend.

---

## 🔄 Flujo de Trabajo (Gitflow)
* `main`: Producción estable.
* `develop`: Integración.
* `feature/*`: Nuevas funcionalidades (ej. `feature/drag-and-drop`).
* Pull Requests hacia `develop` tras pasar comprobaciones.
