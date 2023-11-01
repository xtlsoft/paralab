export interface Session {
	userId: number
	userName: string
	iat: number	// A timestamp in Unix seconds
	exp: number	// A timestamp in Unix seconds
}
