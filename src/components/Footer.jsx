import React from 'react';
import { Link } from 'react-router-dom';
import { HeartPulse } from 'lucide-react';

const Footer = () => {
  return (
    <>
      {/* Embedded CSS */}
      <style>
        {`
          .footer-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: space-between;
            gap: 1.5rem;
            padding: 2rem 2.5rem;
            background-color: #fcfcfd;
            box-shadow: 0px 1px 20px rgba(0, 0, 0, 0.1);
            font-family: system-ui, -apple-system, sans-serif;
            width: 100%;
            box-sizing: border-box;
          }

          @media (min-width: 768px) {
            .footer-container {
              flex-direction: row;
            }
          }

          .footer-brand {
            flex: 1;
            display: flex;
            justify-content: flex-start;
          }

          .brand-text {
            font-size: 1.5rem;
            font-weight: 700;
            color: #111827;
            letter-spacing: -0.025em;
          }

          .footer-nav {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.75rem;
          }

          .nav-row {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            column-gap: 1.5rem;
            row-gap: 0.5rem;
          }

          .nav-link {
            text-decoration: none;
            color: #6b7280;
            font-size: 0.875rem;
            font-weight: 500;
            transition: color 0.2s ease;
          }

          .nav-link:hover {
            color: #1f2937;
          }

          .footer-copyright {
            flex: 1;
            display: flex;
            justify-content: flex-end;
          }

          .copyright-text {
            font-size: 0.875rem;
            color: #64748b;
            line-height: 1.6;
            max-width: 550px;
            text-align: center;
            margin: 0;
          }

          @media (min-width: 768px) {
            .copyright-text {
              text-align: left;
            }
          }
        `}
      </style>

      {/* HTML Structure */}
      <footer className="footer-container">
        
        {/* Brand / Logo Section */}
        {/* <div className="footer-brand">

          <span className="brand-text">BloodLink</span>
        </div> */}

        <div className="">
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}>
            <HeartPulse size={32} style={{ fill: 'rgba(183, 16, 42, 0.1)' }} />
            <span style={{ 
              fontFamily: 'var(--font-display)', 
              fontWeight: 800, 
              fontSize: '1.5rem', 
              color: 'var(--secondary)', 
              letterSpacing: '-0.02em',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              Blood<span style={{ color: 'var(--primary)' }}>Link</span>
            </span>
          </Link>
        </div>

        {/* Navigation Links Section */}
        <div className="footer-nav">
          <div className="nav-row">
            <a href="#privacy" className="nav-link">Privacy Policy</a>
            <a href="#terms" className="nav-link">Terms of Service</a>
            <a href="#regulatory" className="nav-link">Regulatory Compliance</a>
            <a href="#support" className="nav-link">Contact Support</a>
          </div>
        </div>

        {/* Copyright & Tagline Section */}
        <div className="footer-copyright">
          <p className="copyright-text">
            © 2026 BloodLink | Real-Time BloodBank and Donor Management Systems.
          </p>
        </div>

      </footer>
    </>
  );
};

export default Footer;