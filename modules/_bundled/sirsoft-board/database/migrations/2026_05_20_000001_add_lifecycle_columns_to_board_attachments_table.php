<?php

use App\Enums\AttachmentStatus;
use App\Enums\AttachmentType;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('board_attachments', function (Blueprint $table) {
            if (! Schema::hasColumn('board_attachments', 'status')) {
                $table->string('status', 32)->default(AttachmentStatus::Ready->value)->after('size')->index('idx_board_attachments_status');
            }

            if (! Schema::hasColumn('board_attachments', 'attachment_type')) {
                $table->string('attachment_type', 32)->default(AttachmentType::Unknown->value)->after('status');
            }

            if (! Schema::hasColumn('board_attachments', 'processed_at')) {
                $table->timestamp('processed_at')->nullable()->after('attachment_type');
            }

            if (! Schema::hasColumn('board_attachments', 'failed_reason')) {
                $table->string('failed_reason')->nullable()->after('processed_at');
            }
        });
    }

    public function down(): void
    {
        Schema::table('board_attachments', function (Blueprint $table) {
            if (Schema::hasColumn('board_attachments', 'status')) {
                $table->dropIndex('idx_board_attachments_status');
            }

            foreach (['failed_reason', 'processed_at', 'attachment_type', 'status'] as $column) {
                if (Schema::hasColumn('board_attachments', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
