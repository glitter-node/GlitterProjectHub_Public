<?php

namespace App\Services;

use App\Enums\AttachmentStatus;
use App\Enums\AttachmentType;
use Illuminate\Http\UploadedFile;

class AttachmentMimeInspectionService
{
    /**
     * @return array{
     *     detected_mime: string,
     *     uploaded_mime: string|null,
     *     extension: string,
     *     attachment_type: string,
     *     status: string,
     *     failed_reason: string|null,
     *     is_sensitive_format: bool,
     *     mime_mismatch: bool,
     *     meta: array<string, mixed>
     * }
     */
    public function inspect(UploadedFile $file): array
    {
        return $this->inspectPath(
            $file->getRealPath(),
            strtolower((string) $file->getClientOriginalExtension()),
            $file->getMimeType()
        );
    }

    /**
     * Inspect already-stored file content.
     *
     * @return array{
     *     detected_mime: string,
     *     uploaded_mime: string|null,
     *     extension: string,
     *     attachment_type: string,
     *     status: string,
     *     failed_reason: string|null,
     *     is_sensitive_format: bool,
     *     mime_mismatch: bool,
     *     meta: array<string, mixed>
     * }
     */
    public function inspectFilePath(
        string $storedFilePath,
        ?string $originalFilename = null,
        ?string $uploadedMime = null,
        ?string $extension = null
    ): array {
        $resolvedExtension = strtolower((string) ($extension ?: pathinfo((string) $originalFilename, PATHINFO_EXTENSION)));

        return $this->inspectPath($storedFilePath, $resolvedExtension, $uploadedMime ? strtolower($uploadedMime) : null);
    }

    /**
     * @return array{
     *     detected_mime: string,
     *     uploaded_mime: string|null,
     *     extension: string,
     *     attachment_type: string,
     *     status: string,
     *     failed_reason: string|null,
     *     is_sensitive_format: bool,
     *     mime_mismatch: bool,
     *     meta: array<string, mixed>
     * }
     */
    private function inspectPath(string|false $path, string $extension, ?string $uploadedMime): array
    {
        $detectedMime = $this->detectMime($path);
        $detectedMime = $this->normalizeExplicitFormat($detectedMime, $path, $extension, $uploadedMime);
        $attachmentType = $this->classify($detectedMime, $extension);
        $extensionType = $this->classifyExtension($extension);
        $isSensitive = $this->isSensitiveFormat($detectedMime, $extension, $uploadedMime);
        $failedReason = $this->detectFailureReason(
            $detectedMime,
            $uploadedMime,
            $extension,
            $extensionType,
            $attachmentType,
            $path
        );

        $status = $failedReason === null
            ? AttachmentStatus::Ready->value
            : AttachmentStatus::Quarantined->value;

        $mimeMismatch = $this->isMimeMismatch($detectedMime, $uploadedMime);

        return [
            'detected_mime' => $detectedMime,
            'uploaded_mime' => $uploadedMime,
            'extension' => $extension,
            'attachment_type' => $attachmentType,
            'status' => $status,
            'failed_reason' => $failedReason,
            'is_sensitive_format' => $isSensitive,
            'mime_mismatch' => $mimeMismatch,
            'meta' => [
                'mime_inspection' => [
                    'detected_mime' => $detectedMime,
                    'uploaded_mime' => $uploadedMime,
                    'extension' => $extension,
                    'attachment_type' => $attachmentType,
                    'is_sensitive_format' => $isSensitive,
                    'mime_mismatch' => $mimeMismatch,
                    'failed_reason' => $failedReason,
                ],
            ],
        ];
    }

    private function detectMime(string|false $path): string
    {
        if (! is_string($path) || $path === '' || ! is_file($path)) {
            return 'application/octet-stream';
        }

        $finfo = new \finfo(FILEINFO_MIME_TYPE);
        $mime = $finfo->file($path);

        return is_string($mime) && $mime !== '' ? strtolower($mime) : 'application/octet-stream';
    }

    private function normalizeExplicitFormat(string $detectedMime, string|false $path, string $extension, ?string $uploadedMime): string
    {
        $uploadedMime = $uploadedMime ? strtolower($uploadedMime) : null;

        if ($this->looksLikeSvg($path, $extension, $uploadedMime)) {
            return 'image/svg+xml';
        }

        if ($extension === 'zip' && $this->hasBinaryPrefix($path, "PK\x03\x04")) {
            return 'application/zip';
        }

        if ($extension === 'pdf' && $this->hasBinaryPrefix($path, '%PDF')) {
            return 'application/pdf';
        }

        return strtolower($detectedMime);
    }

    private function classify(string $mime, string $extension): string
    {
        if (str_starts_with($mime, 'image/')) {
            return AttachmentType::Image->value;
        }

        if (str_starts_with($mime, 'audio/') || str_starts_with($mime, 'video/')) {
            return AttachmentType::Media->value;
        }

        if (in_array($extension, ['docx', 'xlsx', 'pptx'], true) && $mime === 'application/zip') {
            return AttachmentType::Document->value;
        }

        if ($this->isArchiveMime($mime) || in_array($extension, ['zip', 'rar', '7z', 'gz', 'tar'], true)) {
            return AttachmentType::Archive->value;
        }

        if (
            str_starts_with($mime, 'text/')
            || in_array($mime, [
                'application/pdf',
                'application/msword',
                'application/vnd.ms-excel',
                'application/vnd.ms-powerpoint',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                'application/haansofthwp',
                'application/x-hwp',
            ], true)
            || in_array($extension, ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'hwp', 'txt', 'md', 'csv'], true)
        ) {
            return AttachmentType::Document->value;
        }

        return AttachmentType::Unknown->value;
    }

    private function classifyExtension(string $extension): string
    {
        if (in_array($extension, ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'], true)) {
            return AttachmentType::Image->value;
        }

        if (in_array($extension, ['mp3', 'wav', 'mp4', 'mov', 'avi', 'webm'], true)) {
            return AttachmentType::Media->value;
        }

        if (in_array($extension, ['zip', 'rar', '7z', 'gz', 'tar'], true)) {
            return AttachmentType::Archive->value;
        }

        if (in_array($extension, ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'hwp', 'txt', 'md', 'csv'], true)) {
            return AttachmentType::Document->value;
        }

        return AttachmentType::Unknown->value;
    }

    private function detectFailureReason(
        string $detectedMime,
        ?string $uploadedMime,
        string $extension,
        string $extensionType,
        string $attachmentType,
        string|false $path
    ): ?string {
        if ($extension === 'svg' && $detectedMime !== 'image/svg+xml') {
            return 'mime_svg_not_detected';
        }

        if ($extension === 'svg' && $this->svgContainsActiveContent($path)) {
            return 'svg_active_content';
        }

        if ($extension === 'zip' && $detectedMime !== 'application/zip') {
            return 'mime_zip_not_detected';
        }

        if ($extension === 'pdf' && $detectedMime !== 'application/pdf') {
            return 'mime_pdf_not_detected';
        }

        if (
            $extensionType !== AttachmentType::Unknown->value
            && $attachmentType !== AttachmentType::Unknown->value
            && $extensionType !== $attachmentType
        ) {
            return 'mime_extension_type_mismatch';
        }

        if ($this->isMimeMismatch($detectedMime, $uploadedMime) && $this->isSensitiveFormat($detectedMime, $extension, $uploadedMime)) {
            return 'sensitive_mime_mismatch';
        }

        return null;
    }

    private function isMimeMismatch(string $detectedMime, ?string $uploadedMime): bool
    {
        if (! $uploadedMime) {
            return false;
        }

        return $this->canonicalMime($detectedMime) !== $this->canonicalMime(strtolower($uploadedMime));
    }

    private function canonicalMime(string $mime): string
    {
        return match ($mime) {
            'application/x-zip', 'application/x-zip-compressed', 'multipart/x-zip' => 'application/zip',
            'image/pjpeg' => 'image/jpeg',
            'text/xml', 'application/xml' => 'image/svg+xml',
            default => $mime,
        };
    }

    private function isSensitiveFormat(string $detectedMime, string $extension, ?string $uploadedMime): bool
    {
        $uploadedMime = $uploadedMime ? strtolower($uploadedMime) : null;

        return in_array($extension, ['svg', 'zip', 'pdf'], true)
            || in_array($detectedMime, ['image/svg+xml', 'application/zip', 'application/pdf'], true)
            || in_array($uploadedMime, ['image/svg+xml', 'application/zip', 'application/pdf'], true);
    }

    private function isArchiveMime(string $mime): bool
    {
        return in_array($mime, [
            'application/zip',
            'application/x-zip',
            'application/x-zip-compressed',
            'application/x-rar',
            'application/x-7z-compressed',
            'application/gzip',
            'application/x-tar',
        ], true);
    }

    private function looksLikeSvg(string|false $path, string $extension, ?string $uploadedMime): bool
    {
        if ($extension !== 'svg' && $uploadedMime !== 'image/svg+xml') {
            return false;
        }

        $sample = $this->readSample($path, 4096);

        return $sample !== null && str_contains(strtolower($sample), '<svg');
    }

    private function svgContainsActiveContent(string|false $path): bool
    {
        $sample = $this->readSample($path, 65536);
        if ($sample === null) {
            return true;
        }

        $sample = strtolower($sample);

        return str_contains($sample, '<script')
            || str_contains($sample, 'javascript:')
            || preg_match('/\son[a-z]+\s*=/', $sample) === 1;
    }

    private function hasBinaryPrefix(string|false $path, string $prefix): bool
    {
        $sample = $this->readSample($path, strlen($prefix));

        return $sample !== null && str_starts_with($sample, $prefix);
    }

    private function readSample(string|false $path, int $length): ?string
    {
        if (! is_string($path) || $path === '' || ! is_file($path)) {
            return null;
        }

        $handle = @fopen($path, 'rb');
        if (! $handle) {
            return null;
        }

        try {
            $sample = fread($handle, $length);

            return is_string($sample) ? $sample : null;
        } finally {
            fclose($handle);
        }
    }
}
