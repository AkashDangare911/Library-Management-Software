export const BorrowStatus = {
    PENDING: 'pending',
    ACCEPTED: 'accepted',
    ISSUED: 'issued',
    OVERDUE: 'overdue',
    RETURNED: 'returned',
    REJECTED: 'rejected',
    REVOKED: 'revoked',
    CANCELLED: 'cancelled'
} as const;

export type BorrowStatus = typeof BorrowStatus[keyof typeof BorrowStatus];
