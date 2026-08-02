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
} from '@react-email/components';

interface BorrowStatusEmailProps {
  userName: string;
  bookTitle: string;
  status: 'approved' | 'rejected' | 'issued' | 'returned';
  reason?: string;
}

export const BorrowStatusEmail: React.FC<BorrowStatusEmailProps> = ({ 
  userName, 
  bookTitle, 
  status,
  reason
}) => {
  let title = '';
  let content = '';

  switch (status) {
    case 'approved':
      title = 'Borrow Request Approved';
      content = `Great news! Your request to borrow "${bookTitle}" has been approved. Please visit the library within 24 hours to collect your book.`;
      break;
    case 'rejected':
      title = 'Borrow Request Rejected';
      content = `We're sorry, but your request to borrow "${bookTitle}" was rejected by the library staff.`;
      break;
    case 'issued':
      title = 'Book Issued';
      content = `You have successfully checked out "${bookTitle}". Happy reading!`;
      break;
    case 'returned':
      title = 'Book Returned';
      content = `Thank you for returning "${bookTitle}". We hope you enjoyed reading it.`;
      break;
  }

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logo}>LMS</Text>
            <Text style={logoSub}>Library Management System</Text>
          </Section>
          
          <Section style={contentContainer}>
            <Heading style={h1}>{title}</Heading>
            
            <Text style={text}>Hi {userName},</Text>
            
            <Text style={text}>{content}</Text>
            
            {status === 'rejected' && reason && (
              <Section style={reasonSection}>
                <Text style={reasonTitle}>Reason for rejection:</Text>
                <Text style={reasonText}>{reason}</Text>
              </Section>
            )}
          </Section>

          <Hr style={hr} />
          
          <Section style={footer}>
            <Text style={footerText}>
              © {new Date().getFullYear()} Library Management System. All rights reserved.
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

const contentContainer = {
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

const reasonSection = {
  backgroundColor: '#FEF2F2',
  padding: '16px 20px',
  borderRadius: '6px',
  borderLeft: '4px solid #EF4444',
  margin: '24px 0',
};

const reasonTitle = {
  margin: '0 0 8px 0',
  fontWeight: '600',
  color: '#991B1B',
  fontSize: '14px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px'
};

const reasonText = {
  margin: '0',
  color: '#7F1D1D',
  fontSize: '16px',
  lineHeight: '24px'
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
  margin: '0',
};
