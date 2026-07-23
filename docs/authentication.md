# Authentication in Library Management Software

This project uses **JSON Web Tokens (JWT)** securely stored in **HttpOnly Cookies** to authenticate and authorize users.

## 1. JSON Web Tokens (JWT)
When a user successfully logs in or registers, the server generates a JWT containing their `userId`. This token is signed with a secret (`JWT_SECRET`) known only to the server. Because it is signed, the server can trust that the token hasn't been tampered with when the user sends it back. This allows our authentication to be **stateless** (the server doesn't need to look up session IDs in the database).

## 2. HttpOnly Cookies vs LocalStorage
Initially, we might store tokens in `localStorage`. However, `localStorage` is accessible to JavaScript, making it highly vulnerable to **Cross-Site Scripting (XSS)** attacks (where an attacker injects a malicious script to read and steal the token).

To secure the application, we moved the token into an **HttpOnly Cookie**:
- `HttpOnly: true` completely blocks JavaScript from reading the cookie.
- `secure: true` (in production) ensures the cookie is only sent over encrypted HTTPS connections, preventing Man-in-the-Middle network sniffing.

## 3. The Authentication Flow
1. **Login:** User submits credentials. Server validates them, generates a JWT, and sends it back via `res.cookie('auth_token', token, { httpOnly: true })`.
2. **Subsequent Requests:** The browser *automatically* attaches the `auth_token` cookie to the HTTP headers of any future requests sent to the backend. The frontend sets `credentials: 'include'` on its `fetch` requests to allow this.
3. **Verification (Middleware):** The backend uses `cookie-parser` to read the incoming cookies. The `verifyToken` middleware extracts the token, verifies the signature, and either allows the request to proceed to the controller or rejects it with a 401 Unauthorized error.
4. **Logout:** The server simply clears the cookie using `res.clearCookie('auth_token')`.

## 4. Frontend State
Since the frontend cannot read the `HttpOnly` cookie to know if the user is logged in, it relies on a simple `is_user_logged_in` boolean flag stored in `localStorage`. This flag does *not* contain sensitive data; it merely helps the React UI decide whether to show "Login" or "Logout" buttons in the Header. The actual security authorization always happens on the backend.
