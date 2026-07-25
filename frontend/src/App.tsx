import { Routes, Route } from "react-router-dom";
import { Home } from "./components/Home/Home";
import { Login } from "./components/Auth/Login/Login";
import { Register } from "./components/Auth/Register/Register";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import { BorrowBook } from "./components/BorrowBook/BorrowBook";
import { BookDetails } from "./components/BookDetails/BookDetails";
import { BooksList } from "./components/BooksList/BooksList";
import { About } from "./components/About/About";
import { Profile } from "./components/Profile/Profile";
import { PageNotFound } from "./components/PageNotFound/PageNotFound";
import { ScrollToTop } from "./components/ScrollToTop";

function App() {
  return (
    <>
      <ScrollToTop />
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="auth">
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
          </Route>
          <Route path="/borrowBook" element={<BorrowBook />} />
          <Route path="/books" element={<BooksList />} />
          <Route path="/books/:bookID" element={<BookDetails />} />
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

export default App
