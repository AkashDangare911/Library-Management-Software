import './footer.css';

function Footer() {
  // Hardcoded to 2026 as per request, but usually we'd use new Date().getFullYear()
  return (
    <footer className="footer">
      <p>&copy; 2026 Library Management Software. Made with ❤️ by Akash Dangare.</p>
    </footer>
  );
}

export default Footer;
