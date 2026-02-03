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
        String folder = "covers";
        when(multipartFile.getOriginalFilename()).thenReturn("test.jpg");
        when(multipartFile.getInputStream()).thenThrow(new RuntimeException("I/O error"));

        assertThatThrownBy(() -> minioStorageService.uploadFile(multipartFile, folder))
                .isInstanceOf(StorageException.class)
                .hasMessageContaining("upload file");
    }

    @Test
    @DisplayName("Should generate presigned URL successfully")
    void shouldGeneratePresignedUrlSuccessfully() throws Exception {
        String objectKey = "covers/test.jpg";
        String internalUrl = "http://minio:9000/album-covers/covers/test.jpg?signature=xyz";
        
        when(minioClient.getPresignedObjectUrl(any(GetPresignedObjectUrlArgs.class)))
                .thenReturn(internalUrl);

        String presignedUrl = minioStorageService.getPresignedUrl(objectKey);

        assertThat(presignedUrl).contains("http://localhost:9000");
        assertThat(presignedUrl).doesNotContain("http://minio:9000");
        verify(minioClient).getPresignedObjectUrl(any(GetPresignedObjectUrlArgs.class));
    }

    @Test
    @DisplayName("Should throw StorageException when presigned URL generation fails")
    void shouldThrowExceptionWhenPresignedUrlFails() throws Exception {
        String objectKey = "covers/test.jpg";
        when(minioClient.getPresignedObjectUrl(any(GetPresignedObjectUrlArgs.class)))
                .thenThrow(new RuntimeException("MinIO error"));

        assertThatThrownBy(() -> minioStorageService.getPresignedUrl(objectKey))
                .isInstanceOf(StorageException.class)
                .hasMessageContaining("generate presigned URL");
    }

    @Test
    @DisplayName("Should throw StorageException when delete fails")
    void shouldThrowExceptionWhenDeleteFails() throws Exception {
        String objectKey = "covers/test.jpg";
        doThrow(new RuntimeException("MinIO error"))
                .when(minioClient).removeObject(any(RemoveObjectArgs.class));

        assertThatThrownBy(() -> minioStorageService.deleteFile(objectKey))
                .isInstanceOf(StorageException.class)
                .hasMessageContaining("delete file");
    }



    @Test
    @DisplayName("Should delete file successfully")
    void shouldDeleteFileSuccessfully() throws Exception {
        String objectKey = "covers/test.jpg";
        doNothing().when(minioClient).removeObject(any(RemoveObjectArgs.class));

        minioStorageService.deleteFile(objectKey);

        verify(minioClient).removeObject(any(RemoveObjectArgs.class));
    }



    @Test
    @DisplayName("Should throw StorageException when bucket creation fails")
    void shouldThrowExceptionWhenBucketCreationFails() throws Exception {
        MinioStorageService service = new MinioStorageService();
        ReflectionTestUtils.setField(service, "minioUrl", "http://minio:9000");
        ReflectionTestUtils.setField(service, "accessKey", "minioadmin");
        ReflectionTestUtils.setField(service, "secretKey", "minioadmin");
        ReflectionTestUtils.setField(service, "bucketName", "album-covers");

        MinioClient mockClient = mock(MinioClient.class);
        ReflectionTestUtils.setField(service, "minioClient", mockClient);

        when(mockClient.bucketExists(any(BucketExistsArgs.class)))
                .thenThrow(new RuntimeException("Connection error"));

        assertThatThrownBy(() -> {
            java.lang.reflect.Method method = MinioStorageService.class.getDeclaredMethod("createBucketIfNotExists");
            method.setAccessible(true);
            method.invoke(service);
        })
        .hasCauseInstanceOf(StorageException.class);
    }

    @Test
    @DisplayName("Should preserve URL when internal and external URLs are the same")
    void shouldPreserveUrlWhenInternalAndExternalAreSame() throws Exception {
        ReflectionTestUtils.setField(minioStorageService, "minioUrl", "http://localhost:9000");
        ReflectionTestUtils.setField(minioStorageService, "minioExternalUrl", "http://localhost:9000");
        
        String objectKey = "covers/test.jpg";
        String internalUrl = "http://localhost:9000/album-covers/covers/test.jpg?signature=xyz";
        
        when(minioClient.getPresignedObjectUrl(any(GetPresignedObjectUrlArgs.class)))
                .thenReturn(internalUrl);

        String presignedUrl = minioStorageService.getPresignedUrl(objectKey);

        assertThat(presignedUrl).isEqualTo(internalUrl);
    }

}
