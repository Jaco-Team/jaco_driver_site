importScripts('https://www.gstatic.com/firebasejs/3.6.8/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/3.6.8/firebase-messaging.js');

firebase.initializeApp({
    messagingSenderId: 'macro-thinker-288611'
});

const messaging = firebase.messaging();

// регистрируем свой обработчик уведомлений
messaging.setBackgroundMessageHandler(function(payload) {
    if (typeof payload.data.time != 'undefined') {
        var time = new Date(payload.data.time * 1000);
        var now = new Date();

        if (time < now) { // истек срок годности уведомления
            return null;
        }

        var diff = Math.round((time.getTime() - now.getTime()) / 1000);

        // показываем реальное время в уведомлении
        // будет сгенерировано сообщение вида: "Начало через 14 минут, в 21:00"
        payload.data.body = 'Начало через ' +
            Math.round(diff / 60) + ' минут, в ' + time.getHours() + ':' +
            (time.getMinutes() > 9 ? time.getMinutes() : '0' + time.getMinutes())
        ;
    }

    // Сохраяем data для получения пареметров в обработчике клика
    payload.data.data = payload.data;

    // Показываем уведомление
    return self.registration.showNotification(payload.data.title, payload.data);
});