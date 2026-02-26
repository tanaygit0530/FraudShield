import React from 'react';
import { Shield, Github, Twitter, Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer-content">
        <div className="footer-brand">
          <div className="logo">
            <Shield className="logo-icon" size={24} />
            <span>FraudShield</span>
          </div>
          <p>Real-time fraud incident orchestration & recovery command center.</p>
          <div className="social-links">
            <a href="#"><Twitter size={20} /></a>
            <a href="#"><Linkedin size={20} /></a>
            <a href="#"><Github size={20} /></a>
          </div>
        </div>
        
        <div className="footer-links">
          <div>
            <h4>Product</h4>
            <a href="#">How it works</a>
            <a href="#">Pricing</a>
            <a href="#">Dashboard</a>
          </div>
          <div>
            <h4>Company</h4>
            <a href="#">About</a>
            <a href="#">Security</a>
            <a href="#">Legal</a>
          </div>
          <div>
            <h4>Legal</h4>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Compliance</a>
          </div>
        </div>
      </div>
      
      <div className="container footer-bottom">
        <p>&copy; 2024 FraudShield. Not a bank. An intelligent coordination layer.</p>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .footer {
          background: #030712;
          padding: 5rem 0 2rem;
          border-top: 1px solid var(--border);
          margin-top: 5rem;
        }
        .footer-content {
          display: grid;
          grid-template-columns: 1.5fr 2fr;
          gap: 4rem;
          margin-bottom: 4rem;
        }
        .footer-brand p {
          color: var(--text-muted);
          margin: 1.5rem 0;
          max-width: 300px;
        }
        .social-links {
          display: flex;
          gap: 1.5rem;
        }
        .social-links a {
          color: var(--text-dim);
        }
        .social-links a:hover {
          color: var(--primary);
        }
        .footer-links {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
        }
        .footer-links h4 {
          margin-bottom: 1.5rem;
          color: var(--text-main);
        }
        .footer-links a {
          display: block;
          color: var(--text-muted);
          margin-bottom: 0.75rem;
          font-size: 0.9rem;
        }
        .footer-links a:hover {
          color: var(--text-main);
        }
        .footer-bottom {
          padding-top: 2rem;
          border-top: 1px solid var(--border);
          text-align: center;
          color: var(--text-dim);
          font-size: 0.85rem;
        }
        @media (max-width: 768px) {
          .footer-content {
            grid-template-columns: 1fr;
          }
        }
      `}} />
    </footer>
  );
};

export default Footer;
