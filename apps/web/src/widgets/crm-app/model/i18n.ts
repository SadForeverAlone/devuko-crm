import type { CrmLang } from "./types";

export type UserRoleCode = "admin" | "manager" | "support" | "user" | "system";

export type CrmCopy = {
  workspace: string;
  sections: string;
  language: string;
  logout: string;
  hello: string;
  dashboardTitle: string;
  dashboardSubtitle: string;
  users: string;
  promises: string;
  proofs: string;
  engagement: string;
  engagementHint: string;
  activeBase: string;
  active: string;
  systemTime: string;
  live: string;
  segmentation: string;
  countries: string;
  registrations: string;
  logsByRole: string;
  contactRequests: string;
  logs: string;
  rowsLimit: string;
  rowsPerPage: string;
  logDateFrom: string;
  logDateTo: string;
  logsEmpty: string;
  tasks: string;
  backToUsers: string;
  backToPromises: string;
  backToTasks: string;
  addUser: string;
  newUserTitle: string;
  newUserSubtitle: string;
  saveUser: string;
  createUser: string;
  userSavedToast: string;
  userCreatedToast: string;
  userSaveValidationPassword: string;
  userSaveValidationFields: string;
  userSaveValidationLogin: string;
  userSaveValidationEmail: string;
  userSaveValidationCountry: string;
  userSaveValidationName: string;
  userSearchPlaceholder: string;
  orderAscDesc: string;
  tableIndex: string;
  tableName: string;
  tableLogin: string;
  tableEmail: string;
  tableRole: string;
  tableCountry: string;
  tableCreated: string;
  sortCreated: string;
  sortLogin: string;
  sortEmail: string;
  sortName: string;
  fieldLogin: string;
  fieldEmail: string;
  fieldName: string;
  fieldSurname: string;
  fieldLastname: string;
  fieldRole: string;
  fieldCountry: string;
  fieldAvatarUrl: string;
  fieldAdminNote: string;
  fieldPassword: string;
  fieldPasswordHint: string;
  fieldPasswordCreateHint: string;
  roleUser: string;
  roleAdmin: string;
  userRoles: Record<UserRoleCode, string>;
  logRoleFilterAll: string;
  logRoleFilterAdmin: string;
  logRoleFilterManager: string;
  logRoleFilterSupport: string;
  logRoleFilterUser: string;
  logRoleFilterSystem: string;
  logActionAll: string;
  logsSubtitle: string;
  siteLogsSearch: string;
  logColTime: string;
  logColRole: string;
  logColActor: string;
  logColAction: string;
  logColPath: string;
  logColResult: string;
  promisesTableTitle: string;
  promisesTableHint: string;
  promiseColId: string;
  promiseColTitle: string;
  promiseColOwner: string;
  promiseColStatus: string;
  promiseColProofs: string;
  promiseColDeadline: string;
  promiseDetailCategory: string;
  promiseDetailOwner: string;
  promiseDetailStatus: string;
  promiseDetailProofs: string;
  promiseDetailPledge: string;
  promiseDetailCreated: string;
  promiseDetailUpdated: string;
  promiseDetailUserEmail: string;
  tasksTableHint: string;
  taskColId: string;
  taskColTitle: string;
  taskColDescription: string;
  taskColStatus: string;
  taskColCreated: string;
  taskDetailOwner: string;
  crmLoginTitle: string;
  crmLoginSubtitle: string;
  crmLoginStepCredentials: string;
  crmLoginStepCode: string;
  crmLoginFieldEmail: string;
  crmLoginPlaceholderEmail: string;
  crmLoginFieldPassword: string;
  crmLoginPlaceholderPassword: string;
  crmLoginFieldCode: string;
  crmLoginContinue: string;
  crmLoginSending: string;
  crmLoginVerify: string;
  crmLoginBack: string;
  crmLoginCodeHint: string;
  crmLoginOtpSentToast: string;
  crmLoginCredentialsRequired: string;
  crmLoginError: string;
  crmLoginCodeInvalid: string;
  crmLoginCodeError: string;
  crmLoginOtpSendError: string;
  crmLoginOtpCooldown: string;
  logStatusNoCode: string;
  logStatusError: string;
  logStatusClientError: string;
  logStatusOk: string;
  logSystemEvent: string;
  logSystemPath: string;
  filterReset: string;
  proofStateAdded: string;
  proofStatePending: string;
  dashboardBack: string;
  proofsPendingReview: string;
  segmentationAllUsers: string;
  contactsTitle: string;
  contactsSubtitle: string;
  contactsSearchPlaceholder: string;
  contactsColName: string;
  contactsColEmail: string;
  contactsColMessage: string;
  contactsColStatus: string;
  contactsColDate: string;
  contactsBack: string;
  contactsEmpty: string;
  contactsEmptyHint: string;
  contactsStatTotal: string;
  contactsStatNew: string;
  settingsTitle: string;
  settingsSubtitle: string;
  settingsCompactHint: string;
  settingsSave: string;
  settingsSeoTitle: string;
  filesTitle: string;
  filesSubtitle: string;
  filesColId: string;
  filesColTitle: string;
  filesColType: string;
  filesColOwner: string;
  filesColUpdated: string;
  filesColStatus: string;
  pagesTitle: string;
  pagesSubtitle: string;
  pagesColHash: string;
  pagesColPage: string;
  pagesColViews: string;
  pagesColUnique: string;
  pagesColConversion: string;
  pagesSearchPlaceholder: string;
  pagesEmpty: string;
  pagesEmptyHint: string;
  pagesStatViews: string;
  pagesStatUnique: string;
  pagesStatTop: string;
  reportsTitle: string;
  reportsSubtitle: string;
  reportsColId: string;
  reportsColTitle: string;
  reportsColSeverity: string;
  reportsColChannel: string;
  reportsColStatus: string;
  reportsColCreated: string;
  callTrackerTitle: string;
  callTrackerSubtitle: string;
  callTrackerColId: string;
  callTrackerColManager: string;
  callTrackerColQueue: string;
  callTrackerColHandled: string;
  callTrackerColMissed: string;
  callTrackerColAvg: string;
  callTrackerColStatus: string;
  sidebarUsedSpace: string;
  sidebarLastEvent: string;
  sidebarNoAuditActivity: string;
  userAvatarHint: string;
  userAvatarTooLarge: string;
  userAvatarNotImage: string;
  genderMale: string;
  genderFemale: string;
  genderNotSpecified: string;
  platformWorkspaceLabel: string;
  workspaceSwitch: string;
  sitesTitle: string;
  sitesSubtitle: string;
  sitesCreateTitle: string;
  sitesCreateSubmit: string;
  sitesColDomain: string;
  sitesColStatus: string;
  sitesColWorkspace: string;
  sitesColPorts: string;
  sitesColCreated: string;
  sitesFieldDomain: string;
  sitesFieldRepo: string;
  sitesFieldApiPort: string;
  sitesFieldWebPort: string;
  sitesFieldExtraDomains: string;
  sitesProvision: string;
  sitesCreatedToast: string;
  sitesProvisionToast: string;
  sitesValidationDomain: string;
  sitesStatusActive: string;
  sitesStatusPending: string;
  sitesStatusProvisioning: string;
  sitesStatusError: string;
  platformDashboardTitle: string;
  platformDashboardSubtitle: string;
  platformSitesPreviewTitle: string;
  platformSitesPreviewHint: string;
  platformManageSites: string;
  sitesEmpty: string;
  sitesCancelCreate: string;
  sitesStatTotal: string;
  sitesStatPending: string;
  sitesOpenWorkspace: string;
  platformLogsTitle: string;
  platformLogsSubtitle: string;
  platformLogsColTime: string;
  platformLogsColActor: string;
  platformLogsColAction: string;
  platformLogsColTarget: string;
  platformLogsColDetail: string;
  platformLogsColResult: string;
  platformLogsOk: string;
  platformLogsFail: string;
  platformLogsSearch: string;
  paginationPrev: string;
  paginationNext: string;
  sitesProvisionColStep: string;
  sitesProvisionColMessage: string;
  sitesProvisionColTime: string;
  sidebarSignedInAs: string;
  sitesEdit: string;
  sitesDelete: string;
  sitesDeleteConfirm: string;
  sitesUpdatedToast: string;
  sitesDeletedToast: string;
  sitesProvisionLog: string;
  sitesSave: string;
  platformUsersTitle: string;
  platformUsersSubtitle: string;
  platformAdminAdd: string;
  platformAdminCreateTitle: string;
  platformAdminCreateSubtitle: string;
  platformAdminEditTitle: string;
  platformAdminEditSubtitle: string;
  platformAdminBack: string;
  platformAdminSearchPlaceholder: string;
  platformAdminCreatedToast: string;
  platformAdminSavedToast: string;
  platformAdminDelete: string;
  platformAdminDeleteConfirm: string;
  platformAdminDeletedToast: string;
  platformAdminDeleteSelfBlocked: string;
  platformAdminDeleteLastBlocked: string;
  platformAdminFormTitle: string;
  platformAdminLoginHistoryTitle: string;
  platformAdminLoginHistorySubtitle: string;
  platformAdminLoginHistoryEmpty: string;
  platformAdminLoginHistoryColTime: string;
  platformAdminLoginHistoryColEvent: string;
  platformAdminLoginHistoryColDetail: string;
  platformAdminLoginHistoryColResult: string;
  platformAdminLoginHistorySuccess: string;
  platformAdminLoginHistoryFailed: string;
  platformAdminStatLogins: string;
  platformAdminStatFailed: string;
  platformAdminStatLastLogin: string;
  platformAdminStatLastFailed: string;
  platformAdminStatusOnline: string;
  platformAdminStatusOffline: string;
  platformAdminLastSeen: string;
  platformStorageRoot: string;
  platformSettingsTitle: string;
  platformSettingsSubtitle: string;
  platformServerInfoTitle: string;
  platformServerDisk: string;
  platformServerUsage: string;
  platformServerTime: string;
  platformServerSites: string;
  workspaceMenuPlatform: string;
  workspaceMenuSites: string;
};

export const crmCopy: Record<CrmLang, CrmCopy> = {
  ru: {
    workspace: "WORKSPACE",
    sections: "РАЗДЕЛЫ",
    language: "ЯЗЫК",
    logout: "Выйти",
    hello: "Здравствуйте,",
    dashboardTitle: "Панель CRM",
    dashboardSubtitle: "Управление платформой, пользователями и обращениями",
    users: "Пользователи",
    promises: "Обещания",
    proofs: "Доказательства",
    engagement: "вовлечённость",
    engagementHint: "Активность обращений пользователей",
    activeBase: "Активная база",
    active: "активно",
    systemTime: "Системное время",
    live: "Сейчас",
    segmentation: "Сегментация",
    countries: "Страны",
    registrations: "Регистрации",
    logsByRole: "Логи по ролям",
    contactRequests: "Обращения",
    logs: "Журнал событий",
    rowsLimit: "Лимит строк",
    rowsPerPage: "Строк на странице",
    logDateFrom: "С даты",
    logDateTo: "По дату",
    logsEmpty: "Записей не найдено",
    tasks: "Задачи",
    backToUsers: "Назад к пользователям",
    backToPromises: "Назад к обещаниям",
    backToTasks: "Назад к задачам",
    addUser: "Добавить пользователя",
    newUserTitle: "Новый пользователь",
    newUserSubtitle: "Заполните поля и сохраните, чтобы создать учётную запись",
    saveUser: "Сохранить",
    createUser: "Создать пользователя",
    userSavedToast: "Пользователь сохранён",
    userCreatedToast: "Пользователь создан",
    userSaveValidationPassword: "Пароль: минимум 8 символов, буквы и цифры",
    userSaveValidationFields: "Заполните логин и email",
    userSaveValidationLogin: "Логин: 3-32 символа, только буквы/цифры и ._-",
    userSaveValidationEmail: "Некорректный формат email",
    userSaveValidationCountry: "Слишком короткое название страны",
    userSaveValidationName: "Поля имени должны содержать буквы и минимум 2 символа",
    userSearchPlaceholder: "Поиск по имени, email, логину, стране",
    orderAscDesc: "Порядок",
    tableIndex: "#",
    tableName: "Имя",
    tableLogin: "Логин",
    tableEmail: "Email",
    tableRole: "Роль",
    tableCountry: "Страна",
    tableCreated: "Создан",
    sortCreated: "Дата",
    sortLogin: "Логин",
    sortEmail: "Email",
    sortName: "Имя",
    fieldLogin: "Логин",
    fieldEmail: "Email",
    fieldName: "Имя",
    fieldSurname: "Фамилия",
    fieldLastname: "Отчество",
    fieldRole: "Роль",
    fieldCountry: "Страна",
    fieldAvatarUrl: "URL аватара",
    fieldAdminNote: "Заметка администратора",
    fieldPassword: "Пароль",
    fieldPasswordHint: "Оставьте пустым, если не меняете. Минимум 6 символов.",
    fieldPasswordCreateHint: "Минимум 6 символов.",
    roleUser: "Обычный пользователь",
    roleAdmin: "Админ",
    userRoles: {
      admin: "Админ",
      manager: "Менеджер",
      support: "Техподдержка",
      user: "Пользователь",
      system: "Система",
    },
    logRoleFilterAll: "Все роли",
    logRoleFilterAdmin: "Админы",
    logRoleFilterManager: "Менеджеры",
    logRoleFilterSupport: "Техподдержка",
    logRoleFilterUser: "Пользователи",
    logRoleFilterSystem: "Система",
    logActionAll: "Все действия",
    logsSubtitle: "Журнал действий на сайте",
    siteLogsSearch: "Поиск по пользователю, действию, пути…",
    logColTime: "Время",
    logColRole: "Роль",
    logColActor: "Кто",
    logColAction: "Что произошло",
    logColPath: "Где",
    logColResult: "Результат",
    promisesTableTitle: "Обещания",
    promisesTableHint: "Нажмите на строку, чтобы открыть карточку",
    promiseColId: "ID",
    promiseColTitle: "Название",
    promiseColOwner: "Владелец",
    promiseColStatus: "Статус",
    promiseColProofs: "Доказательства",
    promiseColDeadline: "Дедлайн",
    promiseDetailCategory: "Категория",
    promiseDetailOwner: "Владелец",
    promiseDetailStatus: "Статус",
    promiseDetailProofs: "Доказательства",
    promiseDetailPledge: "Залог",
    promiseDetailCreated: "Создано",
    promiseDetailUpdated: "Обновлено",
    promiseDetailUserEmail: "Email пользователя",
    tasksTableHint: "Нажмите на строку, чтобы открыть карточку",
    taskColId: "ID",
    taskColTitle: "Название",
    taskColDescription: "Описание",
    taskColStatus: "Статус",
    taskColCreated: "Создана",
    taskDetailOwner: "Ответственный",
    crmLoginTitle: "Devuko CRM",
    crmLoginSubtitle: "Вход: email и пароль, затем код подтверждения на почту",
    crmLoginStepCredentials: "Вход",
    crmLoginStepCode: "Код",
    crmLoginFieldEmail: "Email",
    crmLoginPlaceholderEmail: "admin@devuko.ru",
    crmLoginFieldPassword: "Пароль",
    crmLoginPlaceholderPassword: "Пароль",
    crmLoginFieldCode: "Код из письма",
    crmLoginContinue: "Продолжить",
    crmLoginSending: "Отправка…",
    crmLoginVerify: "Войти",
    crmLoginBack: "Назад",
    crmLoginCodeHint: "Код отправлен на {email}. Введите 6 цифр — он действует 10 минут.",
    crmLoginOtpSentToast: "Код отправлен на {email}",
    crmLoginCredentialsRequired: "Укажите email и пароль.",
    crmLoginError: "Неверный email или пароль.",
    crmLoginCodeInvalid: "Введите 6-значный код.",
    crmLoginCodeError: "Неверный или просроченный код.",
    crmLoginOtpSendError: "Не удалось отправить код. Попробуйте снова.",
    crmLoginOtpCooldown: "Подождите минуту перед повторной отправкой.",
    logStatusNoCode: "Без кода",
    logStatusError: "Ошибка",
    logStatusClientError: "Отклонено",
    logStatusOk: "Успешно",
    logSystemEvent: "Системное событие",
    logSystemPath: "Системная операция",
    filterReset: "Сбросить",
    proofStateAdded: "Доказательства добавлены",
    proofStatePending: "Ожидаются доказательства",
    dashboardBack: "Назад к панели",
    proofsPendingReview: "На проверке",
    segmentationAllUsers: "Все пользователи",
    contactsTitle: "Обращения (Contact Us)",
    contactsSubtitle: "Сообщения с основного сайта",
    contactsSearchPlaceholder: "Поиск по имени, email, тексту",
    contactsColName: "Имя",
    contactsColEmail: "Email",
    contactsColMessage: "Сообщение",
    contactsColStatus: "Статус",
    contactsColDate: "Дата",
    contactsBack: "К обращениям",
    contactsEmpty: "Обращений пока нет",
    contactsEmptyHint: "Сообщения с формы Contact Us появятся здесь",
    contactsStatTotal: "Всего обращений",
    contactsStatNew: "Новые",
    settingsTitle: "Настройки",
    settingsSubtitle: "Значения для сайта и поддержки",
    settingsCompactHint: "Переключатели — визуальный макет. Сохранение записывает поддержку и SEO.",
    settingsSave: "Сохранить настройки",
    settingsSeoTitle: "Настройки SEO",
    filesTitle: "Файлы",
    filesSubtitle: "Справочный список (демо)",
    filesColId: "ID",
    filesColTitle: "Название",
    filesColType: "Тип",
    filesColOwner: "Владелец",
    filesColUpdated: "Обновлено",
    filesColStatus: "Статус",
    pagesTitle: "Страницы",
    pagesSubtitle: "Просмотры по страницам сайта",
    pagesColHash: "#",
    pagesColPage: "Страница",
    pagesColViews: "Просмотры",
    pagesColUnique: "Уникальные",
    pagesColConversion: "Конверсия",
    pagesSearchPlaceholder: "Поиск по пути страницы",
    pagesEmpty: "Нет данных по страницам",
    pagesEmptyHint: "Статистика появится после первых визитов на сайт",
    pagesStatViews: "Всего просмотров",
    pagesStatUnique: "Уникальные визиты",
    pagesStatTop: "Топ страница",
    reportsTitle: "Отчёты",
    reportsSubtitle: "Обращения об ошибках с сайта",
    reportsColId: "ID",
    reportsColTitle: "Заголовок",
    reportsColSeverity: "Важность",
    reportsColChannel: "Канал",
    reportsColStatus: "Статус",
    reportsColCreated: "Создано",
    callTrackerTitle: "Звонки",
    callTrackerSubtitle: "Очереди и метрики (демо)",
    callTrackerColId: "ID",
    callTrackerColManager: "Менеджер",
    callTrackerColQueue: "Очередь",
    callTrackerColHandled: "Принято",
    callTrackerColMissed: "Пропущено",
    callTrackerColAvg: "Среднее время",
    callTrackerColStatus: "Статус",
    sidebarUsedSpace: "Использовано места",
    sidebarLastEvent: "Активность",
    sidebarNoAuditActivity: "Нет записей в журнале",
    userAvatarHint: "Нажмите, чтобы выбрать фото",
    userAvatarTooLarge: "Изображение слишком большое после сжатия — укажите URL или выберите другой файл",
    userAvatarNotImage: "Нужен файл изображения (JPG, PNG…)",
    genderMale: "Мужчины",
    genderFemale: "Женщины",
    genderNotSpecified: "Не указано",
    platformWorkspaceLabel: "Devuko",
    workspaceSwitch: "Переключить workspace",
    sitesTitle: "Сайты",
    sitesSubtitle: "Управление сайтами на сервере и их workspace",
    sitesCreateTitle: "Новый сайт",
    sitesCreateSubmit: "Создать и настроить",
    sitesColDomain: "Домен",
    sitesColStatus: "Статус",
    sitesColWorkspace: "Workspace",
    sitesColPorts: "Порты API/Web",
    sitesColCreated: "Создан",
    sitesFieldDomain: "Домен",
    sitesFieldRepo: "Git репозиторий",
    sitesFieldApiPort: "API порт (prod)",
    sitesFieldWebPort: "Web порт (prod)",
    sitesFieldExtraDomains: "Доп. домены (через запятую)",
    sitesProvision: "Повторить настройку",
    sitesCreatedToast: "Сайт создан, workspace настроен",
    sitesProvisionToast: "Настройка сайта запущена",
    sitesValidationDomain: "Укажите корректный домен (example.com)",
    sitesStatusActive: "Активен",
    sitesStatusPending: "Ожидает",
    sitesStatusProvisioning: "Настраивается",
    sitesStatusError: "Ошибка",
    platformDashboardTitle: "Панель Devuko",
    platformDashboardSubtitle: "Обзор платформы, сайтов и ресурсов сервера",
    platformSitesPreviewTitle: "Сайты на сервере",
    platformSitesPreviewHint: "Переключитесь в workspace сайта для управления пользователями и CRM",
    platformManageSites: "Все сайты",
    sitesEmpty: "Сайтов пока нет. Создайте первый — для него будет настроен отдельный workspace.",
    sitesCancelCreate: "Отмена",
    sitesStatTotal: "Всего сайтов",
    sitesStatPending: "Не активны",
    sitesOpenWorkspace: "Открыть CRM",
    platformLogsTitle: "Журнал платформы",
    platformLogsSubtitle: "Входы, операторы и действия с сайтами",
    platformLogsColTime: "Время",
    platformLogsColActor: "Сотрудник",
    platformLogsColAction: "Действие",
    platformLogsColTarget: "Объект",
    platformLogsColDetail: "Детали",
    platformLogsColResult: "Результат",
    platformLogsOk: "OK",
    platformLogsFail: "Ошибка",
    platformLogsSearch: "Поиск по сотруднику, действию, объекту…",
    paginationPrev: "Предыдущая страница",
    paginationNext: "Следующая страница",
    sitesProvisionColStep: "Шаг",
    sitesProvisionColMessage: "Сообщение",
    sitesProvisionColTime: "Время",
    sidebarSignedInAs: "Вы вошли как",
    sitesEdit: "Изменить",
    sitesDelete: "Удалить",
    sitesDeleteConfirm: "Удалить сайт {domain} и его workspace? Это необратимо.",
    sitesUpdatedToast: "Сайт обновлён",
    sitesDeletedToast: "Сайт удалён",
    sitesProvisionLog: "Журнал настройки",
    sitesSave: "Сохранить",
    platformUsersTitle: "Пользователи Devuko",
    platformUsersSubtitle: "Операторы CRM с доступом к платформе и workspace сайтов",
    platformAdminAdd: "Добавить пользователя",
    platformAdminCreateTitle: "Новый пользователь Devuko",
    platformAdminCreateSubtitle: "Логин, имя, фамилия и email для входа в CRM",
    platformAdminEditTitle: "Пользователь Devuko",
    platformAdminEditSubtitle: "Измените логин, имя, фамилию, email или пароль",
    platformAdminBack: "Назад к списку",
    platformAdminSearchPlaceholder: "Поиск по логину, имени или email",
    platformAdminCreatedToast: "Пользователь добавлен",
    platformAdminSavedToast: "Изменения сохранены",
    platformAdminDelete: "Удалить",
    platformAdminDeleteConfirm: "Удалить пользователя {name}? Это действие нельзя отменить.",
    platformAdminDeletedToast: "Пользователь Devuko удалён",
    platformAdminDeleteSelfBlocked: "Нельзя удалить свой аккаунт",
    platformAdminDeleteLastBlocked: "Нельзя удалить последнего пользователя",
    platformAdminFormTitle: "Данные аккаунта",
    platformAdminLoginHistoryTitle: "История входов",
    platformAdminLoginHistorySubtitle: "Успешные и неудачные попытки входа в CRM",
    platformAdminLoginHistoryEmpty: "Записей о входах для этого пользователя пока нет.",
    platformAdminLoginHistoryColTime: "Время",
    platformAdminLoginHistoryColEvent: "Событие",
    platformAdminLoginHistoryColDetail: "Детали",
    platformAdminLoginHistoryColResult: "Итог",
    platformAdminLoginHistorySuccess: "Успех",
    platformAdminLoginHistoryFailed: "Ошибка",
    platformAdminStatLogins: "Успешных входов",
    platformAdminStatFailed: "Неудачных попыток",
    platformAdminStatLastLogin: "Последний вход",
    platformAdminStatLastFailed: "Последняя ошибка",
    platformAdminStatusOnline: "Онлайн",
    platformAdminStatusOffline: "Офлайн",
    platformAdminLastSeen: "Был в сети",
    platformStorageRoot: "Системный диск",
    platformSettingsTitle: "Сервер",
    platformSettingsSubtitle: "Ресурсы хоста, время и состояние платформы",
    platformServerInfoTitle: "Состояние сервера",
    platformServerDisk: "Раздел",
    platformServerUsage: "Занято",
    platformServerTime: "Время сервера",
    platformServerSites: "Сайты на сервере",
    workspaceMenuPlatform: "Платформа",
    workspaceMenuSites: "Сайты",
  },
  en: {
    workspace: "WORKSPACE",
    sections: "SECTIONS",
    language: "LANGUAGE",
    logout: "Logout",
    hello: "Hello,",
    dashboardTitle: "CRM Dashboard",
    dashboardSubtitle: "Platform, user and support management",
    users: "Users",
    promises: "Promises",
    proofs: "Proofs",
    engagement: "engagement",
    engagementHint: "User contact activity",
    activeBase: "Active base",
    active: "active",
    systemTime: "System time",
    live: "Live",
    segmentation: "Segmentation",
    countries: "Countries",
    registrations: "Registrations",
    logsByRole: "Logs by role",
    contactRequests: "Contact requests",
    logs: "Event log",
    rowsLimit: "Rows limit",
    rowsPerPage: "Rows per page",
    logDateFrom: "From",
    logDateTo: "To",
    logsEmpty: "No log entries found",
    tasks: "Tasks",
    backToUsers: "Back to users",
    backToPromises: "Back to promises",
    backToTasks: "Back to tasks",
    addUser: "Add user",
    newUserTitle: "New user",
    newUserSubtitle: "Fill in the fields and save to create an account",
    saveUser: "Save",
    createUser: "Create user",
    userSavedToast: "User saved",
    userCreatedToast: "User created",
    userSaveValidationPassword: "Password must be at least 8 chars and include letters and numbers",
    userSaveValidationFields: "Login and email are required",
    userSaveValidationLogin: "Login: 3-32 chars, letters/numbers/._- only",
    userSaveValidationEmail: "Invalid email format",
    userSaveValidationCountry: "Country is too short",
    userSaveValidationName: "Name fields must contain letters and be at least 2 characters",
    userSearchPlaceholder: "Search by name, email, login, country",
    orderAscDesc: "Order",
    tableIndex: "#",
    tableName: "Name",
    tableLogin: "Login",
    tableEmail: "Email",
    tableRole: "Role",
    tableCountry: "Country",
    tableCreated: "Created",
    sortCreated: "Date",
    sortLogin: "Login",
    sortEmail: "Email",
    sortName: "Name",
    fieldLogin: "Login",
    fieldEmail: "Email",
    fieldName: "First name",
    fieldSurname: "Last name",
    fieldLastname: "Middle name",
    fieldRole: "Role",
    fieldCountry: "Country",
    fieldAvatarUrl: "Avatar URL",
    fieldAdminNote: "Admin note",
    fieldPassword: "Password",
    fieldPasswordHint: "Leave blank to keep unchanged. Minimum 6 characters.",
    fieldPasswordCreateHint: "At least 6 characters.",
    roleUser: "Standard user",
    roleAdmin: "Admin",
    userRoles: {
      admin: "Admin",
      manager: "Manager",
      support: "Support",
      user: "User",
      system: "System",
    },
    logRoleFilterAll: "All roles",
    logRoleFilterAdmin: "Admins",
    logRoleFilterManager: "Managers",
    logRoleFilterSupport: "Support",
    logRoleFilterUser: "Users",
    logRoleFilterSystem: "System",
    logActionAll: "All actions",
    logsSubtitle: "Site activity journal",
    siteLogsSearch: "Search user, action, path…",
    logColTime: "Time",
    logColRole: "Role",
    logColActor: "Actor",
    logColAction: "Action",
    logColPath: "Path",
    logColResult: "Result",
    promisesTableTitle: "Promises",
    promisesTableHint: "Click a row to open the card",
    promiseColId: "ID",
    promiseColTitle: "Title",
    promiseColOwner: "Owner",
    promiseColStatus: "Status",
    promiseColProofs: "Proofs",
    promiseColDeadline: "Deadline",
    promiseDetailCategory: "Category",
    promiseDetailOwner: "Owner",
    promiseDetailStatus: "Status",
    promiseDetailProofs: "Proofs",
    promiseDetailPledge: "Pledge",
    promiseDetailCreated: "Created",
    promiseDetailUpdated: "Updated",
    promiseDetailUserEmail: "User email",
    tasksTableHint: "Click a row to open the card",
    taskColId: "ID",
    taskColTitle: "Title",
    taskColDescription: "Description",
    taskColStatus: "Status",
    taskColCreated: "Created",
    taskDetailOwner: "Owner",
    crmLoginTitle: "Devuko CRM",
    crmLoginSubtitle: "Sign in with email and password, then confirm with a code sent to your inbox",
    crmLoginStepCredentials: "Sign in",
    crmLoginStepCode: "Code",
    crmLoginFieldEmail: "Email",
    crmLoginPlaceholderEmail: "admin@devuko.ru",
    crmLoginFieldPassword: "Password",
    crmLoginPlaceholderPassword: "Password",
    crmLoginFieldCode: "Code from email",
    crmLoginContinue: "Continue",
    crmLoginSending: "Sending…",
    crmLoginVerify: "Sign in",
    crmLoginBack: "Back",
    crmLoginCodeHint: "Code sent to {email}. Enter 6 digits — valid for 10 minutes.",
    crmLoginOtpSentToast: "Code sent to {email}",
    crmLoginCredentialsRequired: "Enter email and password.",
    crmLoginError: "Invalid email or password.",
    crmLoginCodeInvalid: "Enter the 6-digit code.",
    crmLoginCodeError: "Invalid or expired code.",
    crmLoginOtpSendError: "Could not send the code. Try again.",
    crmLoginOtpCooldown: "Please wait a minute before requesting another code.",
    logStatusNoCode: "No code",
    logStatusError: "Error",
    logStatusClientError: "Rejected",
    logStatusOk: "OK",
    logSystemEvent: "System event",
    logSystemPath: "System operation",
    filterReset: "Reset",
    proofStateAdded: "Proofs submitted",
    proofStatePending: "Proofs pending",
    dashboardBack: "Back to dashboard",
    proofsPendingReview: "In review",
    segmentationAllUsers: "All users",
    contactsTitle: "Contact Us",
    contactsSubtitle: "Messages from the public site",
    contactsSearchPlaceholder: "Search by name, email, message",
    contactsColName: "Name",
    contactsColEmail: "Email",
    contactsColMessage: "Message",
    contactsColStatus: "Status",
    contactsColDate: "Date",
    contactsBack: "Back to messages",
    contactsEmpty: "No messages yet",
    contactsEmptyHint: "Contact Us form submissions will appear here",
    contactsStatTotal: "Total messages",
    contactsStatNew: "New",
    settingsTitle: "Settings",
    settingsSubtitle: "Site and support configuration",
    settingsCompactHint: "Toggles are a visual mock. Save persists support and SEO fields.",
    settingsSave: "Save settings",
    settingsSeoTitle: "SEO settings",
    filesTitle: "Files",
    filesSubtitle: "Reference list (demo)",
    filesColId: "ID",
    filesColTitle: "Title",
    filesColType: "Type",
    filesColOwner: "Owner",
    filesColUpdated: "Updated",
    filesColStatus: "Status",
    pagesTitle: "Pages",
    pagesSubtitle: "Traffic by site page",
    pagesColHash: "#",
    pagesColPage: "Page",
    pagesColViews: "Views",
    pagesColUnique: "Unique users",
    pagesColConversion: "Conversion",
    pagesSearchPlaceholder: "Search page path",
    pagesEmpty: "No page data yet",
    pagesEmptyHint: "Stats will appear after the first site visits",
    pagesStatViews: "Total views",
    pagesStatUnique: "Unique visits",
    pagesStatTop: "Top page",
    reportsTitle: "Reports",
    reportsSubtitle: "Error reports from the site",
    reportsColId: "ID",
    reportsColTitle: "Title",
    reportsColSeverity: "Severity",
    reportsColChannel: "Channel",
    reportsColStatus: "Status",
    reportsColCreated: "Created",
    callTrackerTitle: "Call tracker",
    callTrackerSubtitle: "Queues and metrics (demo)",
    callTrackerColId: "ID",
    callTrackerColManager: "Manager",
    callTrackerColQueue: "Queue",
    callTrackerColHandled: "Handled",
    callTrackerColMissed: "Missed",
    callTrackerColAvg: "Avg time",
    callTrackerColStatus: "Status",
    sidebarUsedSpace: "Used space",
    sidebarLastEvent: "Activity",
    sidebarNoAuditActivity: "No audit log entries yet",
    userAvatarHint: "Click to choose a photo",
    userAvatarTooLarge: "Image is still too large after compression — paste a URL or pick another file",
    userAvatarNotImage: "Please choose an image file (JPG, PNG…)",
    genderMale: "Male",
    genderFemale: "Female",
    genderNotSpecified: "Not specified",
    platformWorkspaceLabel: "Devuko",
    workspaceSwitch: "Switch workspace",
    sitesTitle: "Sites",
    sitesSubtitle: "Manage server sites and their workspaces",
    sitesCreateTitle: "New site",
    sitesCreateSubmit: "Create & provision",
    sitesColDomain: "Domain",
    sitesColStatus: "Status",
    sitesColWorkspace: "Workspace",
    sitesColPorts: "API/Web ports",
    sitesColCreated: "Created",
    sitesFieldDomain: "Domain",
    sitesFieldRepo: "Git repository",
    sitesFieldApiPort: "API port (prod)",
    sitesFieldWebPort: "Web port (prod)",
    sitesFieldExtraDomains: "Extra domains (comma-separated)",
    sitesProvision: "Re-provision",
    sitesCreatedToast: "Site created with workspace",
    sitesProvisionToast: "Site provisioning started",
    sitesValidationDomain: "Enter a valid domain (example.com)",
    sitesStatusActive: "Active",
    sitesStatusPending: "Pending",
    sitesStatusProvisioning: "Provisioning",
    sitesStatusError: "Error",
    platformDashboardTitle: "Devuko dashboard",
    platformDashboardSubtitle: "Platform overview, sites and server resources",
    platformSitesPreviewTitle: "Sites on server",
    platformSitesPreviewHint: "Switch to a site workspace to manage users and CRM",
    platformManageSites: "All sites",
    sitesEmpty: "No sites yet. Create the first one — a dedicated workspace will be provisioned.",
    sitesCancelCreate: "Cancel",
    sitesStatTotal: "Total sites",
    sitesStatPending: "Not active",
    sitesOpenWorkspace: "Open CRM",
    platformLogsTitle: "Platform audit log",
    platformLogsSubtitle: "Logins, operators and site actions",
    platformLogsColTime: "Time",
    platformLogsColActor: "Staff",
    platformLogsColAction: "Action",
    platformLogsColTarget: "Target",
    platformLogsColDetail: "Details",
    platformLogsColResult: "Result",
    platformLogsOk: "OK",
    platformLogsFail: "Failed",
    platformLogsSearch: "Search operator, action, target…",
    paginationPrev: "Previous page",
    paginationNext: "Next page",
    sitesProvisionColStep: "Step",
    sitesProvisionColMessage: "Message",
    sitesProvisionColTime: "Time",
    sidebarSignedInAs: "Signed in as",
    sitesEdit: "Edit",
    sitesDelete: "Delete",
    sitesDeleteConfirm: "Delete site {domain} and its workspace? This cannot be undone.",
    sitesUpdatedToast: "Site updated",
    sitesDeletedToast: "Site deleted",
    sitesProvisionLog: "Provision log",
    sitesSave: "Save",
    platformUsersTitle: "Devuko users",
    platformUsersSubtitle: "CRM operators with access to the platform and site workspaces",
    platformAdminAdd: "Add user",
    platformAdminCreateTitle: "New Devuko user",
    platformAdminCreateSubtitle: "Login, first name, last name and email for CRM access",
    platformAdminEditTitle: "Devuko user",
    platformAdminEditSubtitle: "Update login, name, email or password",
    platformAdminBack: "Back to list",
    platformAdminSearchPlaceholder: "Search by login, name or email",
    platformAdminCreatedToast: "User added",
    platformAdminSavedToast: "Devuko user saved",
    platformAdminDelete: "Delete",
    platformAdminDeleteConfirm: "Delete user {name}? This cannot be undone.",
    platformAdminDeletedToast: "Devuko user deleted",
    platformAdminDeleteSelfBlocked: "You cannot delete your own account",
    platformAdminDeleteLastBlocked: "Cannot delete the last user",
    platformAdminFormTitle: "Account details",
    platformAdminLoginHistoryTitle: "Sign-in history",
    platformAdminLoginHistorySubtitle: "Successful and failed CRM sign-in attempts",
    platformAdminLoginHistoryEmpty: "No sign-in records for this user yet.",
    platformAdminLoginHistoryColTime: "Time",
    platformAdminLoginHistoryColEvent: "Event",
    platformAdminLoginHistoryColDetail: "Details",
    platformAdminLoginHistoryColResult: "Result",
    platformAdminLoginHistorySuccess: "Success",
    platformAdminLoginHistoryFailed: "Failed",
    platformAdminStatLogins: "Successful logins",
    platformAdminStatFailed: "Failed attempts",
    platformAdminStatLastLogin: "Last sign-in",
    platformAdminStatLastFailed: "Last failure",
    platformAdminStatusOnline: "Online",
    platformAdminStatusOffline: "Offline",
    platformAdminLastSeen: "Last seen",
    platformStorageRoot: "System disk",
    platformSettingsTitle: "Server",
    platformSettingsSubtitle: "Host resources, time and platform status",
    platformServerInfoTitle: "Server status",
    platformServerDisk: "Mount",
    platformServerUsage: "Used",
    platformServerTime: "Server time",
    platformServerSites: "Sites on server",
    workspaceMenuPlatform: "Platform",
    workspaceMenuSites: "Sites",
  },
};
