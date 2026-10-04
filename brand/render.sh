#!/bin/sh
# Пересобирает картинки бренда из HTML-исходников этой папки.
# Нужны Google Chrome и ImageMagick (magick). Запуск: sh brand/render.sh
set -e
cd "$(dirname "$0")"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
shot() { # файл ширина высота выход
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
    --default-background-color=00000000 --virtual-time-budget=6000 \
    --window-size="$2,$3" --screenshot="$4" "file://$PWD/$1" >/dev/null 2>&1
}
shot og.html 1200 630 ../assets/og.png
shot 'og.html?en' 1200 630 ../assets/og-en.png
shot touch-icon.html 180 180 ../assets/apple-touch-icon.png
shot favicon.html 64 64 favicon-64.png
magick favicon-64.png \( -clone 0 -resize 32x32 \) \( -clone 0 -resize 16x16 \) -delete 0 ../favicon.ico
rm favicon-64.png
echo "готово: assets/og.png, assets/og-en.png, assets/apple-touch-icon.png, favicon.ico"
