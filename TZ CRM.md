1. **Цели и задачи проекта**

***Цель проекта*** \- разработка единой платформы для обеспечения взаимодействия между всеми отделами компании и сторонними контрагентами, упрощения и стандартизации бизнес-процессов.  
Задачи:

- ведение учета клиентов и контрагентов, систематизация статусов по ним;  
- детальная аналитика по цифрам (выручка, информация по клиентам, партнерам, KPI и эффективность);  
- обучение партнеров и франчайзи в сфере кредитного брокериджа, взаимодействию с клиентами, повышение их личной эффективности;  
- быстрая верификация потенциальных заемщиков;  
- помощь в разработке кредитных программ для потенциальных клиентов, быстрая подача в банки с детальной обратной связью для партнеров и франчайзи;  
- управление клиентскими базами.

***Целевая аудитория*** проекта:

1. Внутренние сотрудники компании с разделением функциональных ролей и правами доступа в зависимости от выполняемых задач.  
2. Партнеры компании с доступом в личный кабинет партнера.  
3. Франчайзи с доступом в личный кабинет франчайзи и встроенной CRM-системой для обеспечения взаимодействия с потенциальными клиентами.

**2\. Функциональные требования**

**2.1. Блок “База клиентов” \-** содержит в себе список потенциальных клиентов с контактными данными, разделенные по источникам.   
Источники:

- лиды от партнеров с кредитной историей и без;  
- собственная лидогенерация компании;  
- холодная база для первичной квалификации собственным КЦ;  
- загрузка из внешних источников (справочники и профильные сайты);  
- купленные базы.  
  Возможности попадания клиентов в раздел баз:  
- создание лида партнером через ТГ бот или личный кабинет;  
- загрузка базы через excel;  
- открытое АПИ для настройки сторонних интеграций (мессенджеры, площадки, сторонние профильные сайты и справочники);  
- ручное заведение лидов сотрудниками компании.  
    
  Сегментация баз настраивается по источникам и принципам обработки:  
  \- собственная обработка через КЦ и ОП с настройкой двусторонней интеграции и обменом данными в режиме реального времени с АМО;  
  \- обработка лидов через представление организации партнера либо франчайзи);  
  \- распределение баз после отыгрыша аукциона;  
  \- перераспределение невыкупленных баз.  
  Возможные статусы лида в разделе баз:  
1. Новый лид \- заведенный контакт без обработки;  
2. Лид от партнера \- потенциальный клиент, заведенный партнером для последующей обработки сотрудниками компании.   
3. Аукцион \- лиды из внешних источников, предназначенный для продажи франчайзи компании.  
4. Не выкуплен \- оставшиеся лиды, которые не были проданы посредством аукциона. Попадают в дальнейшем в обработку ОП компании (интеграция с АМО).

	**Аналитика баз** должна настраиваться посредством конструктора отчетов, который позволит группировать любые данные, содержащиеся в лиде. Минимальный набор полей: имя, телефон, источник, дата создания, принцип обработки. Пример отчета:  
![][image1]  
Раздел баз виден и доступен только внутренним сотрудникам компании с достаточным уровнем прав доступа для работы с разделом.

**2.2. Личный кабинет партнера**  
Кабинет партнера виден и доступен зарегистрированным пользователям в качестве партнера через ТГ бот и по партнерской ссылке. Описание принципа работы ТГ ниже в соответствующем разделе.  
Интерфейс пользователя состоит из двух блоков \- общая информация, доступная для всех:

- о компании (редактируемый блок администраторами компании с общей информацией, реквизитами, анонсом мероприятий);  
- обучение (полезные статьи, видео-материалы и брокеридже, принципы расчета дохода, общие условия работы, шаблоны договоров);  
- помощь (FAQ и связь с компанией). В раздел помощи необходимо подключить открытые чаты в мессенджерах для быстрого прямого взаимодействия с партнерским отделом компании с учетом ответственного за конкретного партнера.

Второй раздел \- клиентская панель со следующими блоками:

- кабинет компании (реквизиты, ID партнера, текущий статус \- грейды);  
- лиды с формой заведения новой заявки и двусторонней интеграцией  с АМО с режиме реального времени. Лиды должны содержать и обмениваться следующей информацией: клиент, сумма запроса, текущий статус (исходя из соответствия статусов в АМО), подробный комментарий для партнера, выданная сумма;  
- аналитика по текущим лидам с конверсией в выдачу, суммой выдачи, предполагаемом доходе партнера, калькулятором расчета потенциальной прибыли исходя из текущей конверсии, механикой расчета повышения грейда (?) с напоминаниями и уведомлениями (вам надо передать еще 1000 лидов в этом месяце);  
- геймификация и обучение \- игровые механики зарабатывания дополнительных баллов для дальнейшего участия в закрытых мероприятиях, получения дополнительного обучения (с контролей домашних заданий??);  
- взаиморасчеты с компанией по выплаченной комиссии. Должен содержать дату выдачи кредита конечному клиенту, сумму выдачи, ФИО клиента (ID? контакт?), % комиссии, сумму комиссии с приложением физического акта взаиморасчетов;  
- реферальная программа. Подразумевается двухуровневая система. В разделе должны содержаться ссылки для регистрации партнеров первого и второго уровня, список зарегистрированных реферальных партнеров с текущим статусом (активен, не активен). Также при выборе реферального партнера должен раскрываться список переданных им лидов с финальными статусами (отказ, выдан).

  **2.3. Кабинет франчайзи.**

  Раздел общей информации дублирует общую информацию для партнеров.

  Панель клиента содержит следующие данные:

- карточка клиента \- реквизиты, договор;  
- обучение для франчайзи, шаблоны документов (клиентские договора, анкеты, шаблоны актов);  
- лиды (потенциальные клиенты франчайзи на выдачу кредитов) с возможностью импорта, ручного внесения, перевода лидов по выигранным аукционам из базы компании. минимальный набор статусов \- новый лид. квалифицировано, не квалифицировано;  
- встроенная CRM-система для перевода лидов из списка контактов в сделки в настроенными полями, этапами, автоматизацией (?), возможностью верификации в один клик в открытых источниках;  
- аналитика с возможностью настройки отчетов через конструктор, позволяющий группировать данные по всем данным, содержащимся в карточке сделки. Включить встроенные отчеты:  
1) всего лидов, квалифицировано, выдано, сумма, конверсии;  
2) отчет по причинам отказа;  
3) отчет по выдачам в разрезе банков, суммой, источником клиента, типу клиента.  
- взаиморасчеты по комиссиям с компанией. Раздел должен включать дату выдачи кредита клиенту, сумму выдачи, наименование банка, сумму комиссии (зависит от банка), дату выплаты комиссии. необходимо предусмотреть автоматической формирование акта взаиморасчетов по периодам;  
- панель управления сотрудниками франчайзи с возможностью добавлять разные роли с отличным функционалом (квалификаторы, менеджеры, фин. отдел).  
    
  ***Основная схема взаимодействия*** франчайзи с брокерами компании.  
  Квалификация потенциальных клиентов и заключение договоров происходит на стороне франчайзи лично либо с привлечением собственных сотрудников во встроенной в платформу CRM-системе. Заключенные договора появляются в отдельной панели администраторов компании и у сотрудников, имеющих к ним доступ исходя из настройки прав. Взаимодействие с брокерами происходит по этапной схеме:  
- написать план подач по банкам (франчайзи);  
- согласовать план подач (брокер);  
- отметка франчайзи  о последовательности подачи заявки банкам с возможность предварительного изучения информации о вероятности выдачи, комиссии и прочим условиям подачи. При активации кнопки подачи, происходит прямое взаимодействие  через встроенный чат или чат в мессенджерах с брокером;  
- франчайзи в режиме реального времени получает отметку в карточке сделки об одобрении/не одобрении, сумме выдачи, получает самостоятельно от клиента комиссионное вознаграждение.

**Дополнительные требования к функционалу и интеграциям:**

1. Подключение платежного сервиса для обеспечения взаиморасчетов между партнерами и компанией, франчайзи и компанией внутри платформы.  
2. Интеграция способов коммуникации внутри платформы для всех пользователей \- телефония, мессенджеры, площадки, сайты.  
3. Подключение сервисов верификации (Спарк, Госуслуги, справочники и тд).  
4. Возможность дорабатывать встроенную CRM под запросы конкретного пользователя (этапы, интеграции, поля, аналитика) не затрагиваю общую преднастроенную воронку.   
5. Административная панель банков с гибкой настройкой комиссий, условий, договорами, подрядчиками.   
6. Гибкая настройка ролей и доступов внутренних сотрудников компании.   
7. Настройка отчетов эффективности, выполнения KPI внутренними сотрудниками исходя из выполняемого функционала (например, у брокеров по суммам выдачи, конверсии, заработанной комиссии, итогам подач, у КЦ количество квалифицированных лидов и тд).  
8. Неограниченное число пользователей системы.  
9. Настройка сводной аналитики по компании:  
- количество/эффективность партнеров, франчайзи;  
- окупаемость инвестиций, финансовые показатели;  
- БДР.  
10.  Адаптивный дизайн для различных устройств.  
    

    

    

**ТЗ на ТГ бота (должен быть реализован через сервис микроприложений в ТГ)**

**Первичные пожелания по ЛК:**

- **Раздел статистика:**

Поля:

- Телефон  
- Имя клиента   
- Фамилия клиента   
- Дата создания   
- Статус (взятый из АМО)   
- Комментарий для партнера   
- Если заявка в отказе, то “Причина отказа”  
- С 11Сумма одобрения” и “Бонус партнера” 

Изменение статусов, исходя из названии в AMO:  
Воронка продаж:

| Выявить потребность и стадии до этой стадии | Получить кредитную историю | Согласовать клиента с брокером | Согласовать договор и получить согласие на работу | Получить подписанный договор | Заявка брокеру передана (успех) |
| ----- | ----- | ----- | ----- | ----- | ----- |
| Заявка в работу получена | С клиентом созвонились, ждем кредитную историю | Кредитная история получена, оцениваем шансы на кредитование | Шансы на кредитование есть, ждем от клиента согласие на работу | Согласие на работу получено, комиссия согласована, ждем подписанный договор | Договор подписан, готовим план подач в банки |

Воронка брокеров:  
**НОВЫЙ КЛИЕНТ**  
Договор подписан, готовим план подач в банки

**ВЗЯТО В РАБОТУ**

**ПОДГОТОВЛЕН ПЛАН ПОДАЧ**

Брокер на связи с клиентом, согласован план действий

**ПРОЦЕСС ПОДАЧ В БАНКИ**

Заявка направлена в банк/банки, ждем ответ

**КРЕДИТ ОДОБРЕН**

**ВЫДАЧА КРЕДИТА СОГЛАСОВАНА**  
**КРЕДИТ ВЫДАН**

Последние 3 этапа оставить, как в AMO 

**ОТПРАВЛЕН ЗАПРОС НА ПОЛУЧЕНИЕ ДС**

Кредит выдан

**КОМИССИЯ ПОЛУЧЕНА**

Так и оставить

- При возникновении статуса “Комиссия получена”, кнопка “Получить партнерское вознаграждение”. Задача улетает в воронку Партнеры на Анастасию в карточке сделки по партнеру 

“Кнопка(подраздел) Обратная связь. При клике на кнопку ОБратная связь ввести номер телефона клиента по Сделке которого хотелось бы получить обратную связь. Менеджеру в Сделку по клиенту направляется запрос Обратная связь по клиенту. Менеджер с помощью “\!” в Сделки клиента в поле Примечание/Комментарий пишет статус по клиенту, сообщение отправляется партнеру на ватсапп и в окошко Ответ в ЛК партнера. Пример: Запрос: Обратная связь по клиенту \+7903 544 66 77 Ответ: Анкета по клиенту подана в банк.Ожидаем решения к 20 мая” 

Вместо вот этот решения, прикрутить к сайту виджет для общения с возможностью выбора: чат тут на сайте, вотсап или тг”. Т.е. виджет появляется при нажатии на кнопку “Получить дополнительную информацию” и партнер выбирает как ему удобнее связаться. 

Исходя из того, за кем в AMO закреплен партнер (в воронке партнеров в AMO поле “менеджер”) на того и падает вопрос партнера.

После таблицы по каждому клиенту, сводится статистика, как это сделано в тг боте, типо на этапе “кредит выдан” 5 клиентов, на этапе “Заявка в работу получена” 8 и т.п. 

И также после таблицы сводка по “Предполагаемому бонусу партнеру” (сумма всех предлагаемых бонусов” 

- **Раздел “Создать заявку”** 

3 кнопки:  
“ Кредит на физическое лицо” (Потребительский кредит, рефинансирование кредитов, кредит под залог, кредит на покупку авто)  
“ Кредит для бизнеса” (Пополнение оборотных средств, возобновляемая кредитная линия, овердрафт, кредит на покупку недвижимости, лизинг, кредит на исполнение контракта, банковская гарантия, факторинг)      
“Ипотека” 

Раздел “Создать заявку”

- Телефон (обязательное поле)  
- Имя клиента (обязательное поле)  
- Фамилия клиента  (не обязательное поле)  
- Комментарий (необязательное поле)  
- Комиссия с клиентом согласована? (обязательное поле)  
  Если “ДА”, то “Назовите сумму комиссии”  
  Если “НЕТ”, то пометка “Стандартная комиссия компании 15%, из которых 3% партнеру, данную комиссию отдел продаж согласует с клиентом самостоятельно”

Кнопка “Отправить заявку”  
Кнопка “Уточнить детали по заявке” 

При нажатии кнопки “отправить заявку” она улетает в AMO  
При нажатии кнопки “уточнить детали по заявке” она тоже улетает в AMO и вылезает следующее окно для заполнения 

При нажатии кнопок также происходит проверка на дубли, если найден дубль, то партнеру высвечивается “Клиент с данным номером телефона уже зарегистрирован, с Вами свяжется менеджер” \- и информация улетает также на закрепленного менеджера, который связывается с партнером и разбираются с заявкой 

Поля для уточнения деталей:   
ИП/ООО:

| 1\. Кредит нужен на ИП или ООО? (выбор ИП или ООО) |
| :---- |
| 2\. Какая необходима сумма?  3\. На на какие цели необходим кредит?  |
| 4\. Есть ли текущие просрочки? Долги по судам/ФССП/налоги? |
| 5\. Как давно открыто ИП или ООО? |
| 6\. Есть ли залог? |
| 7\. Какая выручка за 2023год? 8\. Какая чистая прибыль за 2023 год? |
| 8\. Есть ли текущая кредитная нагрузка? |
| 9\. Подавали ли самостоятельно заявки за последние 3 месяца, если да, то где были отказы? |
| 10\. ИНН компании |
| 11\. Прикрепить КИ (документ в пдф) (Возможность прикрепить несколько документов) |
| 12\. Работал ли ранее с другими брокерами и какой был результат? |
| 13\. Насколько срочно нужны деньги? |

Все поля не обязательные, партнер сам выбирает что заполнять

Физ лица:

| 1 Какая необходима сумма? |
| :---- |
| 3\. На на какие цели необходим кредит? |
| 3 Сколько клиенту полных лет? |
| 4 Было ли банкротство у клиента или кредитные каникулы ранее? |
| 5 Куда ранее обращались банки/брокеры и какой был результат? |
| 6 Сумма официального дохода?  |
| 7 Сумма неофициального дохода? |
| 8 Есть ли залог? (авто, квартира) 9 Прикрепить кредитную историю  |

Ипотека 

| 1 Какая необходима сумма? |
| :---- |
| 2 какой первоначальный взнос есть сейчас? |
| 3 Сколько клиенту полных лет? 4 Продавец физ лицо или застройщик? 5 Состоите ли в браке? 6 Есть ли дети?  7 Есть ли ИП или ООО? |
| 4 Было ли банкротство у клиента или кредитные каникулы ранее? |
| 5 Куда ранее обращались банки/брокеры и какой был результат? |
| 6 Сумма официального дохода?  |
| 7 Сумма неофициального дохода? |
| 8 Есть ли залог? (авто, квартира) 9 Прикрепить кредитную историю  |

Во всех разделах “Комментарий” (свободное поле, чтобы люди туда писали что хотят) и во всех разделах “Прикрепить дополнительные документы”

Далее кнопка “Отправить заявку”

Уточнения к ТЗ на бота  
**При нажатии кнопки “Создать заявку” :**

\- Введите номер телефона клиента в формате \+7ХХХХХХХХХХ

- Напишите, пожалуйста, имя клиента и фамилию (если знаете)  
- Напишите запрос клиента: какая сумма необходима, какие цели кредитования   
- Какую комиссию Вы согласовали с клиентом или желаете, чтобы согласовали мы? (Стандартная комиссия 12%)  
- Напишите ИНН клиента, если это ООО  
- Можем ли мы говорить клиенту, что получили контакт от Вас?  
- Дополнительный комментарий  
- Прикрепить кредитную историю

**Регистрация партнера в боте:**

- Номер телефона   
- Укажите Ваше имя (без фамилии)  
- Укажите Вашу Фамилию   
- (УБРАТЬ НАЗВАНИЕ ВАШЕЙ ОРГАНИЗАЦАИИ)  
- Укажите город, в котором проживаете (так мы сможем звать Вас на мероприятия для наших партнеров в Вашем городе)  
- Укажите нишу, в которой Вы работаете 

**ИНТЕГРАЦИИ:**

- По “Создать заявку” всё, кроме имени, фамилии и номера клиента падает комментарием и потом продажник это разбирает по карточке сделки   
- В поле Агент в воронке Продаж тянется ИМЯ и Фамилия партнера   
- “Статистика”: по мимо интеграции с этапами воронки прошу сделать интеграцию с полем “Комментарий для партнера”. Выглядеть должно так:

\- Новая заявка: 1  
        79871126633  
Договор на ознакомление отправлен  
       89547586958  
Комиссия с клиентом согласована, договор на подписании  

и т.п. комментарий по каждому клиенту 

**Пожелания:**

- Убрать раздел “Дополнить заявку” он бесполезен. Вместо него сделать раздел “Обучение для партнеров” и зашить в бота обучение   
- Добавить в бота маркетинговые штуки, рассылки и пр. Насколько возможно? 

[image1]: <data:image/png;base64,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>