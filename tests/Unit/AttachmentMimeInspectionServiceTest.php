<?php

namespace Tests\Unit;

use App\Enums\AttachmentStatus;
use App\Enums\AttachmentType;
use App\Services\AttachmentMimeInspectionService;
use Illuminate\Http\UploadedFile;
use Tests\TestCase;

class AttachmentMimeInspectionServiceTest extends TestCase
{
    private array $tempFiles = [];

    protected function tearDown(): void
    {
        foreach ($this->tempFiles as $path) {
            if (is_file($path)) {
                @unlink($path);
            }
        }

        parent::tearDown();
    }

    public function test_classifies_plain_text_as_document(): void
    {
        $file = $this->uploadedFile('notes.txt', 'plain text');
        $result = app(AttachmentMimeInspectionService::class)->inspect($file);

        $this->assertSame(AttachmentStatus::Ready->value, $result['status']);
        $this->assertSame(AttachmentType::Document->value, $result['attachment_type']);
        $this->assertSame(AttachmentType::Document->value, $result['meta']['mime_inspection']['attachment_type']);
    }

    public function test_quarantines_obvious_extension_type_mismatch(): void
    {
        $file = $this->uploadedFile('not-an-image.jpg', 'plain text');
        $result = app(AttachmentMimeInspectionService::class)->inspect($file);

        $this->assertSame(AttachmentStatus::Quarantined->value, $result['status']);
        $this->assertSame('mime_extension_type_mismatch', $result['failed_reason']);
    }

    public function test_quarantines_svg_with_active_content(): void
    {
        $file = $this->uploadedFile('active.svg', '<svg><script>alert(1)</script></svg>');
        $result = app(AttachmentMimeInspectionService::class)->inspect($file);

        $this->assertSame(AttachmentStatus::Quarantined->value, $result['status']);
        $this->assertSame('svg_active_content', $result['failed_reason']);
        $this->assertSame(AttachmentType::Image->value, $result['attachment_type']);
    }

    private function uploadedFile(string $name, string $contents): UploadedFile
    {
        $path = tempnam(sys_get_temp_dir(), 'attachment_mime_');
        file_put_contents($path, $contents);
        $this->tempFiles[] = $path;

        return new UploadedFile($path, $name, null, null, true);
    }
}
