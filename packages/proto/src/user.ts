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
export const ROLE_PROBLEMSET_ADMIN: RoleMask = 1 << 2; // Whether the user is a problemset admin 
export const ROLE_CONTEST_ADMIN: RoleMask = 1 << 3; // Whether the user is a contest admin

export const ROLE_MASKS = [
	{mask: ROLE_USER, name: '普通用户'},
	{mask: ROLE_SYS_ADMIN, name: '系统管理员'},
	{mask: ROLE_PROBLEMSET_ADMIN, name: '题库管理员'},
	{mask: ROLE_CONTEST_ADMIN, name: '比赛管理员'},
];

// Functions for manuplating roles - they are just simple bit operations

// hasRole: check whether the user has the required role
export function hasRole(roleSet: RoleMask, role: RoleMask): boolean {
  return (roleSet & role) !== 0;
}

export interface User {
	id: number
	name: string
	registerTime: number	// In UNIX timestamp, milliseconds
	password: string
	roleMask: RoleMask
	metadata: {
		motto: string
		email: string
	}
}

