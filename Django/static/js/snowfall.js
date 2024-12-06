(function() {
    // Настройки снежинок
    var snowflakeCount = 100; // Начальное количество снежинок
    var snowflakeCountMax = 333; // Максимальное количество снежинок
    var snowflakes = [];
    var backCanvas, backCtx;
    var frontCanvas, frontCtx;
    var width, height;
    var snowSticky = 0.9; // Коэффициент для липкости
    var snowBack = 0.7; // Коэффициент фоновых снежинок

    // Элементы для отображения счетчиков
    var fallingCountElement, totalCountElement;

    // Элементы, на которых будет образовываться сугроб
    var accumulationElements = []; // Массив элементов
    var accumulationClasses = ['snow-accumulate']; // Классы элементов, на которых накапливается снег

    // Максимальная высота сугроба в пикселях
    var maxAccumulatedHeight = 3;
    // Счетчик снежинок
    var fallingCount_ = 0;
    // Инициализация
    function init() {
        // Создаем задний canvas (позади элементов)
        backCanvas = document.createElement('canvas');
        backCanvas.id = 'snow-canvas-back';
        backCanvas.style.position = 'fixed';
        backCanvas.style.top = '0';
        backCanvas.style.left = '0';
        backCanvas.style.width = '100%';
        backCanvas.style.height = '100%';
        backCanvas.style.pointerEvents = 'none';
        backCanvas.style.zIndex = '3'; // Ниже элементов
        document.body.appendChild(backCanvas);

        backCtx = backCanvas.getContext('2d');

        // Создаем передний canvas (перед элементами)
        frontCanvas = document.createElement('canvas');
        frontCanvas.id = 'snow-canvas-front';
        frontCanvas.style.position = 'fixed';
        frontCanvas.style.top = '0';
        frontCanvas.style.left = '0';
        frontCanvas.style.width = '100%';
        frontCanvas.style.height = '100%';
        frontCanvas.style.pointerEvents = 'none';
        frontCanvas.style.zIndex = '1'; // Выше элементов
        document.body.appendChild(frontCanvas);

        frontCtx = frontCanvas.getContext('2d');

        // Устанавливаем размер canvas
        resizeCanvas();

        // Получаем элементы, на которых будет накапливаться снег
        accumulationElements = getAccumulationElements();

        // Создаем снежинки
        for (var i = 0; i < snowflakeCount; i++) {
            snowflakes.push(createSnowflake()); // Создаем снежинки
        }

        // Создаем элементы для отображения счетчиков
        createCounterElements();

        // Запускаем анимацию
        requestAnimationFrame(update);
        window.addEventListener('resize', resizeCanvas);
    }

    // Создаем элементы для отображения счетчиков
    function createCounterElements() {
        var counterContainer = document.createElement('div');
        counterContainer.id = 'snowflake-counter';
        counterContainer.style.position = 'fixed';
        counterContainer.style.bottom = '10px';
        counterContainer.style.left = '10px';
        counterContainer.style.color = 'rgba(255, 255, 255, 0.5)';
        counterContainer.style.zIndex = '0';
        counterContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
        counterContainer.style.padding = '10px';
        counterContainer.style.borderRadius = '5px';
        counterContainer.style.fontFamily = 'Arial, sans-serif';

        fallingCountElement = document.createElement('div');
        totalCountElement = document.createElement('div');

        counterContainer.appendChild(fallingCountElement);
        counterContainer.appendChild(totalCountElement);

        document.body.appendChild(counterContainer);
    }


    // Обновление счетчиков снежинок
    function updateCounters() {
        var  fallingCount = snowflakes.filter(function(flake) {
            return !flake.stopped;
        }).length;

        var totalCount = snowflakes.length;

        fallingCountElement.textContent = 'Падающие снежинки: ' + fallingCount;
        totalCountElement.textContent = 'Общее количество снежинок: ' + totalCount;
    }

    // Изменение размера canvas при изменении размера окна
    function resizeCanvas() {
        width = backCanvas.width = frontCanvas.width = window.innerWidth;
        height = backCanvas.height = frontCanvas.height = window.innerHeight;

        // Обновляем позиции элементов для накопления снега
        accumulationElements = getAccumulationElements();

        // При изменении размера экрана удаляем прилипшие снежинки
        clearAccumulatedSnow();
    }

    // Получение элементов для накопления снега
    function getAccumulationElements() {
        var elements = [];
        accumulationClasses.forEach(function(className) {
            var els = document.getElementsByClassName(className);
            for (var i = 0; i < els.length; i++) {
                var rect = els[i].getBoundingClientRect();
                elements.push({
                    element: els[i],
                    x: rect.left,
                    y: rect.top,
                    width: rect.width,
                    height: rect.height,
                    accumulatedSnowflakes: [] // Массив накопленных снежинок
                });
            }
        });
        return elements;
    }

    // Создаем объект снежинки со случайными параметрами
    function createSnowflake(spawnAboveScreen = false) {
        var opacity = Math.random() * 0.8 + 0.2; // Прозрачность снежинки (от 0.2 до 1.0)

        // Если первый запуск создаём снежинку на экране до уровня прилипания
        if (!spawnAboveScreen) {
            opacity = Math.random() * 0.3 + 0.4; // Прозрачность меньше (до 0.7)
        }
        
        return {
            x: Math.random() * width,                  // Позиция по X
            y: spawnAboveScreen ? -Math.random() * height : Math.random() * height, // Появление выше экрана
            radius: Math.random() * 5 + 1,             // Радиус снежинки (от 1 до 6)
            speedY: Math.random() * 0.6 + 0.3,         // Скорость по Y (от 0.3 до 0.9)
            speedX: Math.random() * 0.5 - 0.25,        // Скорость по X (для покачивания от -0.25 до 0.25)
            opacity: opacity,                          // Прозрачность снежинки
            stopped: false,                            // Флаг остановки снежинки
            front: opacity <= snowSticky * snowBack    // Если opacity <= определенного значения, снежинка будет позади объектов
        };
    }

    // Обновление позиции и перерисовка снежинок
    function update() {
        // Очищаем canvas
        backCtx.clearRect(0, 0, width, height);
        frontCtx.clearRect(0, 0, width, height);

        // Рисуем накопленные снежинки на элементах
        // drawAccumulatedSnow(); // Если нужно рисовать накопленные снежинки, раскомментируйте эту строку

        for (var i = 0; i < snowflakes.length; i++) {
            var flake = snowflakes[i];

            if (!flake.stopped) {
                flake.y += flake.speedY;
                flake.x += flake.speedX;

                // Покачивание снежинок
                if (flake.x > width + flake.radius) {
                    flake.x = -flake.radius;
                } else if (flake.x < -flake.radius) {
                    flake.x = width + flake.radius;
                }


                // Проверяем столкновение с элементами для накопления
                if (!flake.front) { // Только снежинки позади объектов могут накапливаться
                    for (var j = 0; j < accumulationElements.length; j++) {
                        var el = accumulationElements[j];
                        var accumulatedHeightAtX = getAccumulatedHeight(el, flake.x);

                        // Проверяем, может ли снежинка прилипнуть
                        var canStick = (
                        flake.x + (flake.radius / 2) > el.x + 11 &&
                        flake.x - (flake.radius / 2) < el.x + el.width - 11 &&
                        flake.y + flake.radius >= el.y - accumulatedHeightAtX &&
                        flake.y - flake.radius <= el.y + 5 &&
                        flake.opacity >= snowSticky - 0.1 && // Только снежинки с непрозрачностью snowSticky - 0.1 могут прилипать
                        accumulatedHeightAtX < maxAccumulatedHeight // Проверяем ограничение высоты сугроба
                        );

                        if (canStick) {
                            // Снежинка достигла верхней границы элемента или другой снежинки

                            // Вычисляем позицию последней снежинки или элемента
                            var lastFlakeY = el.y - accumulatedHeightAtX;

                            // Вычисляем, насколько текущая снежинка пересекла предыдущую
                            var overlap = (flake.y + (flake.radius / 2)) - lastFlakeY;

                            // Погружаем снежинку на половину разницы между ними
                            flake.y -= overlap * (1 / 2);

                            flake.stopped = true;

                            el.accumulatedSnowflakes.push(flake);
                            if (snowflakes.length < snowflakeCountMax) {
                                snowflakes.push(createSnowflake(true)); // Создаем новую снежинку
                            }
                            break;
                        }
                    }
                }

                if (flake.y - flake.radius > height) {
//                    flake.stopped = true;
                    // Если снежинка вышла за нижнюю границу экрана, перезапускаем ее из-за верхней границы
//                    if (fallingCount > snowflakeCount){
                        snowflakes[i] = createSnowflake(true); // Создаем новую снежинку выше экрана
                        continue;
//                    }
                }
            }

            // Рисуем снежинку на соответствующем canvas
            var ctx = flake.front ? frontCtx : backCtx;

            ctx.beginPath();
            if (flake.stopped) {
                // Рисуем эллипс для остановившейся снежинки
                ctx.ellipse(flake.x, flake.y, flake.radius, flake.radius * 0.7, 0, 0, Math.PI * 2);
            } else {
                // Рисуем круг для падающей снежинки
                ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
            }

            // Изменяем цвет снежинки, если она может прилипнуть (для отладки)
//            var color;
//            if (!flake.front && flake.opacity >= snowSticky - 0.1) {
//                color = 'rgba(255, 0, 0,' + flake.opacity + ')'; // Красный цвет для снежинок, которые могут прилипнуть
//            } else {
//                color = 'rgba(255, 255, 255,' + flake.opacity + ')'; // Белый цвет для остальных
//            }
            color = 'rgba(255, 255, 255,' + flake.opacity + ')'; // Белый цвет для остальных

            ctx.fillStyle = color;
            ctx.fill();
        }

        // Обновляем счетчики снежинок
        updateCounters();

        requestAnimationFrame(update);
    }

    // Получаем высоту накопленного снега на определенной позиции x
    function getAccumulatedHeight(el, x) {
        var totalHeight = 0;
        el.accumulatedSnowflakes.forEach(function(flake) {
            var distance = Math.abs(flake.x - x);
            if (distance < flake.radius * 2) {
                var overlap = Math.max(0, flake.radius * 2 - distance);
                totalHeight += overlap;
            }
        });
        // Ограничиваем максимальную высоту сугроба
        if (totalHeight > maxAccumulatedHeight) {
            totalHeight = maxAccumulatedHeight;
        }
        return totalHeight;
    }

    // Удаляем накопленные снежинки
    function clearAccumulatedSnow() {
        accumulationElements.forEach(function(el) {
            el.accumulatedSnowflakes = [];
        });

        // Также сбрасываем статус снежинок
        snowflakes.forEach(function(flake) {
            if (flake.stopped) {
                // Перезапускаем снежинку
                var index = snowflakes.indexOf(flake);
                snowflakes[index] = createSnowflake(true); // Создаем новую снежинку выше экрана
            }
        });
    }

    // Запуск скрипта
    init();

})();
