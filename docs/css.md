# CSS & Styling in Library Management Software

This project uses Vanilla CSS to maintain full control over the design while achieving a highly professional, modern look without relying on heavy UI frameworks like Bootstrap or Tailwind.

## Concepts Used

### 1. CSS Custom Properties (Variables)
We define global variables in `index.css` for colors, border radiuses, and shadows. This creates a central "Design System" that ensures consistency across the entire application. If we want to change the primary color, we only have to change it in one single place.
**Example from `index.css`:**
```css
:root {
  --primary-color: #4F46E5;
  --surface-color: #FFFFFF;
  --radius-md: 8px;
}
```

### 2. Glassmorphism
In the `Header` component, we use the `backdrop-filter` property to create a modern frosted-glass effect that blurs the background content as the user scrolls down the page.
**Example from `header.css`:**
```css
.header {
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px); /* Creates the frosted glass effect */
  position: sticky;
  top: 0;
}
```

### 3. CSS Grid & Flexbox
We use **Flexbox** for aligning items within components (like centering form fields or spreading out header links). We use **CSS Grid** for the responsive, multi-column layout of the book catalog on the Home page.
**Example from `home.css`:**
```css
.books-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); /* Automatically flows to new rows */
  gap: 2rem;
}
```

### 4. Micro-Animations and Hover States
Buttons and cards feature subtle `transform` and `box-shadow` transitions on hover, creating a premium, tactile feel and encouraging user interaction.
**Example from `home.css`:**
```css
.book-card:hover {
  transform: translateY(-4px); /* Gently floats the card up */
  box-shadow: var(--shadow-lg);
}
```
