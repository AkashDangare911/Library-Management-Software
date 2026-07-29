import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

export const BorrowBook = () => {

    const navigate = useNavigate();
    const location = useLocation();
    const { user, isLoading } = useAuth();

    useEffect(() => {
        if (!isLoading && !user) {
            navigate('/auth/login', { state: { from: location.pathname } });
            return;
        }
    }, [user, isLoading, navigate, location]);

    return (
        <>
            <div>BorrowBook page to be implemented..</div>
            <button onClick={() => { navigate('/') }}>Go to Home Page</button>
        </>
    );
}
