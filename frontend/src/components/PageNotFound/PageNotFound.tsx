import { useNavigate } from "react-router-dom";
import "./pageNotFound.css";

export const PageNotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="not-found-container">
            <div className="not-found-content">
                <h1 className="error-code">404</h1>
                <h2 className="error-title">Lost in the Archives</h2>
                <p className="error-description">
                    It seems the page you are looking for has been misplaced,
                    checked out by another patron, or never existed in our catalog.
                </p>
                <div className="not-found-actions">
                    <button className="return-home-btn" onClick={() => navigate("/")}>
                        Return to Library
                    </button>
                    <button className="go-back-btn" onClick={() => navigate(-1)}>
                        Go Back
                    </button>
                </div>
            </div>

            <div className="not-found-book-graphic">
                <div className="not-found-book-cover">
                    <span className="not-found-book-title">404</span>
                    <span className="not-found-book-author">"Knowledge comes,<br />but wisdom lingers."</span>
                </div>
                <div className="not-found-book-pages"></div>
            </div>
        </div>
    );
}
