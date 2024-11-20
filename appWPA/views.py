import os
from pathlib import Path

from black.trans import defaultdict
from django.core.paginator import Paginator
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login, logout
from django.shortcuts import get_object_or_404, render, redirect

from appWPA.models import *
from appWPA.InitText import *


def index(request):
    """
    Отображает главную страницу приложения.
    """
    # Отображение лимита дней на странице
    limit_days = int(request.GET.get("limit_days", 3))

    context = {
        "TitlePage": IndexTitle,  # Заголовок страницы
        "TextPage": IndexText,  # Текст страницы
        "btnHomeVisible": False,  # Видимость кнопки
        "btnAuthenticatedVisible": True,
        "limit_days": limit_days,  # Отображения дней на странице
    }

    if request.user.is_authenticated:
        photos_grouped_by_date = {}
        photos = ImageModel.objects.filter(user=request.user).order_by("-date")
        # Группировка фотографий по дате
        for photo in photos:
            photo_date_str = photo.date.strftime("%d.%m.%Y")
            # Если строки с этой датой еще нет в словаре, создаем новый ключ с пустым списком
            if photo_date_str not in photos_grouped_by_date:
                photos_grouped_by_date[photo_date_str] = []
            photos_grouped_by_date[photo_date_str].append(photo)

        # Словарь в список (дата, список фото)
        foto_list = list(photos_grouped_by_date.items())
        print(list(foto_list))
        # Создание объекта пагинации
        paginator = Paginator(foto_list, limit_days)
        print(list(paginator))
        # Получение номера страницы
        current_page_number = request.GET.get("page")
        current_page_photos = paginator.get_page(current_page_number)
        context["current_page_photos"] = current_page_photos
    else:
        context["AnonymousUser"] = AnonymousUser
    print(context)
    return render(request, "index.html", context)


@login_required
def user_logout(request):
    """
    Выполняет выход пользователя из системы.
    """
    logout(request)
    return redirect("authorization")


def authorization(request):
    """
    Обрабатывает запросы для страницы авторизации и регистрации.
    """
    context = {
        "TitlePage": "Авторизация",  # Заголовок страницы
        "btnHomeVisible": True,
        "btnAuthenticatedVisible": False,
    }

    # Проверка на авторизацию
    if request.user.is_authenticated:
        # Переход на домашнюю страницу
        #  context["message"] = "Вы уже авторизированны!"
        return redirect("index")

    if request.method == "POST":
        # Получение типа активной формы (вход или регистрация)
        form_type = request.POST.get("form_act")
        # Получаем логин и пароль
        username = request.POST.get("username")
        password1 = request.POST.get("password1")

        # Обработка действия формы, вход
        if form_type == "login":
            # Аутентификация пользователя по имени и паролю
            user = authenticate(request, username=username, password=password1)
            # Проверка, успешна ли аутентификация
            if user is not None:
                # Вход пользователя в систему
                login(request, user)
                return redirect("index")
            else:
                # Сообщение об ошибке при неверном логине или пароле
                context["error"] = Error_LoginOrPassword

        # Обработка действия формы, регистрация
        elif form_type == "register":
            # Получаем подтверждение пароля
            password2 = request.POST.get("password2")
            # Импорт библиотеки для дополнительных проверок
            import re

            # Проверка на заполнение всех полей
            if not (username or password1 or password2):
                context["error"] = Error_AllFieldsRequired
            # Проверка, совпадают ли введенные пароли
            elif password1 != password2:
                context["error"] = Error_PasswordsNotMatch
            # Проверка на совпадение логина
            elif User.objects.filter(username=username).exists():
                context["error"] = Error_UserExists
            # Проверка длины пароля
            elif len(password1 or password2) <= Min_Password_Length:
                context["error"] = Error_Password_Length
            else:
                # Создание нового пользователя с хешированным паролем
                user = User(username=username, password=make_password(password1))
                user.save()
                # Автоматический вход
                login(request, user)
                return redirect("index")
            # Если произошла ошибка, активируем форму регистрации
            context["form_act"] = "register"
    return render(request, "authorization.html", context)


def get_random_date():
    """
    Генерирует случайную дату, смещенную от текущей даты на заданный диапазон.

    Возвращает:
    datetime: Объект даты и времени, смещенный на случайное количество дней в прошлое.
    """
    import random
    from datetime import timedelta
    from django.utils import timezone

    random_days = random.randint(-5, 0)
    date = timezone.now() + timedelta(days=random_days)
    return date


@login_required
def upload_file(request):
    """
    Обрабатывает загрузку файлов изображений от авторизованных пользователей.
    """

    # Проверка авторизации
    if not request.user.is_authenticated:
        return redirect("authorization")

    # Получаем файл
    if request.method == "POST":
        # Получаем файлы и сохраняем
        for uploaded_file in request.FILES.getlist("uploaded_files"):
            # Генерируем случайную дату
            file_date = get_random_date()
            foto = ImageModel(user=request.user, image=uploaded_file, date=file_date)
            foto.save()
    return redirect("index")


@login_required
def delete_image(request, image_id):
    """
    Удаляет изображение, связанное с текущим пользователем, и файл изображения с диска.

    Параметры:
    request (HttpRequest): HTTP-запрос от пользователя.
    image_id (int): Идентификатор изображения, которое нужно удалить.
    """
    # Если объект не найден, возвращается ошибка 404.
    image = get_object_or_404(ImageModel, id=image_id, user=request.user)
    # Получение пути к файлу изображения
    image_path = Path(__file__).resolve().parent.parent / "media" / str(image.image)
    # Удаление объекта из базы данных
    image.delete()
    # Проверка существования файла на диске и его удаление
    if os.path.exists(image_path):
        try:
            os.remove(image_path)
        except Exception as e:
            print(f"Ошибка при удалении файла: {e}")
    # Перенаправление пользователя на главную страницу после удаления изображения
    return redirect("index")
