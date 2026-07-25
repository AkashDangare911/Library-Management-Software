import React from 'react';
import './about.css';
import { BookOpen, Search, Clock, Library, ShieldCheck } from 'lucide-react';

export const About = () => {
  return (
    <div className="about-container">
      <div className="about-hero">
        <h1 className="about-title">About the Library</h1>
        <p className="about-subtitle">Discovering knowledge, preserving history, and empowering minds.</p>
      </div>

      <div className="about-content">
        <section className="about-section">
          <h2>Our Mission & Vision</h2>
          <p>
            The Grand Archives Library Management Software is designed to bring traditional library cataloging 
            into the modern digital age. We believe that access to knowledge should be seamless, elegant, 
            and efficient. Our platform serves as a bridge between readers and an expansive collection of literature, 
            ensuring that managing and discovering books is a delightful experience.
          </p>
        </section>

        <section className="about-section">
          <h2>Key Features</h2>
          <div className="features-list">
            <div className="feature-item">
              <Search className="feature-icon" />
              <div>
                <h3>Advanced Search & Filtering</h3>
                <p>Easily locate books by title, author, ISBN, category, or rating. Use our dynamic filters to quickly find exactly what you're looking for.</p>
              </div>
            </div>
            <div className="feature-item">
              <Library className="feature-icon" />
              <div>
                <h3>Extensive Catalog Management</h3>
                <p>Browse through an expansive, paginated catalog that efficiently loads data without compromising performance, complete with real-time availability tracking.</p>
              </div>
            </div>
            <div className="feature-item">
              <ShieldCheck className="feature-icon" />
              <div>
                <h3>Secure Authentication</h3>
                <p>Robust user authentication ensures that your borrowing history, profile details, and account data remain private and secure.</p>
              </div>
            </div>
            <div className="feature-item">
              <Clock className="feature-icon" />
              <div>
                <h3>Instant Borrowing</h3>
                <p>With just a few clicks, you can check out books, track your returns, and manage your literary journey.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="about-section">
          <h2>How to Use This Platform</h2>
          <div className="usage-guide">
            <ol>
              <li><strong>Create an Account:</strong> Click the "Login" button in the top right to set up your personal library card.</li>
              <li><strong>Explore the Catalog:</strong> Navigate to the "Books" tab to view our full collection. Use the search bar to find specific titles.</li>
              <li><strong>Borrow Books:</strong> Click on any book to view its details, and if copies are available, hit "View Details" to add it to your account.</li>
              <li><strong>Manage Your Profile:</strong> Use the user profile dropdown in the navigation bar to track your account.</li>
            </ol>
          </div>
        </section>

        <section className="about-section dev-info">
          <h2>Developer Information</h2>
          <div className="dev-card">
            <p><strong>Developed By:</strong> Akash Dangare</p>
            <p><strong>Built In:</strong> July 2026</p>
            <p><strong>Technology Stack:</strong> React, Node.js, Express, MySQL, TypeScript</p>
            <div className="contact-info">
              <p>For inquiries, support, or feedback, please reach out:</p>
              <a href="mailto:contact@example.com" className="contact-link">Contact Developer</a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
