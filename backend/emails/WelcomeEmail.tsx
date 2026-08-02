import React from 'react';
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Hr,
  Button,
  Img
} from '@react-email/components';

interface WelcomeEmailProps {
  userName: string;
}

export const WelcomeEmail: React.FC<WelcomeEmailProps> = ({ userName }) => {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logo}>LMS</Text>
            <Text style={logoSub}>Library Management System</Text>
          </Section>
          
          <Section style={content}>
            <Heading style={h1}>Welcome to the Library</Heading>
            
            <Text style={text}>Hi {userName},</Text>
            
            <Text style={text}>
              We are delighted to have you join our Library Management System. Your account has been successfully created and is ready to use.
            </Text>
            
            <Section style={featureSection}>
              <Text style={featureTitle}>With your new account, you can:</Text>
              <ul style={list}>
                <li style={listItem}>Browse our extensive catalog of books</li>
                <li style={listItem}>Request to borrow physical copies</li>
                <li style={listItem}>Leave reviews and ratings</li>
                <li style={listItem}>Save your favorite books for later</li>
              </ul>
            </Section>

            <Section style={buttonContainer}>
              <Button href="http://localhost:5173" style={button}>
                Explore the Library
              </Button>
            </Section>
          </Section>

          <Hr style={hr} />
          
          <Section style={footer}>
            <Text style={footerText}>
              © {new Date().getFullYear()} Library Management System. All rights reserved.
            </Text>
            <Text style={footerText}>
              If you didn't create this account, please safely ignore this email.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Styles
const main = {
  backgroundColor: '#F3F4F6',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif',
};

const container = {
  backgroundColor: '#FFFFFF',
  margin: '40px auto',
  borderRadius: '8px',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  maxWidth: '600px',
  border: '1px solid #E5E7EB',
  overflow: 'hidden',
};

const header = {
  backgroundColor: '#111827',
  padding: '32px 48px',
  textAlign: 'center' as const,
};

const logo = {
  color: '#FFFFFF',
  fontSize: '28px',
  fontWeight: '800',
  letterSpacing: '2px',
  margin: '0',
  lineHeight: '1',
};

const logoSub = {
  color: '#9CA3AF',
  fontSize: '12px',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
  margin: '8px 0 0 0',
};

const content = {
  padding: '40px 48px',
};

const h1 = {
  color: '#111827',
  fontSize: '24px',
  fontWeight: '700',
  margin: '0 0 24px 0',
  textAlign: 'center' as const,
};

const text = {
  color: '#4B5563',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '0 0 16px 0',
};

const featureSection = {
  backgroundColor: '#F9FAFB',
  padding: '24px',
  borderRadius: '6px',
  border: '1px solid #E5E7EB',
  margin: '32px 0',
};

const featureTitle = {
  color: '#111827',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 12px 0',
};

const list = {
  margin: '0',
  padding: '0 0 0 20px',
};

const listItem = {
  color: '#4B5563',
  fontSize: '15px',
  lineHeight: '24px',
  marginBottom: '8px',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0 16px',
};

const button = {
  backgroundColor: '#111827',
  borderRadius: '6px',
  color: '#FFFFFF',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '16px 32px',
  transition: 'background-color 0.2s',
};

const hr = {
  borderColor: '#E5E7EB',
  margin: '0',
};

const footer = {
  padding: '32px 48px',
  backgroundColor: '#F9FAFB',
  textAlign: 'center' as const,
};

const footerText = {
  color: '#6B7280',
  fontSize: '12px',
  lineHeight: '18px',
  margin: '0 0 8px 0',
};
