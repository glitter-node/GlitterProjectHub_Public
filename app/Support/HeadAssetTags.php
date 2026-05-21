<?php

namespace App\Support;

class HeadAssetTags
{
    public static function render(array $config): string
    {
        $tags = [];

        foreach (($config['icons'] ?? []) as $icon) {
            if (! is_array($icon) || empty($icon['href'])) {
                continue;
            }

            $attrs = [
                'rel' => $icon['rel'] ?? 'icon',
                'type' => $icon['type'] ?? null,
                'sizes' => $icon['sizes'] ?? null,
                'href' => $icon['href'],
            ];

            $tags[] = self::tag('link', $attrs);
        }

        if (! empty($config['apple_touch_icon']['href'])) {
            $tags[] = self::tag('link', [
                'rel' => 'apple-touch-icon',
                'sizes' => $config['apple_touch_icon']['sizes'] ?? null,
                'href' => $config['apple_touch_icon']['href'],
            ]);
        }

        if (! empty($config['manifest'])) {
            $tags[] = self::tag('link', [
                'rel' => 'manifest',
                'href' => $config['manifest'],
            ]);
        }

        if (! empty($config['theme_color'])) {
            $tags[] = self::tag('meta', [
                'name' => 'theme-color',
                'content' => $config['theme_color'],
            ]);
        }

        return implode("\n", array_unique($tags));
    }

    private static function tag(string $tag, array $attrs): string
    {
        $rendered = [];

        foreach ($attrs as $name => $value) {
            if ($value === null || $value === '') {
                continue;
            }

            $rendered[] = $name.'="'.e((string) $value).'"';
        }

        return '<'.$tag.' '.implode(' ', $rendered).'>';
    }
}
