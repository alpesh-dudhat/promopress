// Auth domain types.
// v1 has three roles: admin manages the product/zone catalog,
// sales and customers both create mockups for their own orders.
//
// These string unions mirror exactly what's stored in the DB (see
// prisma/schema.prisma) since SQLite has no native enum type.

export type UserRole = "ADMIN" | "SALES" | "CUSTOMER";

export interface AppUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}
