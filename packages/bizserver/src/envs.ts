// This file parses the environment variables and exports them as a typed object.
// The environment variables are defined in the .env file.

interface Env {
  LISTEN_HOST: string;
  LISTEN_PORT: number;

  MAX_SUBMIT_FILE_SIZE_BYTE: number;

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
  JWT_ACCESS_TOKEN_TIMEOUT_SECEONDS: number;

  COOKIE_SECRET: string;

  MINIO_ENDPOINT: string;
  MINIO_REGION: string;
  MINIO_PORT: number;
  MINIO_ACCESS_KEY: string;
  MINIO_SECRET_KEY: string;
  MINIO_USE_SSL: boolean;
  MINIO_BUCKET_PREFIX: string;
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

  MAX_SUBMIT_FILE_SIZE_BYTE: parseInt(getEnv('MAX_SUBMIT_FILE_SIZE_BYTE')),
  
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
  JWT_ACCESS_TOKEN_TIMEOUT_SECEONDS: parseInt(getEnv('JWT_ACCESS_TOKEN_TIMEOUT_SECEONDS')),

  COOKIE_SECRET: getEnv('COOKIE_SECRET'),

  MINIO_ENDPOINT: getEnv('MINIO_ENDPOINT'),
  MINIO_REGION: getEnv('MINIO_REGION'),
  MINIO_PORT: parseInt(getEnv('MINIO_PORT')),
  MINIO_ACCESS_KEY: getEnv('MINIO_ACCESS_KEY'),
  MINIO_SECRET_KEY: getEnv('MINIO_SECRET_KEY'),
  MINIO_USE_SSL: getEnv('MINIO_USE_SSL') === 'true',
  MINIO_BUCKET_PREFIX: getEnv('MINIO_BUCKET_PREFIX'),
};

export default env;
