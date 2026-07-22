import { useNavigate } from 'react-router-dom';

export const BorrowBook = () => {

    const navigate = useNavigate();

    const isUserLoggedIn = localStorage.getItem("isLoggedIn") ?? '';
    if (!isUserLoggedIn) {
        navigate('/login');
        return;
    }

    return (
        <>
            <div>BorrowBook page to be implemented..</div>
            <button onClick={() => { navigate('/') }}>Go to Home Page</button>
        </>
    );
}
