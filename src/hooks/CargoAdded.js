document
  .getElementById('main-form')
  .addEventListener('submit', async (event) => {
    event.preventDefault()

    if (response.ok) {
      formModal.hide()
      successModal.show()
    } else {
      throw Error('Не удалось добавить груз')
    }
  })
