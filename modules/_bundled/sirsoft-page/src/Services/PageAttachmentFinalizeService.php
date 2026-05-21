<?php

namespace Modules\Sirsoft\Page\Services;

use App\Contracts\Extension\StorageInterface;
use App\Enums\AttachmentStatus;
use App\Extension\HookManager;
use App\Services\AttachmentMimeInspectionService;
use App\Services\AttachmentProcessingLifecycleService;
use Illuminate\Support\Facades\Log;
use Modules\Sirsoft\Page\Models\PageAttachment;

class PageAttachmentFinalizeService
{
    public function __construct(
        private StorageInterface $storage,
        private AttachmentMimeInspectionService $mimeInspectionService,
        private AttachmentProcessingLifecycleService $lifecycle
    ) {}

    public function finalize(int $attachmentId, int $jobAttempt = 1): void
    {
        $attachment = PageAttachment::find($attachmentId);

        if (! $attachment) {
            Log::info('페이지 첨부파일 finalize 건너뜀: 행 없음', [
                'domain' => 'page',
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
                if ($this->lifecycle->markStaleFailed($attachment, 'page')) {
                    HookManager::doAction('sirsoft-page.attachment.after_failed', $attachment->fresh());
                }
            }

            return;
        }

        if ($status === AttachmentStatus::Failed) {
            $this->lifecycle->logLifecycle('retry_started', 'page', $attachment, ['reason' => $attachment->failed_reason]);
        }

        $claimed = PageAttachment::query()
            ->whereKey($attachmentId)
            ->whereIn('status', [AttachmentStatus::Pending->value, AttachmentStatus::Failed->value])
            ->update([
                'status' => AttachmentStatus::Processing->value,
                'updated_at' => now(),
            ]);

        if ($claimed !== 1) {
            Log::info('페이지 첨부파일 finalize 건너뜀: processing claim 실패', [
                'domain' => 'page',
                'attachment_id' => $attachmentId,
                'status' => $status->value,
            ]);

            return;
        }

        $attachment = PageAttachment::find($attachmentId);
        if (! $attachment) {
            return;
        }

        $this->lifecycle->markStarted($attachment, 'page', $jobAttempt);
        $attachment = $attachment->fresh() ?? $attachment;

        if (! $this->storage->exists('attachments', $attachment->path)) {
            $this->markFailed($attachment, 'missing_file');

            return;
        }

        $storedFilePath = $this->storage->getBasePath('attachments').DIRECTORY_SEPARATOR.$attachment->path;
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

        $meta = $this->mergeProcessingMeta($attachment, $inspection, $storedFilePath);
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
            $this->lifecycle->fireCompleted('page', $attachment);
            HookManager::doAction('sirsoft-page.attachment.after_ready', $attachment);
        } else {
            $this->lifecycle->fireQuarantined('page', $attachment, $inspection['failed_reason']);
            HookManager::doAction('sirsoft-page.attachment.after_quarantined', $attachment);
        }
    }

    /**
     * @param  array<string, mixed>  $inspection
     * @return array<string, mixed>
     */
    private function mergeProcessingMeta(PageAttachment $attachment, array $inspection, string $storedFilePath): array
    {
        $meta = $this->lifecycle->completedMeta($attachment, $inspection);

        if (str_starts_with($inspection['detected_mime'], 'image/') && $inspection['detected_mime'] !== 'image/svg+xml') {
            $imageSize = @getimagesize($storedFilePath);
            if ($imageSize) {
                $meta['width'] = $imageSize[0];
                $meta['height'] = $imageSize[1];
            }
        }

        return $meta;
    }

    private function markFailed(PageAttachment $attachment, string $reason): void
    {
        $attachment->update([
            'status' => AttachmentStatus::Failed->value,
            'processed_at' => now(),
            'failed_reason' => $reason,
            'meta' => $this->lifecycle->failedMeta($attachment, $reason),
        ]);

        $attachment = $attachment->fresh();
        $this->lifecycle->fireFailed('page', $attachment, $reason);
        HookManager::doAction('sirsoft-page.attachment.after_failed', $attachment);
    }
}
