import Swal from 'sweetalert2';

interface Props {
  icon: any;
  title: any;
  text: any;
  showDenyBtn?: boolean;
  showConfirmButton?: boolean;
  onConfirm?: () => void;
}

const MySwal = ({
  icon,
  title,
  text,
  showDenyBtn = false,
  showConfirmButton = true,
  onConfirm = () => {},
}: Props) => {
  return Swal.fire({
    title: title,
    text: text,
    icon: icon,
    confirmButtonColor: '#B7B7B7',
    showDenyButton: showDenyBtn,
    showConfirmButton: showConfirmButton,
    denyButtonText: 'No',
    confirmButtonText: 'OK',
  }).then((result) => {
    if (result.isConfirmed) onConfirm();
  });
};

export default MySwal;
