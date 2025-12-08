import Swal from "sweetalert2";

export const showUploadSuccess = () => {
  Swal.fire({
    title: "Upload Complete!",
    text: "Your PDF has been uploaded successfully.",
    icon: "success",
    timer: 1800,
    showConfirmButton: false,
    background: "#ffffff",
    color: "#2B235E",

    customClass: {
      popup: "shadow-xl rounded-2xl border border-purple-200",
      title: "text-[#2B235E] font-bold",
      htmlContainer: "text-gray-600"
    }
  });
};

export const showUploadError = () => {
  Swal.fire({
    title: "Upload Failed",
    text: "Something went wrong. Try again.",
    icon: "error",
    timer: 2000,
    showConfirmButton: false,
    background: "#ffffff",
    color: "#C53030",

    customClass: {
      popup: "shadow-xl rounded-2xl border border-red-200",
      title: "text-red-700 font-bold",
      htmlContainer: "text-gray-600"
    }
  });
};
