# 🛠️ **Установка и настройка**
### *Клонируем проект*
* Скачать проект в PyCharm(е):
  * Кнопка создания проекта "from Version Control"
    * Вкладка Repository URL > URL > `https://github.com/***.git`
  * ИЛИ через терминал:
    * `git clone https://github.com/Volfram007/Web-Photo-Album`
  * Создание папки виртуального окружения
    * `python -m venv venv`
      `
  * Активация папки:
      ```bash 
      venv\Scripts\activate
      ```
* Настраиваем *interpreter*

### *Зависимости и настройка*
* Установить зависимости из requirements.txt
  * `pip install -r requirements.txt`
* Настройка БД:
  * `python .\Django\manage.py migrate`

### **Запуск проекта:**
  * Создание конфигурации запуска:
    * Конфигурация для "`Python`"
      * script == `manage.py`
      * "Script parameters" == `runserver`
      * "Working directory" == `$ProjectFileDir$/Django`
  * ИЛИ в консоли ввести:
    * `python .\Django\manage.py runserver`
  * Перейти по ссылке (http://127.0.0.1:8000/)