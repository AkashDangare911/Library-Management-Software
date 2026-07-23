import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

export const BorrowBook = () => {

    const navigate = useNavigate();
    const location = useLocation();
    const [isUserLoggedIn, setIsUserLoggedIn] = useState(!!localStorage.getItem("auth_token"));

    useEffect(() => {
        if (!isUserLoggedIn) {
            navigate('/auth/login', { state: { from: location.pathname } });
            return;
        }
    }, []);

    return (
        <>
            <div>BorrowBook page to be implemented..</div>
            <button onClick={() => { navigate('/') }}>Go to Home Page</button>
        </>
    );
}
