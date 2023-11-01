// This file parses the environment variables and exports them as a typed object.
// The environment variables are defined in the .env file.

interface Env {
  LISTEN_HOST: string;
  LISTEN_PORT: number;

  POSTGRES_HOST: string;
  POSTGRES_PORT: number;
  POSTGRES_DB: string;
  POSTGRES_USER: string;
  POSTGRES_PASSWORD: string;
  POSTGRES_SYNCHRONIZE: boolean;

  REDIS_URL: string;

  BCRYPT_ROUNDS: number;

  JWT_SECRET: string;
  JWT_REFRESH_TOKEN_TIMEOUT_SECEONDS: number;
}

function getEnv(name: string): string {
	const value = process.env[name];
  if (!value) {
	  throw new Error(`Environment variable ${name} is not defined`);
  }
  return value;
}

const env: Env = {
  LISTEN_HOST: getEnv('LISTEN_HOST'),
  LISTEN_PORT: parseInt(getEnv('LISTEN_PORT')),

  POSTGRES_HOST: getEnv('POSTGRES_HOST'),
  POSTGRES_PORT: parseInt(getEnv('POSTGRES_PORT')),
  POSTGRES_DB: getEnv('POSTGRES_DB'),
  POSTGRES_USER: getEnv('POSTGRES_USER'),
  POSTGRES_PASSWORD: getEnv('POSTGRES_PASSWORD'),
  POSTGRES_SYNCHRONIZE: getEnv('POSTGRES_SYNCHRONIZE') === 'true',

  REDIS_URL: getEnv('REDIS_URL'),

  BCRYPT_ROUNDS: parseInt(getEnv('BCRYPT_ROUNDS')),

  JWT_SECRET: getEnv('JWT_SECRET'),
  JWT_REFRESH_TOKEN_TIMEOUT_SECEONDS: parseInt(getEnv('JWT_REFRESH_TOKEN_TIMEOUT_SECEONDS')),
};

export default env;
