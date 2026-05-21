<?php

namespace App\Services;

use App\Enums\AttachmentStatus;
use App\Extension\HookManager;
use App\Models\Attachment;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class CoreAttachmentFinalizeService
{
    public function __construct(
        private AttachmentMimeInspectionService $mimeInspectionService,
        private AttachmentProcessingLifecycleService $lifecycle
    ) {}

    public function finalize(int $attachmentId, int $jobAttempt = 1): void
    {
        $attachment = Attachment::find($attachmentId);

        if (! $attachment) {
            Log::info('코어 첨부파일 finalize 건너뜀: 행 없음', [
                'domain' => 'core',
                'attachment_id' => $attachmentId,
            ]);

            return;
        }

        $status = $attachment->status instanceof AttachmentStatus ? $attachment->status : AttachmentStatus::from($attachment->status);
        if (in_array($status, [AttachmentStatus::Ready, AttachmentStatus::Quarantined], true)) {
            return;
        }

        if ($status === AttachmentStatus::Processing) {
            if ($this->lifecycle->isProcessingStale($attachment)) {
                if ($this->lifecycle->markStaleFailed($attachment, 'core')) {
                    HookManager::doAction('core.attachment.after_failed', $attachment->fresh());
                }
            }

            return;
        }

        if ($status === AttachmentStatus::Failed) {
            $this->lifecycle->logLifecycle('retry_started', 'core', $attachment, ['reason' => $attachment->failed_reason]);
        }

        $claimed = Attachment::query()
            ->whereKey($attachmentId)
            ->whereIn('status', [AttachmentStatus::Pending->value, AttachmentStatus::Failed->value])
            ->update([
                'status' => AttachmentStatus::Processing->value,
                'updated_at' => now(),
            ]);

        if ($claimed !== 1) {
            Log::info('코어 첨부파일 finalize 건너뜀: processing claim 실패', [
                'domain' => 'core',
                'attachment_id' => $attachmentId,
                'status' => $status->value,
            ]);

            return;
        }

        $attachment = Attachment::find($attachmentId);
        if (! $attachment) {
            return;
        }

        $this->lifecycle->markStarted($attachment, 'core', $jobAttempt);
        $attachment = $attachment->fresh() ?? $attachment;

        $disk = Storage::disk($attachment->disk);
        if (! $disk->exists($attachment->path)) {
            $this->markFailed($attachment, 'missing_file');

            return;
        }

        $storedFilePath = $disk->path($attachment->path);
        if (! is_file($storedFilePath) || ! is_readable($storedFilePath)) {
            $this->markFailed($attachment, 'storage_read_failed');

            return;
        }

        $uploadMeta = is_array($attachment->meta) ? ($attachment->meta['upload'] ?? []) : [];
        $inspection = $this->mimeInspectionService->inspectFilePath(
            $storedFilePath,
            $attachment->original_filename,
            is_array($uploadMeta) ? ($uploadMeta['uploaded_mime'] ?? $attachment->mime_type) : $attachment->mime_type,
            is_array($uploadMeta) ? ($uploadMeta['extension'] ?? null) : null
        );

        $meta = $this->mergeProcessingMeta($attachment, $inspection);
        $status = $inspection['status'] === AttachmentStatus::Ready->value
            ? AttachmentStatus::Ready
            : AttachmentStatus::Quarantined;

        $attachment->update([
            'mime_type' => $inspection['detected_mime'],
            'status' => $status->value,
            'attachment_type' => $inspection['attachment_type'],
            'processed_at' => now(),
            'failed_reason' => $inspection['failed_reason'],
            'meta' => $meta,
        ]);

        $attachment = $attachment->fresh();
        if ($status === AttachmentStatus::Ready) {
            $this->lifecycle->fireCompleted('core', $attachment);
            HookManager::doAction('core.attachment.after_ready', $attachment);
        } else {
            $this->lifecycle->fireQuarantined('core', $attachment, $inspection['failed_reason']);
            HookManager::doAction('core.attachment.after_quarantined', $attachment);
        }
    }

    /**
     * @param  array<string, mixed>  $inspection
     * @return array<string, mixed>
     */
    private function mergeProcessingMeta(Attachment $attachment, array $inspection): array
    {
        $meta = $this->lifecycle->completedMeta($attachment, $inspection);

        if (str_starts_with($inspection['detected_mime'], 'image/') && $inspection['detected_mime'] !== 'image/svg+xml') {
            $imageSize = @getimagesize(Storage::disk($attachment->disk)->path($attachment->path));
            if ($imageSize) {
                $meta['width'] = $imageSize[0];
                $meta['height'] = $imageSize[1];
            }
        }

        return $meta;
    }

    private function markFailed(Attachment $attachment, string $reason): void
    {
        $attachment->update([
            'status' => AttachmentStatus::Failed->value,
            'processed_at' => now(),
            'failed_reason' => $reason,
            'meta' => $this->lifecycle->failedMeta($attachment, $reason),
        ]);

        $attachment = $attachment->fresh();
        $this->lifecycle->fireFailed('core', $attachment, $reason);
        HookManager::doAction('core.attachment.after_failed', $attachment);
    }
}
