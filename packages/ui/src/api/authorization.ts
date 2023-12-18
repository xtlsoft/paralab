// This file contains code about authentication, including:
//	- Storing the JWT token when logging in (try_login)
//	- Retrieving the JWT token when fetching from backend (auth_fetch)
import * as jwt from 'jsonwebtoken';
import { useCookies } from "vue3-cookies";
import type { User } from '@paralab/proto';

const { cookies } = useCookies();

let access_token: string | undefined = undefined;
// We store the current user info in the cookie. We set it when login and delete
// it when logout

// tryLogin: Try to send a login request to the backend, and
//  - If the login is successful, store the access token in memory, and store
//    the refresh token in cookie (this is done implicitly), and store the info
//    about the current user into cookie, and return a Promise that resolves
//    to {message: 'login successfully'}
//  - If the login is not successful, return a Promise that rejects to {message: FAILED_REASON}
export async function tryLogin(userName: string, password: string): Promise<{message: string}> {
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
      const json: {message: string, access_token: string, user_info: User} = await response.json();
      access_token = json.access_token;
      const logged_in_user_info = json.user_info;
      cookies.set('logged_in_user_info', logged_in_user_info as any)
      console.log(`Logged in as ${logged_in_user_info.name}`)
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

// logout: Send a logout request to the backend (which invalidates the refresh
// token), clear the access token in memory
// @throw: It throws an error if the user failed to logout
export async function logout(): Promise<{message: string}> {
  fetchWithAuthInJson(`/api/user/logout`, 'GET', {});
  access_token = undefined;
  cookies.remove('logged_in_user_info');
  return {message: 'logout successfully'};
}

// getLoggedInUserInfo: Return the info about the current logged in user
export function getLoggedInUserInfo(): User | undefined {
  const logged_in_user_info: User = cookies.get('logged_in_user_info') as any;
  if (!logged_in_user_info) {
    return undefined;
  }
  return logged_in_user_info;
}

// Obtain a new access token by providing the server with the refresh token
// It sets the access token if everything is OK, and throws an error if any
// error occurs (including 1. Network error that causes fetch() to panic and
// 2. The server returns an error since the refresh token is invalid)
async function getNewAccessToken() {
  const response = await fetch(`/api/user/access_token`, {
    method: 'GET'
  });
  if (!response.ok) {
    throw new Error((await response.json()).message);
  }
  const json = await response.json();
  access_token = json.access_token;
}

// fetchWithAuthInRaw: This function sends a request to the backend with a
// valid access token. If the access token is not present or is going to expire
// soon, we try to get the access token by providing the server with the refresh token.
// @param url: The url to fetch
// @param options: The options passed to fetch
// @return: The response
// @throws: It throws error when 1. Failed to get the access token, 2. fetch()
// panics due to network issue. 3. The server returns a response with status
// code other than 2xx.
export async function fetchWithAuthInRaw(url: string, options: RequestInit): Promise<Response> {
  if (cookies.isKey('logged_in_user_info')) {
    // The user is logged in
    // If the access token is not present, we try to get the access token by
    // providing the server with the refresh token
    if (!access_token) {
      await getNewAccessToken();
    } else {
      const access_token_decoded: any = jwt.decode(access_token);
      if (!access_token_decoded || access_token_decoded.exp * 1000 < Date.now() + 2000) { // 2000ms is the tolerance
        await getNewAccessToken();
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
  } else {
    // The user is NOT logged in
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
      }
    });
    if (!response.ok) {
      throw new Error((await response.json()).message);
    }
    return response;
  }
}

// fetchWithAuthInJson: A thin wrapper around fetch_with_auth_in_raw that
// sends a JSON and returns a JSON.
// Note that since GET requests do not have a body, `data` will be put to
// request params in URL
export async function fetchWithAuthInJson(url: string, method: string, data: any = {}): Promise<any> {
  const request_payload: any = {
    method: method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
  };
  if (method == 'GET') {
    delete request_payload.body;
    url += '?' + new URLSearchParams(data).toString();
  }
  const response = await fetchWithAuthInRaw(url, request_payload);
  return await response.json();
}
