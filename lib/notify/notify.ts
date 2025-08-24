import useAppDispatch from "@/store/hooks/useDispatch";
import { pushToast } from "@/store/slices/toast";

export function notifyError(
  dispatch: ReturnType<typeof useAppDispatch>,
  message: string
) {
  dispatch(
    pushToast({
      messageToast: message,
      headerToast: "error",
    })
  );
}

export function notifySuccess(
  dispatch: ReturnType<typeof useAppDispatch>,
  message: string
) {
  dispatch(
    pushToast({
      messageToast: message,
      headerToast: "success",
    })
  );
}
