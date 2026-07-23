# React in Library Management Software

This project uses React for building the frontend user interface. We rely heavily on modern React patterns, specifically functional components and Hooks.

## Concepts Used

### 1. Functional Components
All UI elements (like `Home`, `Login`, `Register`, and `Header`) are built as functional components. This keeps the code concise and modern.
**Example:**
```tsx
export const Home = () => {
  return <div>Home</div>;
};
```

### 2. State Management (`useState`)
We use the `useState` hook to manage local component state, such as form inputs and fetched data.
**Example from `Login.tsx`:**
```tsx
const [userEmail, setUserEmail] = useState("");
const [password, setPassword] = useState("");
```

### 3. Side Effects (`useEffect`)
The `useEffect` hook is used for side effects, primarily to fetch data from our backend API when a component first mounts.
**Example from `Home.tsx`:**
```tsx
useEffect(() => {
  const fetchBooks = async () => {
    const response = await fetch("http://localhost:3000/api/books");
    const data = await response.json();
    setBooks(data);
  };
  fetchBooks();
}, []);
```

### 4. React Router (`react-router-dom`)
We use React Router for client-side navigation between pages without reloading the browser. Concepts used include `<Routes>`, `<Route>`, `<Link>`, and the `useNavigate` hook for programmatic redirects (e.g., navigating to `/login` when the Borrow button is clicked).

### 5. Context API (`createContext`, `useContext`)
We use React's Context API to manage global state that needs to be accessed by many components at different nesting levels, avoiding "prop drilling".
**Example (`ToastContext.tsx`):**
```tsx
const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  return (
    <ToastContext.Provider value={{ toasts, setToasts }}>
      {children}
    </ToastContext.Provider>
  );
};

// Usage in a component:
const { toasts } = useContext(ToastContext);
```
