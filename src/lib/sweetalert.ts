import Swal from 'sweetalert2';

// Custom SweetAlert2 Toast & Popup Configuration for SMP Al Muttaqin Pilketos App
const customSwal = Swal.mixin({
  customClass: {
    popup: 'rounded-2xl shadow-2xl border border-slate-100 font-sans',
    title: 'text-slate-900 font-bold text-lg',
    htmlContainer: 'text-slate-600 text-sm',
    confirmButton: 'bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-md transition-all mx-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50',
    cancelButton: 'bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-4 py-2.5 rounded-xl transition-all mx-1.5 focus:outline-none',
    denyButton: 'bg-rose-600 hover:bg-rose-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-md transition-all mx-1.5 focus:outline-none',
  },
  buttonsStyling: false,
});

/**
 * Modern SweetAlert2 Success Modal with Auto-Close
 */
export const showSuccessAlert = (title: string, text?: string, timer: number = 2500) => {
  return customSwal.fire({
    icon: 'success',
    title: title,
    text: text,
    timer: timer,
    timerProgressBar: true,
    showConfirmButton: timer > 3000,
    confirmButtonText: 'Selesai',
    iconColor: '#059669', // Tailwind Emerald-600
  });
};

/**
 * Special Thank-You / Voting Cast Success Alert
 */
export const showVotingSuccessAlert = (candidateName: string, paslonNumber: number) => {
  return customSwal.fire({
    icon: 'success',
    title: 'Suara Anda Berhasil Disimpan!',
    html: `
      <div class="mt-2 text-center">
        <p class="text-slate-600 text-sm mb-2">Terima kasih atas partisipasi Anda dalam Pemilihan Ketua OSIS.</p>
        <div class="inline-block bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl text-emerald-800 font-semibold text-xs mt-1">
          Pilihan: <span class="font-bold">Paslon 0${paslonNumber}</span> (${candidateName})
        </div>
        <p class="text-[11px] text-slate-400 mt-3 italic">Layar akan otomatis kembali ke menu absensi...</p>
      </div>
    `,
    timer: 3000,
    timerProgressBar: true,
    showConfirmButton: false,
    allowOutsideClick: false,
    iconColor: '#059669',
  });
};

/**
 * SweetAlert2 Error Alert
 */
export const showErrorAlert = (title: string, text?: string) => {
  return customSwal.fire({
    icon: 'error',
    title: title,
    text: text,
    confirmButtonText: 'Tutup',
    iconColor: '#e11d48', // Rose-600
  });
};

/**
 * SweetAlert2 Confirmation Dialog (for Delete or Critical Actions)
 */
export const showConfirmDialog = async (
  title: string,
  text: string,
  confirmButtonText: string = 'Ya, Lanjutkan',
  cancelButtonText: string = 'Batal'
): Promise<boolean> => {
  const result = await customSwal.fire({
    icon: 'warning',
    title: title,
    text: text,
    showCancelButton: true,
    confirmButtonText: confirmButtonText,
    cancelButtonText: cancelButtonText,
    reverseButtons: true,
    iconColor: '#d97706', // Amber-600
  });

  return result.isConfirmed;
};

/**
 * SweetAlert2 Toast Notification (Top-Right)
 */
export const showToast = (
  icon: 'success' | 'error' | 'warning' | 'info',
  title: string,
  timer: number = 3000
) => {
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: timer,
    timerProgressBar: true,
    customClass: {
      popup: 'rounded-xl shadow-lg border border-slate-200 font-sans p-3',
      title: 'text-xs font-bold text-slate-800',
    },
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    },
  });

  Toast.fire({
    icon: icon,
    title: title,
  });
};

export default customSwal;
