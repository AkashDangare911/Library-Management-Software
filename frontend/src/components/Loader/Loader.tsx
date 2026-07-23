import './loader.css';

interface LoaderProps {
  text?: string;
}

export const Loader = ({ text = "Loading..." }: LoaderProps) => {
  return (
    <div className="loader-container">
      <div className="book-loader">
        <div className="book-loader-page"></div>
        <div className="book-loader-page"></div>
        <div className="book-loader-page"></div>
      </div>
      <p className="loader-text">{text}</p>
    </div>
  );
};
