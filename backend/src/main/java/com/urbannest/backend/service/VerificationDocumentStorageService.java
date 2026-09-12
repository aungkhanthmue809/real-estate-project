package com.urbannest.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Locale;
import java.util.UUID;

@Service
public class VerificationDocumentStorageService {

    public static final long MAX_NRC_FILE_SIZE = 10L * 1024 * 1024;
    public static final long MAX_OWNERSHIP_FILE_SIZE = 10L * 1024 * 1024;

    private final Path verificationUploadDirectory;

    public VerificationDocumentStorageService(@Value("${app.upload-dir:uploads}") String uploadDirectory) {
        Path uploadRoot = Path.of(uploadDirectory).toAbsolutePath().normalize();
        this.verificationUploadDirectory = uploadRoot.resolve("verification").normalize();

        if (!verificationUploadDirectory.startsWith(uploadRoot)) {
            throw new IllegalArgumentException("Invalid verification upload directory");
        }

        try {
            Files.createDirectories(verificationUploadDirectory);
        } catch (IOException exception) {
            throw new IllegalStateException("Unable to create the verification upload directory", exception);
        }
    }

    public String storeNrc(Long userId, MultipartFile file) {
        return store(userId, file, MAX_NRC_FILE_SIZE, true);
    }

    public String storeOwnership(Long userId, MultipartFile file) {
        return store(userId, file, MAX_OWNERSHIP_FILE_SIZE, false);
    }

    private String store(Long userId, MultipartFile file, long maxFileSize, boolean nrcOnly) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "The selected file is empty. Please choose another file."
            );
        }
        if (file.getSize() > maxFileSize) {
            throw new ResponseStatusException(
                    HttpStatus.CONTENT_TOO_LARGE,
                    "File is too large. Maximum file size is " + (maxFileSize / (1024 * 1024)) + " MB."
            );
        }

        String declaredContentType = file.getContentType() == null
                ? ""
                : file.getContentType().toLowerCase(Locale.ROOT);

        DocumentType documentType = detectDocumentType(file, declaredContentType);
        if (documentType == null) {
            if (nrcOnly) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Unsupported NRC format. Please upload a JPEG or PNG image."
                );
            } else {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Unsupported document format. Please upload a JPEG, PNG, or PDF file."
                );
            }
        }
        if (nrcOnly && documentType == DocumentType.PDF) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "NRC must be an image (JPEG or PNG). PDF is not allowed for NRC."
            );
        }

        String generatedFilename = UUID.randomUUID() + documentType.extension;
        Path userDirectory = verificationUploadDirectory.resolve(userId.toString()).normalize();
        if (!userDirectory.startsWith(verificationUploadDirectory)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid upload destination");
        }

        try {
            Files.createDirectories(userDirectory);
        } catch (IOException exception) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Upload directory creation failed.",
                    exception
            );
        }

        Path destination = userDirectory.resolve(generatedFilename).normalize();
        if (!destination.startsWith(userDirectory)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid upload destination");
        }

        try (InputStream inputStream = file.getInputStream()) {
            Files.copy(inputStream, destination);
        } catch (IOException exception) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Document upload failed. Please try again.",
                    exception
            );
        }

        return userId + "/" + generatedFilename;
    }

    public Path resolvePath(String token) {
        if (token == null || token.isBlank()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Document not found");
        }
        Path path = verificationUploadDirectory.resolve(token).normalize();
        if (!path.startsWith(verificationUploadDirectory)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid document path");
        }
        if (!Files.exists(path)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Document not found");
        }
        return path;
    }

    private DocumentType detectDocumentType(MultipartFile file, String declaredContentType) {
        byte[] header = new byte[8];
        int bytesRead;
        try (InputStream inputStream = file.getInputStream()) {
            bytesRead = inputStream.read(header);
        } catch (IOException exception) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "The selected file does not appear to be a valid document.",
                    exception
            );
        }

        if (bytesRead >= 3
                && unsigned(header[0]) == 0xFF
                && unsigned(header[1]) == 0xD8
                && unsigned(header[2]) == 0xFF) {
            if (ImageType.supports(declaredContentType)) {
                return DocumentType.JPEG;
            }
        }
        if (bytesRead >= 8
                && unsigned(header[0]) == 0x89
                && header[1] == 'P'
                && header[2] == 'N'
                && header[3] == 'G'
                && unsigned(header[4]) == 0x0D
                && unsigned(header[5]) == 0x0A
                && unsigned(header[6]) == 0x1A
                && unsigned(header[7]) == 0x0A) {
            if (ImageType.supports(declaredContentType)) {
                return DocumentType.PNG;
            }
        }
        if (bytesRead >= 5
                && header[0] == '%'
                && header[1] == 'P'
                && header[2] == 'D'
                && header[3] == 'F'
                && header[4] == '-') {
            if ("application/pdf".equals(declaredContentType)) {
                return DocumentType.PDF;
            }
        }
        return null;
    }

    private int unsigned(byte value) {
        return value & 0xFF;
    }

    private enum DocumentType {
        JPEG("image/jpeg", ".jpg"),
        PNG("image/png", ".png"),
        PDF("application/pdf", ".pdf");

        private final String contentType;
        private final String extension;

        DocumentType(String contentType, String extension) {
            this.contentType = contentType;
            this.extension = extension;
        }
    }

    private enum ImageType {
        JPEG("image/jpeg"),
        PNG("image/png");

        private final String contentType;

        ImageType(String contentType) {
            this.contentType = contentType;
        }

        private static boolean supports(String contentType) {
            for (ImageType imageType : values()) {
                if (imageType.contentType.equals(contentType)) {
                    return true;
                }
            }
            return false;
        }
    }
}