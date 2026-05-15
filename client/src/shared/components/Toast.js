import Swal from 'sweetalert2'

const toastInstance = Swal.mixin({
  toast: true,
  position: 'center',
  iconColor: 'white',
  customClass: {
    popup: 'colored-toast',
  },
  showConfirmButton: false,
  timer: 5000,
  timerProgressBar: true,
})

export const showToast = (title, text='', icon='success') => {
  toastInstance.fire({
    icon: icon,
    title: title,
    text: text
  })
}