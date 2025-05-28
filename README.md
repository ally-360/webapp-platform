# Ally360 — *ERP & POS Frontend Refactor*

> **Ally360** es una plataforma *Software‑as‑a‑Service* que pone **“tu empresa a la mano”**: integra facturación electrónica DIAN, inventarios multibodega, POS táctil y analítica en tiempo real para micro, pequeñas y medianas empresas colombianas. Ally360 está construida con  **React 19**, **TypeScript** y **Material UI v5**, lo que permite una experiencia rápida, accesible y responsiva en múltiples dispositivos. Utiliza **Redux Toolkit** para el manejo eficiente del estado global, **React Router DOM** para la navegación fluida entre vistas, y **React Hook Form** junto con **Yup** para una gestión de formularios validada y optimizada. Estas herramientas permiten a Ally360 ofrecer una interfaz intuitiva, mantenible y adaptable a distintos entornos empresariales.

---

## 🛠️ Stack tecnológico

| Tipo              | Stack / Librerías              |
| ----------------- | ------------------------------ |
| **Build**         | Vite 5                         |
| **UI**            | React 19 + TypeScript          |
| **Design System** | Material UI v5                 |
| **State**         | Redux Toolkit + RTK Query      |
| **Routing**       | React Router DOM v6            |
| **Forms**         | React‑Hook‑Form v7 + Yup       |
| **Auth**          |  JWT                           |
| **Backend API**   | Python (FastAPI)        |
| **Lint/Format**   | ESLint (Airbnb) + Prettier     |
| **Tests**         | Vitest + React Testing Library |

---


## 🚀 Inicio rápido

```bash
# Requisitos: Node ≥18, Yarn ≥1.22
$ git clone https://github.com/ally360/pos-front.git
$ cd pos-front && yarn install
$ yarn dev   # http://localhost:5173 con HMR
```

Para producción:

```bash
$ yarn build   # genera /dist optimizado
$ yarn preview # prueba local
```

---

## 🔑 Variables de entorno mínimas

```env
VITE_HOST_API=https://api.ally360.com
VITE_API_URL=https://api.ally360.com/api
VITE_API_VERSION=v1
```

---

## 🧪 Pruebas

```bash
$ yarn test
```

---


## 📜 Licencia

MIT © 2023‑2025 Ally360
