<?php

namespace App\Jobs;

use App\Services\CoreAttachmentFinalizeService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Modules\Sirsoft\Board\Services\BoardAttachmentFinalizeService;
use Modules\Sirsoft\Page\Services\PageAttachmentFinalizeService;

class FinalizeAttachmentUploadJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public int $timeout = 120;

    public function __construct(
        public readonly string $domain,
        public readonly int $attachmentId,
    ) {
        $this->afterCommit = true;
    }

    /**
     * @return array<int, int>
     */
    public function backoff(): array
    {
        return [30, 120, 300];
    }

    public function handle(
        CoreAttachmentFinalizeService $coreFinalizer,
        BoardAttachmentFinalizeService $boardFinalizer,
        PageAttachmentFinalizeService $pageFinalizer
    ): void {
        match ($this->domain) {
            'core' => $coreFinalizer->finalize($this->attachmentId, $this->attempts()),
            'board' => $boardFinalizer->finalize($this->attachmentId, $this->attempts()),
            'page' => $pageFinalizer->finalize($this->attachmentId, $this->attempts()),
            default => Log::warning('지원하지 않는 첨부파일 finalize domain', [
                'domain' => $this->domain,
                'attachment_id' => $this->attachmentId,
            ]),
        };
    }

    public function failed(\Throwable $exception): void
    {
        Log::error('첨부파일 finalize 큐 작업 실패', [
            'domain' => $this->domain,
            'attachment_id' => $this->attachmentId,
            'exception' => $exception->getMessage(),
        ]);
    }
}
