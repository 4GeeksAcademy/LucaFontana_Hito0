# Brasaland — Sitio Web Corporativo

[![4Geeks Academy](https://img.shields.io/badge/4Geeks-Academy-blue)](https://4geeksacademy.com)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)](https://developer.mozilla.org/es/docs/Web/HTML)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/es/docs/Web/JavaScript)

Sitio web corporativo moderno para **Brasaland**, cadena de restaurantes de comida a la brasa con 14 ubicaciones en Colombia y Estados Unidos.

---

## Descripción

Este proyecto es la landing page corporativa y formulario de registro del programa de fidelización **Brasa Points** de Brasaland. Desarrollado como parte del Hito 1 del programa AI Engineering de 4Geeks Academy.

El sitio presenta:
- Landing page corporativa con diseño premium dark mode
- Formulario de registro con validaciones completas en JavaScript
- Diseño responsive (mobile-first)
- Accesibilidad (ARIA, navegación por teclado, contraste)
- SEO optimizado (meta tags, Open Graph, Schema.org)
- Animaciones suaves con IntersectionObserver

---

## Stack Tecnológico

| Tecnología | Uso |
|---|---|
| HTML5 | Estructura semántica |
| Tailwind CSS v4 (CDN) | Estilos y diseño responsive |
| JavaScript Vanilla | Validaciones y lógica interactiva |
| Google Fonts (Inter + Poppins) | Tipografía |

---

## Estructura del Proyecto

```text
/
├── index.html          # Landing page corporativa
├── application.html    # Formulario de registro Brasa Points
├── validation.js       # Lógica de validación del formulario
└── README.md           # Documentación del proyecto
├── uis/                      # User interfaces (React, Next.js, Streamlit, HTML)
└── workflows/                # Automation/orchestration documentation
```

---

## Características

### Landing Page (`index.html`)
- Header con navegación sticky y menú hamburguesa en mobile
- Hero section con imagen de fondo y CTA
- Sección "Nuestra Historia"
- Sección "Lo que nos hace únicos" (3 columnas)
- Sección "Nuestras Ubicaciones" (Colombia y USA)
- Sección "Brasa Points" (programa de fidelización)
- Sección de Contacto
- Footer con redes sociales
- Animaciones fade-in al hacer scroll (IntersectionObserver)
- Schema.org JSON-LD completo

### Formulario (`application.html`)
- 11 campos con validaciones completas
- Campos dependientes dinámicos (País → Ciudad → Ubicación)
- Validación en tiempo real (on blur/change)
- Validación completa al enviar
- Mensajes de error accesibles
- Modal de éxito premium
- Botón para limpiar formulario
- Navegación por teclado y lectores de pantalla

### Validaciones Implementadas
- Nombre completo: mínimo nombre y apellido
- Email: formato válido con @ y dominio
- Teléfono: código de país (+57 o +1)
- Fecha de nacimiento: mayor de 18 años
- País/Ciudad: selección obligatoria con lógica dependiente
- Términos: obligatorios para enviar

---

## Cómo ejecutar localmente

1. Clona el repositorio:
```bash
git clone <repo-url>
cd LucaFontana_Hito0
```

2. Sirve los archivos con cualquier servidor estático:
```bash
npx serve .
```

3. Abre http://localhost:3000 en tu navegador.

> No se requieren dependencias ni instalación. El proyecto usa Tailwind CSS v4 vía CDN.

---

## Accesibilidad

- HTML semántico con landmarks (`<header>`, `<main>`, `<footer>`, `<nav>`, `<section>`)
- ARIA labels en todos los elementos interactivos
- Focus rings visibles
- Navegación completa por teclado
- Mensajes de error con `role="alert"` y `aria-live="polite"`
- Respeta `prefers-reduced-motion`
- Contraste de colores adecuado

---

## SEO

- Meta tags completas (title, description, keywords)
- Open Graph y Twitter Cards
- Schema.org JSON-LD (Restaurant)
- Estructura jerárquica de headings (h1 → h2 → h3)
- Links canónicos
- Imágenes con atributos alt descriptivos

---

## Créditos

Proyecto desarrollado como parte del **Hito 1** del programa AI Engineering de [4Geeks Academy](https://4geeksacademy.com).

**Empresa:** Brasaland — Cadena de restaurantes de comida a la brasa  
**Contexto:** Transformación digital liderada por Brasaland Digital
