import { Routes, Route } from "react-router-dom";
import { Home } from "./components/Home/Home";
import { Login } from "./components/Auth/Login/Login";
import { Register } from "./components/Auth/Register/Register";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import { BorrowBook } from "./components/BorrowBook/BorrowBook";
import { PageNotFound } from "./components/PageNotFound/PageNotFound";

function App() {
  return (
    <>
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="auth">
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
          </Route>
          <Route path="/borrowBook" element={<BorrowBook />} />
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

export default App
