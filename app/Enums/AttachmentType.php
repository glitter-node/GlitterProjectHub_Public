<?php

namespace App\Enums;

enum AttachmentType: string
{
    case Image = 'image';
    case Document = 'document';
    case Archive = 'archive';
    case Media = 'media';
    case Unknown = 'unknown';

    /**
     * @return array<int, string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
