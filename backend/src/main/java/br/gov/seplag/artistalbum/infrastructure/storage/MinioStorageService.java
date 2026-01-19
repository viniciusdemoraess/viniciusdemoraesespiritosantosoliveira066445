package br.gov.seplag.artistalbum.infrastructure.storage;

import io.minio.*;
import io.minio.errors.*;
import io.minio.http.Method;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

/**
 * MinIO (S3-compatible) Storage Service
 * Handles file upload and presigned URL generation
 */
@Slf4j
@Service
public class MinioStorageService {

    @Value("${minio.url}")
    private String minioUrl;

    @Value("${minio.external-url}")
    private String minioExternalUrl;

    @Value("${minio.access-key}")
    private String accessKey;

    @Value("${minio.secret-key}")
    private String secretKey;

    @Value("${minio.bucket-name}")
    private String bucketName;

    @Value("${minio.presigned-url-expiration}")
    private Integer presignedUrlExpiration;

    private MinioClient minioClient;

    @PostConstruct
    public void init() {
        log.info("Initializing MinIO client with URL: {}", minioUrl);
        minioClient = MinioClient.builder()
                .endpoint(minioUrl)
                .credentials(accessKey, secretKey)
                .build();
        createBucketIfNotExists();
    }

    private void createBucketIfNotExists() {
        try {
            boolean exists = minioClient.bucketExists(
                    BucketExistsArgs.builder()
                            .bucket(bucketName)
                            .build()
            );

            if (!exists) {
                minioClient.makeBucket(
                        MakeBucketArgs.builder()
                                .bucket(bucketName)
                                .build()
                );
                log.info("Bucket created: {}", bucketName);
            } else {
                log.info("Bucket already exists: {}", bucketName);
            }
        } catch (Exception e) {
            log.error("Error creating bucket", e);
            throw new RuntimeException("Failed to create MinIO bucket", e);
        }
    }

    /**
     * Upload file to MinIO and return object key
     */
    public String uploadFile(MultipartFile file, String folder) {
        try {
            String originalFilename = file.getOriginalFilename();
            String extension = getFileExtension(originalFilename);
            String objectKey = folder + "/" + UUID.randomUUID() + extension;

            InputStream inputStream = file.getInputStream();
            
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(bucketName)
                            .object(objectKey)
                            .stream(inputStream, file.getSize(), -1)
                            .contentType(file.getContentType())
                            .build()
            );

            log.info("File uploaded successfully: {}", objectKey);
            return objectKey;

        } catch (Exception e) {
            log.error("Error uploading file to MinIO", e);
            throw new RuntimeException("Failed to upload file", e);
        }
    }

    /**
     * Generate presigned URL (valid for 30 minutes)
     * Replaces internal Docker hostname with external URL for browser access
     */
    public String getPresignedUrl(String objectKey) {
        try {
            String presignedUrl = minioClient.getPresignedObjectUrl(
                    GetPresignedObjectUrlArgs.builder()
                            .method(Method.GET)
                            .bucket(bucketName)
                            .object(objectKey)
                            .expiry(presignedUrlExpiration, TimeUnit.SECONDS)
                            .build()
            );
            
            // Replace internal Docker hostname with external URL
            // This allows browser to access MinIO from outside Docker network
            if (!minioUrl.equals(minioExternalUrl)) {
                presignedUrl = presignedUrl.replace(minioUrl, minioExternalUrl);
                log.debug("Replaced internal URL with external URL: {}", presignedUrl);
            }
            
            return presignedUrl;
        } catch (Exception e) {
            log.error("Error generating presigned URL for object: {}", objectKey, e);
            throw new RuntimeException("Failed to generate presigned URL", e);
        }
    }

    /**
     * Delete file from MinIO
     */
    public void deleteFile(String objectKey) {
        try {
            minioClient.removeObject(
                    RemoveObjectArgs.builder()
                            .bucket(bucketName)
                            .object(objectKey)
                            .build()
            );
            log.info("File deleted successfully: {}", objectKey);
        } catch (Exception e) {
            log.error("Error deleting file from MinIO", e);
            throw new RuntimeException("Failed to delete file", e);
        }
    }

    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf("."));
    }
}
