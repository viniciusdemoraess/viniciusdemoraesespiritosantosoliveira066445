package br.gov.seplag.artistalbum.infrastructure.storage;

import br.gov.seplag.artistalbum.domain.exception.StorageException;
import io.minio.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.multipart.MultipartFile;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MinioStorageServiceTest {

    @Mock
    private MinioClient minioClient;

    @InjectMocks
    private MinioStorageService minioStorageService;

    @Mock
    private MultipartFile multipartFile;

    @BeforeEach
    void setUp() {
        // Set required properties
        ReflectionTestUtils.setField(minioStorageService, "minioUrl", "http://minio:9000");
        ReflectionTestUtils.setField(minioStorageService, "minioExternalUrl", "http://localhost:9000");
        ReflectionTestUtils.setField(minioStorageService, "accessKey", "minioadmin");
        ReflectionTestUtils.setField(minioStorageService, "secretKey", "minioadmin");
        ReflectionTestUtils.setField(minioStorageService, "bucketName", "album-covers");
        ReflectionTestUtils.setField(minioStorageService, "presignedUrlExpiration", 1800);
        ReflectionTestUtils.setField(minioStorageService, "minioClient", minioClient);
    }

    @Test
    @DisplayName("Should throw StorageException when upload fails")
    void shouldThrowExceptionWhenUploadFails() throws Exception {
        // Given
        String folder = "covers";
        when(multipartFile.getOriginalFilename()).thenReturn("test.jpg");
        when(multipartFile.getInputStream()).thenThrow(new RuntimeException("I/O error"));

        // When & Then
        assertThatThrownBy(() -> minioStorageService.uploadFile(multipartFile, folder))
                .isInstanceOf(StorageException.class)
                .hasMessageContaining("upload file");
    }

    @Test
    @DisplayName("Should generate presigned URL successfully")
    void shouldGeneratePresignedUrlSuccessfully() throws Exception {
        // Given
        String objectKey = "covers/test.jpg";
        String internalUrl = "http://minio:9000/album-covers/covers/test.jpg?signature=xyz";
        
        when(minioClient.getPresignedObjectUrl(any(GetPresignedObjectUrlArgs.class)))
                .thenReturn(internalUrl);

        // When
        String presignedUrl = minioStorageService.getPresignedUrl(objectKey);

        // Then
        assertThat(presignedUrl).contains("http://localhost:9000");
        assertThat(presignedUrl).doesNotContain("http://minio:9000");
        verify(minioClient).getPresignedObjectUrl(any(GetPresignedObjectUrlArgs.class));
    }

    @Test
    @DisplayName("Should throw StorageException when presigned URL generation fails")
    void shouldThrowExceptionWhenPresignedUrlFails() throws Exception {
        // Given
        String objectKey = "covers/test.jpg";
        when(minioClient.getPresignedObjectUrl(any(GetPresignedObjectUrlArgs.class)))
                .thenThrow(new RuntimeException("MinIO error"));

        // When & Then
        assertThatThrownBy(() -> minioStorageService.getPresignedUrl(objectKey))
                .isInstanceOf(StorageException.class)
                .hasMessageContaining("generate presigned URL");
    }

    @Test
    @DisplayName("Should throw StorageException when delete fails")
    void shouldThrowExceptionWhenDeleteFails() throws Exception {
        // Given
        String objectKey = "covers/test.jpg";
        doThrow(new RuntimeException("MinIO error"))
                .when(minioClient).removeObject(any(RemoveObjectArgs.class));

        // When & Then
        assertThatThrownBy(() -> minioStorageService.deleteFile(objectKey))
                .isInstanceOf(StorageException.class)
                .hasMessageContaining("delete file");
    }
}
