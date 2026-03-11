# ZenPulse: AI Meditation App

Премиальный wellness-прототип для тестового задания, собранный на `React Native + Expo + TypeScript`.

[English version / Английская версия](./README.md)

## Быстрый гид для проверяющего

Если открыть только ссылку на этот репозиторий, внутри уже есть почти весь пакет сдачи:

- код и история коммитов
- скриншоты в `assets/demo/`
- видеоматериалы в `assets/demo/videos/`
- инструкция по запуску и тестированию
- ответ на контрольный вопрос про мобильную верстку и контроль работы AI

После клика по `.mp4`-файлам GitHub покажет их в собственном видео-просмотрщике.

## Соответствие требованиям тестового задания

### 1. Экран Paywall

- яркое premium-оформление в luxury meditation стиле
- два тарифа: `Monthly` и `Yearly`
- `Yearly` визуально выделен как более выгодный вариант
- кнопка `Try premium free for 7 days` имитирует успешную покупку и открывает premium-контент

### 2. Экран Meditations

- список карточек медитаций с визуальными gradient-обложками и длительностью
- free / premium gating реализован и в интерфейсе, и в навигационной логике
- когда `isSubscribed = false`, premium-карточки остаются кликабельными, но ведут обратно на paywall

### 3. AI Mood of the day

- три состояния/настроения на выбор
- аффирмация генерируется через prompt к LLM
- приложение поддерживает настраиваемый endpoint и локальный proxy для стабильного демо
- сгенерированный результат сохраняется локально

### 4. Mobile UX требования

- `SafeAreaView` на основных экранах
- compact-layout логика для узких экранов
- удобные touch-targets
- scroll-first компоновка вместо хрупкой фиксированной hero-верстки

## Что входит в реализацию

- Premium `Paywall` с monthly / yearly тарифами и выделенным best-value вариантом
- Главный экран `Meditations` с locked premium cards и логикой возврата на paywall
- Отдельный экран `Session` для разблокированных ритуалов с cue-by-cue prototype player
- `AI Mood of the day` с 3 moods, live generation, error states и local persistence
- `SafeAreaView` сверху/снизу, compact-screen adjustments и touch targets под mobile UX
- AsyncStorage persistence для subscription state, selected plan и последней affirmation

## Стек

- Expo SDK 55
- Expo Router
- React Native Safe Area Context
- Expo Linear Gradient
- Expo Haptics
- AsyncStorage

## Локальный запуск

```bash
npm install
```

Рекомендуемый терминал #1:

```bash
npm run ai-proxy
```

Рекомендуемый терминал #2:

```bash
npx expo start
```

Необязательный browser preview:

```bash
npx expo start --web --port 19006
```

Команды проверки:

```bash
npm run typecheck
npm run doctor
```

## AI setup

Приложение поддерживает два live-generation пути:

1. `Рекомендуется для демо:` запустить `npm run ai-proxy`
2. `Опционально:` указать свой endpoint через `EXPO_PUBLIC_AI_ENDPOINT`

### Как работает AI-маршрутизация в dev-режиме

- если задан `EXPO_PUBLIC_AI_ENDPOINT`, приложение использует его напрямую
- если Expo работает на `localhost` или LAN IP и локальный proxy поднят, приложение автоматически пробует `http://<expo-host>:8788/api/affirmation`
- иначе приложение переключается на публичный Pollinations demo endpoint

Создай `.env.local`, только если хочешь жестко указать кастомный endpoint:

```bash
EXPO_PUBLIC_AI_ENDPOINT=http://192.168.X.X:8788/api/affirmation
```

## Как протестировать на реальном телефоне

### Один Wi‑Fi (лучший вариант для записи)

1. Запусти `npm run ai-proxy`
2. Запусти `npx expo start`
3. Открой Expo Go на телефоне
4. Отсканируй QR-код из Expo-терминала
5. Приложение автоматически подхватит Expo host и попробует локальный AI proxy

Если Expo Go пишет, что версия проекта несовместима с установленным приложением, поставь актуальный Android APK напрямую с `https://expo.dev/go`. Версия из Store может отставать во время rollout Expo SDK 55.

### Если Expo discovery работает нестабильно

Можно использовать:

```bash
npx expo start --tunnel
```

Важно: tunnel помогает доставить bundle, но AI-запросу все равно нужен доступный endpoint. Для стабильного phone-demo в tunnel-режиме задай:

```bash
EXPO_PUBLIC_AI_ENDPOINT=http://<LAN_IP_ТВОЕГО_ПК>:8788/api/affirmation
```

После этого перезапусти Expo, чтобы env-переменная заново встроилась в bundle.

## Рекомендуемый сценарий phone-test

1. Открой приложение и попади на `Paywall`
2. Нажми `Continue with limited access`
3. На экране библиотеки нажми по locked premium card и проверь, что происходит возврат на paywall
4. Нажми `Try premium free for 7 days`
5. Проверь, что premium-карточки разблокировались
6. Открой разблокированный ritual и пройди cue flow
7. Вернись в библиотеку
8. Открой `AI Mood of the day`
9. Выбери настроение и сгенерируй live affirmation
10. Перезапусти приложение и проверь, что unlocked state и последняя affirmation сохранились

## Как AI справился с mobile-specific задачами

- Навигация реализована через Expo Router: `paywall -> meditations -> session`, плюс modal-style поток `affirmation`
- Все основные экраны используют `SafeAreaView` с верхней и нижней безопасной зоной
- Интерфейс переключается в compact mode при ширине ниже `360px` через `useWindowDimensions`
- Locked content защищен и на уровне карточек библиотеки, и на уровне прямых session routes
- Длинный контент построен по scroll-first принципу, а не через хрупкие фиксированные hero-layouts

## Контрольный вопрос

### «С какими проблемами мобильной верстки AI справляется хуже всего и как контролировалась его работа, чтобы приложение не ломалось на iPhone SE vs Pro Max?»

Обычно AI хуже всего справляется с:

- вертикальной плотностью на маленьких телефонах, когда маркетинговый текст, pricing-cards и CTA конкурируют за один viewport
- коллизиями с Safe Area возле выреза / home indicator
- слишком крупными заголовками, которые хорошо смотрятся на Pro Max, но ломают ритм на iPhone SE
- touch-target размерами в сжатой верстке
- маршрутной логикой вида: «locked card должна оставаться tappable, но вести на paywall, а не в premium content»

Как это контролировалось в этом прототипе:

- использовался `SafeAreaView` на каждом основном экране
- вручную проверялся узкий `320px` viewport
- добавлены compact responsive adjustments ниже `360px`
- ключевые действия оставлены в scrollable column, а не насильно впихивались above the fold
- добавлены accessibility roles / labels для тарифов, mood choices и главных CTA
- premium session routes защищены в коде, а не только визуально

## Скриншоты

### Paywall

![ZenPulse Paywall](./assets/demo/paywall.png)

### Библиотека медитаций

![ZenPulse Library](./assets/demo/library.png)

### AI mood flow

![ZenPulse AI](./assets/demo/ai.png)

### Ritual session

![ZenPulse Session](./assets/demo/session.png)

## Видеоматериалы

GitHub не поддерживает настоящий inline MP4-player прямо внутри `README.md`.  
Лучший поддерживаемый вариант — большая preview-обложка в README, по клику на которую откроется MP4 через встроенный GitHub file viewer.

### 1. Prompting и redesign-итерация (desktop)

[![Preview prompting and redesign desktop video](./assets/demo/video-previews/prompting-and-redesign-desktop.png)](./assets/demo/videos/prompting-and-redesign-desktop.mp4)

Это видео закрывает prompt-engineering часть задания:

- показан desktop workflow при работе с GitHub Copilot
- зафиксировано, как формулировалось visual direction для premium meditation UI
- показано, как AI просили исправить реальную проблему верстки и читаемости карточек
- видно, что результат AI не принимался вслепую, а доводился через корректирующий prompt

### 2. Device walkthrough — первый полный проход

[![Preview initial device flow video](./assets/demo/video-previews/device-demo-initial-flow.png)](./assets/demo/videos/device-demo-initial-flow.mp4)

Это видео показывает первый полный продуктовый сценарий:

- открытие приложения и показ `Paywall`
- переход через limited-access path
- нажатие на premium cards и возврат на paywall
- активацию simulated trial и разблокировку premium-доступа
- проверку основной subscription-логики, которая требовалась по заданию

### 3. Device walkthrough — состояние после redesign

[![Preview post redesign premium video](./assets/demo/video-previews/device-demo-post-redesign-premium.png)](./assets/demo/videos/device-demo-post-redesign-premium.mp4)

Это видео показывает приложение после visual polish pass:

- повторная проверка meditation cards после редизайна читаемости
- демонстрация улучшенной visual clarity и premium-feel
- показ состояния, где premium уже активирован
- дополнительная финальная проверка качества интерфейса

## Финальный submission checklist

- Публичный репозиторий: `https://github.com/Chumbayoumba/zenpulse-ai-meditation-app-test-task-for-job`
- README содержит setup, AI notes, phone-testing steps, Safe Area / responsive notes и ответ на контрольный вопрос
- Скриншоты находятся в `assets/demo/`
- Видео находятся в `assets/demo/videos/`
- Оставшиеся ручные артефакты для отправки: обязательный `7-12 minute screencast` и, если проверяющий просит отдельно, короткое demo-video с телефона
- Русский handoff + шаблон текста для Google Doc / письма: `SUBMISSION_HANDOFF_RU.txt`

## Screencast checklist

Для обязательной записи на `7-12 минут` покажи:

1. design direction / prompting approach
2. paywall на узком mobile viewport
3. redirect с locked-card обратно на paywall
4. simulated premium unlock
5. ritual session с cue progression
6. AI mood generation на реальном устройстве
7. короткий комментарий про Safe Area и compact-screen handling
