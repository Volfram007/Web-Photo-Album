(function($) {
    $.fn.TimeDate_container = function(options) {
        var settings = $.extend({
            // Настройки по умолчанию
            updateInterval: 1000 // Интервал обновления в миллисекундах
        }, options);

        return this.each(function() {
            var $this = $(this);

            // Функция для получения и отображения текущего времени и даты
            function currentTime() {
                var date = new Date(); // Время и дата
                var day = date.getDay(); // Номер дня недели (0 - ВС, 6 - СБ)
                var hour = date.getHours();
                var min = date.getMinutes();
                var sec = date.getSeconds();
                var month = date.getMonth(); // Номер месяца (0 - январь)
                var currDate = date.getDate();
                var year = date.getFullYear();

                // Названия месяцев
                var monthName = [
                    "Январь",
                    "Февраль",
                    "Март",
                    "Апрель",
                    "Май",
                    "Июнь",
                    "Июль",
                    "Август",
                    "Сентябрь",
                    "Октябрь",
                    "Ноябрь",
                    "Декабрь",
                ];

                // Форматирование времени
                hour = updateTime(hour);
                min = updateTime(min);
                sec = updateTime(sec);
                currDate = updateTime(currDate);

                // Обновление HTML-контента
                $this.html(`
                    <div class="timeDiv">
                        <span class="font-color" id="time">${hour}:${min}</span>
                        <span class="font-color" id="sec">${sec}</span>
                    </div>
                    <div class="dayDiv">
                        <span class="font-color day">ПН</span>
                        <span class="font-color day">ВТ</span>
                        <span class="font-color day">СР</span>
                        <span class="font-color day">ЧТ</span>
                        <span class="font-color day">ПТ</span>
                        <span class="font-color day">СБ</span>
                        <span class="font-color day">ВС</span>
                    </div>
                    <span class="font-color" id="full-date">${monthName[month]} ${currDate} ${year}</span>
                `);

                // Подсветка текущего дня недели
                var showDay = $this.find('.dayDiv span');
                showDay.eq((day + 6) % 7).css({ // Исправление для понедельника (день начинается с 0 - ВС)
                    'background': 'linear-gradient(to bottom,#b99c29,#504b2c)',
                    '-webkit-text-fill-color': 'transparent',
                    'background-clip': 'text',
                    '-webkit-background-clip': 'text',
                    'opacity': '1',
                    'font-weight': 'bold',
                });
            }

            // Функция для добавления ведущего нуля к числам меньше 10
            function updateTime(x) {
                return x < 10 ? "0" + x : x;
            }

            // Запуск начального обновления времени
            currentTime();

            // Установка интервала обновления
            setInterval(currentTime, settings.updateInterval);
        });
    };
})(jQuery);
