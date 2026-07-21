# MySQL in Library Management Software

We use MySQL as our relational database to store users, books, and borrowing transactions. The backend interacts with MySQL using the `mysql2` NPM package.

## Concepts Used

### 1. Connection Pooling
Instead of creating a single fragile connection (`createConnection`), we use `createPool`. A pool manages multiple connections, automatically handling heavy traffic, dropping idle connections, and reconnecting as needed without crashing the server.
**Example from `db.ts`:**
```typescript
const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "root",
    database: "LIBRARY_DB",
    connectionLimit: 10
});
```

### 2. Promises and Async/Await
We specifically use the `mysql2/promise` wrapper. This allows us to write asynchronous database queries using modern `async/await` syntax instead of using nested, messy callbacks.
**Example from `app.ts`:**
```typescript
// No callbacks needed!
const [rows] = await pool.query('SELECT * FROM Books ORDER BY id DESC');
```

### 3. Relational Schema Design
Our database is normalized using foreign keys to strictly link tables. For example, the `Borrowings` table references both `Users(id)` and `Books(id)`. If a user is deleted, their borrowing history can automatically be removed or handled via `ON DELETE CASCADE`.
**Example from `init.sql`:**
```sql
CREATE TABLE Borrowings (
    user_id INT,
    book_id INT,
    -- ...
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);
```

