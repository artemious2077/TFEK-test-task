// Функция генерации номера груза
function generateCargoNumber() {
  const prefix = 'CARGO'
  // генерация числа от 100 до 999
  const randomNumber = Math.floor(100 + Math.random() * 900)
  // форматирование числа до 3 цифр
  return `${prefix}${randomNumber.toString().padStart(3, '0')}`
}

// Функция отправки данных формы
async function formRequest(event) {
  event.preventDefault()

  // получаем данные из формы
  const form = document.getElementById('main-form')
  const formData = new FormData(form)

  // преобразуем FormData в объект т.к. отправлять и хранить мы будем объект
  const formObject = {}
  formData.forEach((value, key) => {
    formObject[key] = value
  })

  // добавляем сгенерированный номер груза в данные формы
  const cargoNumberElement = document.getElementById('cargo_id')
  const cargoNumber = cargoNumberElement.textContent
  // привязываем ключ cargo_number к cargoNumber константе, которая получает сгенерированный
  // в generateCargoNumber и отображаемый в DOM элементе с id "cargo_id"
  formObject.cargo_number = cargoNumber

  try {
    // отправляем POST запрос на сервер
    const response = await fetch('http://localhost:3001/product_data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formObject),
    })

    // если будет ошибка, то данная ошикба будет работать
    if (!response.ok) {
      throw new Error('Данные не были доставлены')
    }
    alert('Груз успешно добавлен! Для продолжения нажмите Enter')
  } catch (error) {
    console.error('Ошибка:', error)
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const cargoNumberElement = document.getElementById('cargo_id')
  const cargoNumber = generateCargoNumber()
  // преобразуем сгенерированный номер груза в строку
  cargoNumberElement.textContent = cargoNumber

  const form = document.getElementById('main-form')
  // вызов функции отправки данных формы в локальный сервер db.json
  form.addEventListener('submit', formRequest)
})
