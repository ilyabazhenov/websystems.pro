# websystems.pro

Сайт [websystems.pro](https://websystems.pro/): шесть приложений для Mac и инструменты для работы с ИИ-агентами, по порядку рабочего дня.

Статика без сборки: русская версия в `index.html`, английская в `en/index.html`, общие стили и скрипт в `assets/site.css` и `assets/site.js`, иконки в `assets/icons/`. Тексты правятся в обоих файлах. Локально:

```bash
python3 -m http.server 4173 --bind 127.0.0.1
```

Знак, фавиконы и картинка для превью ссылок собираются из HTML-исходников в `brand/` (нужны Google Chrome и ImageMagick):

```bash
sh brand/render.sh
```
