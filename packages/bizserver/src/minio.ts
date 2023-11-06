import * as minio from 'minio';
import env from './envs';

export function getBucketName(name: string) {
	return `${env.MINIO_BUCKET_PREFIX}-${name}`;
}

export const minioClient = new minio.Client({
	endPoint: env.MINIO_ENDPOINT,
	port: env.MINIO_PORT,
	useSSL: env.MINIO_USE_SSL,
	accessKey: env.MINIO_ACCESS_KEY,
	secretKey: env.MINIO_SECRET_KEY
});

export async function setup_minio() {
	const buckets_to_create = ['submissions', 'problems']
	for (const bucket of buckets_to_create) {
		const bucket_name = getBucketName(bucket);
		const exists = await minioClient.bucketExists(bucket_name);
		if (!exists) {
			console.log(`Bucket ${bucket_name} does not exist, creating...`);
			await minioClient.makeBucket(bucket_name, env.MINIO_REGION);
		}
	}
}