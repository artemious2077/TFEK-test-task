document.addEventListener('DOMContentLoaded', () => {
  const cargoTableBody = document.getElementById('cargoTable')

  // функция для получения данных из db.json
  async function fetchData() {
    try {
      const response = await fetch('http://localhost:3001/product_data')
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Ошибка загрузки данных:', error)
    }
  }

  // функция для отправки обновленных данных в db.json с помощью PUT метода
  async function updateCargoStatus(id, newStatus, cargo) {
    try {
      // создаем новый объект с обновленным статусом
      const updatedCargo = {
        // старые данные
        ...cargo,
        // обновленный статус
        status: newStatus,
      }

      const response = await fetch(`http://localhost:3001/product_data/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        // отправка всего объекта с обновленными данными
        body: JSON.stringify(updatedCargo),
      })

      if (!response.ok) {
        throw new Error('Ошибка при обновлении статуса')
      }

      // получаем обновленные данные после отправки
      const updatedCargoFromServer = await response.json()
      console.log('Обновленный груз:', updatedCargoFromServer)
    } catch (error) {
      console.error('Ошибка отправки данных:', error)
    }
  }

  // Функция для создания выпадающего списка для статуса
  function createStatusSelect(cargo, row) {
    const statusSelect = document.createElement('select')
    const statuses = ['Ожидает отправки', 'В пути', 'Доставлен']

    statuses.forEach((status) => {
      const option = document.createElement('option')
      option.value = status
      option.textContent = status
      if (status === cargo.status) {
        // устанавливаем выбранный статус
        option.selected = true
      }
      statusSelect.appendChild(option)
    })

    // Обработчик события для изменения статуса
    statusSelect.addEventListener('change', () => {
      const selectedStatus = statusSelect.value
      // создание ячейки ошибки (она будет расположена справа в жёлтом столбце)
      const errorMessageCell = row.querySelector('.error-message')

      // Логика проверки добавленного статуса
      if (selectedStatus === 'Доставлен') {
        const errorMessage = isFutureDate(cargo.departure_date)
          ? 'Дата в будущем'
          : ''
        errorMessageCell.textContent = errorMessage

        // если дата не в будущем, отправляем запрос на сервер
        if (!errorMessage) {
          updateCargoStatus(cargo.id, selectedStatus, cargo)
        }
      } else {
        // скрытие поля ошибки при других статусах
        errorMessageCell.textContent = ''

        // если всё соответствует, отправляем запрос на сервер активируя updateCargoStatus ф-цию
        updateCargoStatus(cargo.id, selectedStatus, cargo)
      }
    })

    return statusSelect
  }

  // Функция проверки даты на будущую дату
  function isFutureDate(dateString) {
    const date = new Date(dateString)
    const today = new Date()
    return date > today
  }

  // Отображение даты в понятном порядке
  function formatDate(dateString) {
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}-${month}-${year}`
  }
  formatDate()

  // Функция рендеринга таблицы
  function renderTable(data) {
    // очистка таблицы перед рендерингом, т.к.без данной строчки кода у нас сломается фильтр при рендеринге
    // + в консоли идёт жалоба на данную строку, так тчо игнорируем это ложное предупреждение браузера
    cargoTableBody.innerHTML = ''
    data.forEach((cargo) => {
      const row = document.createElement('tr')
      const statusSelect = createStatusSelect(cargo, row)
      // добавляем ячейки в таблицу
      cargoTableBody.appendChild(row)

      // создаём ячейки таблицы с помощью innerHTML
      row.innerHTML = `
        <td>${cargo.cargo_number}</td>
        <td>${cargo.product_name}</td>
        <td></td> <!-- Место для выпадающего списка -->
        <td>${cargo.departure_point}</td>
        <td>${cargo.destination_point}</td>
        <td>${cargo.departure_date}</td>
        <td class="error-message" style="color: red; width: 135px"></td>
      `

      // выводим выпадающий список статусов в таблице по индексу 2 т.к. сама таблица - это массив
      row.cells[2].appendChild(statusSelect)

      // Цветовая индикация статуса
      const statusCell = row.cells[2]
      if (cargo.status === 'Ожидает отправки') {
        statusCell.classList.add('bg-warning')
      } else if (cargo.status === 'В пути') {
        statusCell.classList.add('bg-primary')
      } else if (cargo.status === 'Доставлен') {
        statusCell.classList.add('bg-success')
      }
    })
  }

  // Вызов функции получения данных таблицы и добавление фильтра по статусам
  fetchData().then((data) => {
    renderTable(data)

    const statusFilter = document.getElementById('statusFilter')
    statusFilter.addEventListener('change', (event) => {
      const selectedStatus = event.target.value
      // используем filter() метод для получения ключа status, чтобы при смене данных из выпадающего списка
      // отображать только те данные, которые соответствуют выбранному значению в нашем случае это select список,
      // в котором мы вручную прописываем статус и сравниваем его идентичность статусу, описанному в данных. Потом
      // цже идёт фильтрация на отображение тех данных, окторые похожи с выбранным статусом из фильтра.
      const filteredStatus = data.filter(
        (cargo) => cargo.status === selectedStatus || selectedStatus === '',
      )
      renderTable(filteredStatus)
    })
  })
})
