export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface Customer {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  country: string | null;
  website: string | null;
  notes: string | null;
  preferredContactMethod: 'EMAIL' | 'PHONE' | 'IN_PERSON' | 'VIDEO_CALL';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Deal {
  id: string;
  title: string;
  description: string;
  value: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'WON' | 'LOST';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  expectedCloseDate: string;
  customerId: string;
  customer?: Customer;
  createdAt: string;
  updatedAt: string;
}

export interface Interaction {
  id: string;
  type: 'CALL' | 'EMAIL' | 'MEETING' | 'NOTE';
  subject: string;
  description?: string;
  notes?: string;
  scheduledAt?: string;
  completedAt?: string;
  customerId: string;
  customer?: Customer;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
} 