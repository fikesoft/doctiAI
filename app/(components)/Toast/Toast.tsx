"use client";
import useAppDispatch from "@/store/hooks/useDispatch";
import useAppSelector from "@/store/hooks/useSelector";
import { removeToast } from "@/store/slices/toast";
import { IoIosClose } from "react-icons/io";
import React, { useEffect } from "react";

const Toast = () => {
  const { toasts } = useAppSelector((state) => state.toast);
  const dispatch = useAppDispatch();

  // Auto-close each toast after 2s
  useEffect(() => {
    if (!toasts.length) return;
    // Set a timeout for each toast
    const timers = toasts.map((toast) =>
      setTimeout(() => dispatch(removeToast(toast.id)), 2000)
    );
    return () => timers.forEach((t) => clearTimeout(t));
  }, [toasts, dispatch]);

  if (!toasts.length) return null;

  return (
    <div className="toast toast-top toast-end z-[9999] space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`alert alert-${toast.headerToast} flex flex-col gap-3 items-start transition-opacity duration-300 opacity-100`}
        >
          <div className="flex justify-between items-center w-full">
            <span>{toast.headerToast?.toLocaleUpperCase()}</span>
            <span
              className="cursor-pointer"
              onClick={() => dispatch(removeToast(toast.id))}
            >
              <IoIosClose size={24} />
            </span>
          </div>
          <span>{toast.messageToast}</span>
        </div>
      ))}
    </div>
  );
};

export default Toast;
