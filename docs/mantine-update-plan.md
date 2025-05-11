# План обновления Mantine с версии 6.x до 7.x

## Текущая ситуация
- Сейчас используется Mantine 6.0.x
- Компоненты используются во многих частях приложения
- Некоторые зависимые библиотеки также нужно обновить

## Шаги обновления

### 1. Обновление пакетов
```bash
# Обновить все пакеты Mantine до последней версии 7.x
npm install @mantine/core@latest @mantine/hooks@latest @mantine/form@latest @mantine/dates@latest @mantine/notifications@latest @mantine/modals@latest

# Установить необходимые зависимости для Mantine 7
npm install @mantine/styles@latest @mantine/colors@latest postcss postcss-preset-mantine
```

### 2. Обновление конфигурации
- Добавить postcss.config.js для поддержки стилей Mantine 7
- Обновить _app.tsx для использования нового API провайдеров Mantine

### 3. Обновление компонентов
- Обновить импорты (некоторые компоненты были перемещены)
- Обновить API компонентов (некоторые пропсы были переименованы)
- Обновить стили (Mantine 7 использует CSS переменные вместо тем)

### 4. Тестирование
- Проверить все страницы и компоненты
- Исправить возможные ошибки

## Список файлов для обновления

### Провайдеры и конфигурация
1. `components/providers/ClientProviders.tsx` - обновление MantineProvider и ColorSchemeProvider
2. `app/layout.tsx` - добавление новых стилей и мета-тегов

### Компоненты макета
3. `components/Layout/AppLayout.tsx` - обновление AppShell и useMantineTheme
4. `components/Layout/Header.tsx` - обновление компонентов и стилей
5. `components/Layout/Navbar.tsx` - обновление компонентов и стилей
6. `app/(dashboard)/layout.tsx` - обновление компонентов и стилей

### Формы и компоненты аутентификации
7. `components/forms/LoginForm.tsx` - обновление useForm и компонентов формы
8. `components/forms/RegisterForm.tsx` - обновление useForm и компонентов формы
9. `components/providers/AuthProvider.tsx` - обновление Center и Loader
10. `app/(auth)/login/page.tsx` - обновление компонентов страницы
11. `app/(auth)/register/page.tsx` - обновление компонентов страницы

### Компоненты для работы с контактами
12. `components/Contacts/ContactForm.tsx` - обновление компонентов формы
13. `app/(dashboard)/contacts/page.tsx` - обновление компонентов страницы
14. `app/(dashboard)/contacts/[id]/page.tsx` - обновление компонентов страницы
15. `app/(dashboard)/contacts/[id]/edit/page.tsx` - обновление компонентов страницы
16. `app/(dashboard)/contacts/new/page.tsx` - обновление компонентов страницы

### Компоненты для работы со сделками
17. `components/Deals/DealCard.tsx` - обновление компонентов карточки
18. `components/Deals/DealForm.tsx` - обновление useForm и компонентов формы
19. `components/Deals/DealsKanbanBoard.tsx` - обновление компонентов канбан-доски
20. `components/Deals/KanbanColumn.tsx` - обновление компонентов колонки
21. `app/(dashboard)/deals/page.tsx` - обновление компонентов страницы
22. `app/(dashboard)/deals/[id]/page.tsx` - обновление компонентов страницы и modals
23. `app/(dashboard)/deals/[id]/edit/page.tsx` - обновление компонентов страницы
24. `app/(dashboard)/deals/new/page.tsx` - обновление компонентов страницы

### Прочие страницы
25. `app/page.tsx` - обновление компонентов главной страницы
26. `app/(dashboard)/dashboard/page.tsx` - обновление компонентов дашборда

## Основные изменения в API

### MantineProvider
```tsx
// Было
<MantineProvider theme={{ colorScheme: 'dark' }}>
  <App />
</MantineProvider>

// Стало
<MantineProvider defaultColorScheme="dark">
  <App />
</MantineProvider>
```

### Компоненты
- `position` → `justify` в компоненте Group
- `withBorder` → `border` в некоторых компонентах
- `size` имеет другие значения в некоторых компонентах (xs, sm, md, lg, xl)
- `variant` имеет другие значения в некоторых компонентах
- `leftIcon` → `leftSection` и `rightIcon` → `rightSection` в Button и других компонентах
- `sx` не поддерживается, используйте `className` и CSS модули

### Стили
- Вместо `createStyles` используйте CSS модули
- Для темного режима используйте `light-dark()` функцию или `@mixin dark`
- Вместо `theme.colors.X[Y]` используйте CSS переменные `var(--mantine-color-X-Y)`

## Ссылки
- [Официальное руководство по миграции](https://mantine.dev/guides/6x-to-7x/)
- [Документация Mantine 7](https://mantine.dev/)
