export type AdminUser = {
  _id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  avatar?: string;
  companyName?: string;
  businessProfile?: string;
  role: string;
  status: "active" | "suspended";
  statusReason?: string;
  isVerified: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt?: string;
};

export type AdminUsersResponse = {
  items: AdminUser[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type AdminUserStats = {
  total: number;
  active: number;
  suspended: number;
  verified: number;
  unverified: number;
};

export type GetAdminUsersParams = {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
  isVerified?: boolean | string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};
