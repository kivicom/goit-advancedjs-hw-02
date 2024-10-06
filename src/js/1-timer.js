import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

const startBtn = document.querySelector('button');
startBtn.disabled = true;

const dateTimePicker = document.querySelector('#datetime-picker');

let userSelectedDate = null;

const options = {
  enableTime: true,
  time_24hr: true,
  defaultDate: new Date(),
  minuteIncrement: 1,
  onClose(selectedDates) {
    userSelectedDate = selectedDates[0];

    if (isDateInThePast(userSelectedDate)) {
      displayError();
      startBtn.disabled = true;

      return;
    }

    startBtn.disabled = false;
    timer.deadline = userSelectedDate;
  },
};

flatpickr('#datetime-picker', options);

const timer = {
  deadline: new Date('2025-10-10'),
  elements: {
    days: document.querySelector('[data-days]'),
    hours: document.querySelector('[data-hours]'),
    minutes: document.querySelector('[data-minutes]'),
    seconds: document.querySelector('[data-seconds]'),
  },
  intervalId: null,
  start() {
    this.stop();
    this.intervalId = setInterval(() => {
      const diff = this.deadline - new Date();
      if (diff <= 0) {
        this.updateElements(0, 0, 0, 0); // Обновляем элементы до нуля
        this.stop();
        dateTimePicker.disabled = false;
        console.log('Timer has stopped!');
        return;
      }

      const { days, hours, minutes, seconds } = convertMs(diff);
      this.updateElements(days, hours, minutes, seconds);
    }, 1000);

    dateTimePicker.disabled = true;
    startBtn.disabled = true;
  },
  updateElements(days, hours, minutes, seconds) {
    if (this.elements.days) this.elements.days.textContent = pad(days);
    if (this.elements.hours) this.elements.hours.textContent = pad(hours);
    if (this.elements.minutes) this.elements.minutes.textContent = pad(minutes);
    if (this.elements.seconds) this.elements.seconds.textContent = pad(seconds);
  },
  stop() {
    if (this.intervalId === null) return;

    clearInterval(this.intervalId);
  },
  toggleStartButton(isEnabled) {
    startBtn.disabled = !isEnabled;
  },
};

startBtn.addEventListener('click', handleTimerStart);

function handleTimerStart() {
  if (!userSelectedDate || isDateInThePast(userSelectedDate)) {
    displayError();
    return;
  }

  timer.start();
}

function pad(value) {
  return String(value).padStart(2, '0');
}

function isDateInThePast(date) {
  return date < new Date();
}

function convertMs(ms) {
  // Number of milliseconds per unit of time
  const second = 1000;
  const minute = second * 60;
  const hour = minute * 60;
  const day = hour * 24;

  const days = Math.floor(ms / day);
  const hours = Math.floor((ms % day) / hour);
  const minutes = Math.floor(((ms % day) % hour) / minute);
  const seconds = Math.floor((((ms % day) % hour) % minute) / second);

  return { days, hours, minutes, seconds };
}

function displayError() {
  iziToast.error({
    message: 'Please choose a date in the future',
    position: 'topRight',
  });
}
