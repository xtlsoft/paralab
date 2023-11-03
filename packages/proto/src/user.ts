// Definition of datatypes
// We use a bitmask to represent the role of a particular user. Assume we have
// N rows, then PrivilegeSet is a N-bit binary number whose i-th bit indicates
// whether the user has the i-th role.
// "User X has role Y" means that user X can act as role Y, including accessing
// to the resources that role Y can access, performing the operations that role
// Y can perform, etc.
export type RoleMask = number;

// The following constants are the bitmasks of the roles
export const ROLE_USER: RoleMask = 1 << 0;  // Whether the user is a normal user (i.e. not banned)
export const ROLE_SYS_ADMIN: RoleMask = 1 << 1; // Whether the user is a system admin

// Functions for manuplating roles - they are just simple bit operations

// hasRole: check whether the user has the required role
export function hasRole(roleSet: RoleMask, role: RoleMask): boolean {
  return (roleSet & role) !== 0;
}

export interface User {
	id: number
	name: string
	registerTime: Date
	password: string
	roleMask: RoleMask
	metadata: {
		motto: string
		email: string
	}
}
