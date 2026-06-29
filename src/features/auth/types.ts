// Auth domain types.
// v1 has three roles: admin manages the product/zone catalog,
// sales and customers both create mockups for their own orders.

export type UserRole = "admin" | "sales" | "customer";

export interface AppUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}
