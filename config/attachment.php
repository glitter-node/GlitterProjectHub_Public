<?php

return [
    /*
    |--------------------------------------------------------------------------
    | 스토리지 디스크
    |--------------------------------------------------------------------------
    |
    | 첨부파일 저장에 사용할 디스크를 지정합니다.
    | config/filesystems.php에 정의된 디스크 이름을 사용합니다.
    |
    */
    'disk' => env('ATTACHMENT_DISK', 'attachments'),

    /*
    |--------------------------------------------------------------------------
    | 기본 권한 정책
    |--------------------------------------------------------------------------
    |
    | 역할이 지정되지 않은 첨부파일의 기본 권한 정책을 설정합니다.
    |
    | 옵션:
    | - 'public': 모든 인증된 사용자에게 전체 권한 허용
    | - 'owner_only': 업로더와 관리자만 접근 가능
    | - 'read_only': 모든 인증된 사용자에게 read만 허용
    |
    */
    'default_permission_policy' => env('ATTACHMENT_DEFAULT_POLICY', 'public'),

    /*
    |--------------------------------------------------------------------------
    | 최대 파일 크기
    |--------------------------------------------------------------------------
    |
    | 업로드 가능한 최대 파일 크기 (KB 단위)
    |
    */
    'max_file_size' => env('ATTACHMENT_MAX_FILE_SIZE', 10240),

    /*
    |--------------------------------------------------------------------------
    | Async Attachment Processing
    |--------------------------------------------------------------------------
    |
    | Processing rows older than this threshold are considered stale and may be
    | failed safely by a later finalize attempt.
    |
    */
    'processing_stale_minutes' => env('ATTACHMENT_PROCESSING_STALE_MINUTES', 15),

    'lifecycle_log_retention_days' => env('ATTACHMENT_LIFECYCLE_LOG_RETENTION_DAYS', 14),

    'terminal_export_default_limit' => env('ATTACHMENT_TERMINAL_EXPORT_DEFAULT_LIMIT', 100),
];
