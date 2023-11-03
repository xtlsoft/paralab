// This file contains code about authentication, including:
//	- Storing the JWT token when logging in (try_login)
//	- Retrieving the JWT token when fetching from backend (auth_fetch)
import * as jwt from 'jsonwebtoken';

const backend_addr = "http://localhost:3000"
let access_token: string | null = null;

// try_login: Try to send a login request to the backend, and
//  - If the login is successful, store the access token in memory, and store
//    the refresh token in cookie (this is done implicitly), and return a
//    Promise that resolves to {message: 'login successfully'}
//  - If the login is not successful, return a Promise that rejects to {message: FAILED_REASON}
export async function try_login(userName: string, password: string): Promise<{message: string}> {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await fetch(`/api/user/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({userName: userName, password: password})
      });
      if (!response.ok) {
        reject((await response.json()).message);
      }
      const json = await response.json();
      access_token = json.access_token;
      resolve({message: 'login successfully'});
    } catch (e: any) {
      // According to https://developer.mozilla.org/en-US/docs/Web/API/fetch,
      // A fetch() promise only rejects when a network error is encountered
      // (which is usually when there's a permissions issue or similar). A
      // fetch() promise does not reject on HTTP errors (404, etc.). 
      reject({message: e.message});
    }
  });
}

// Obtain a new access token by providing the server with the refresh token
// It sets the access token if everything is OK, and throws an error if any
// error occurs (including 1. Network error that causes fetch() to panic and
// 2. The server returns an error since the refresh token is invalid)
async function get_new_access_token() {
  const response = await fetch(`/api/user/access_token`, {
    method: 'GET'
  });
  if (!response.ok) {
    throw new Error((await response.json()).message);
  }
  const json = await response.json();
  access_token = json.access_token;
}

// fetch_with_auth_in_raw: This function sends a request to the backend with a
// valid access token. If the access token is not present or is going to expire
// soon, we try to get the access token by providing the server with the refresh token.
// @param url: The url to fetch
// @param options: The options passed to fetch
// @return: The response
// @throws: It throws error when 1. Failed to get the access token, 2. fetch()
// panics due to network issue. 3. The server returns a response with status
// code other than 2xx.
export async function fetch_with_auth_in_raw(url: string, options: RequestInit): Promise<Response> {  
  // If the access token is not present, we try to get the access token by
  // providing the server with the refresh token
  if (!access_token) {
    await get_new_access_token();
  } else {
    const access_token_decoded: any = jwt.decode(access_token);
    if (!access_token_decoded || access_token_decoded.exp * 1000 < Date.now() + 2000) { // 2000ms is the tolerance
      await get_new_access_token();
    }
  }
  // Now the access token should be ready
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${access_token}`
    }
  });
  if (!response.ok) {
    throw new Error((await response.json()).message);
  }
  return response;
}

// fetch_with_auth_in_json: A thin wrapper around fetch_with_auth_in_raw that
// sends a JSON and returns a JSON.
export async function fetch_with_auth_in_json(url: string, method: string, data: any): Promise<any> {
  const response = await fetch_with_auth_in_raw(url, {
    method: method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
  });
  return await response.json();
}
