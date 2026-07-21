# TypeScript in Library Management Software

TypeScript is used across both the frontend (React) and backend (Express) to provide static type checking, improving developer experience and reducing runtime errors.

## Concepts Used

### 1. Interfaces
We use interfaces to define the shape of our data objects. This ensures that when we fetch data from the backend, the frontend knows exactly what properties are available and provides autocomplete.
**Example from `Home.tsx`:**
```typescript
interface Book {
  id: number;
  title: string;
  author: string;
  total_copies: number;
  available_copies: number;
}
```

### 2. Generic Types with Hooks
We pass generic types to React hooks to strictly type our state variables.
**Example from `Home.tsx`:**
```typescript
const [books, setBooks] = useState<Book[]>([]);
```

### 3. Typed Express Handlers
On the backend, we use TypeScript to type our Express Request and Response objects. Because our backend uses ECMAScript Modules (`"type": "module"` in `package.json`), we use the `type` keyword for imports to avoid runtime module errors when transpiling.
**Example from `app.ts`:**
```typescript
import express, { type Request, type Response } from 'express';

app.get('/api/books', async (req: Request, res: Response) => {
    // Handler logic...
});
```

### 4. DOM Event Typing
We strictly type event handlers in React to safely access browser event properties.
**Example from `Register.tsx`:**
```typescript
const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
  e.preventDefault();
}
```
