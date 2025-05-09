
import * as React from "react";
import { ToastContextType } from "./types";
import { listeners, memoryState } from "./store";
import { toast } from "./toast-function";
import { dispatch } from "./store";

const ToastContext = React.createContext<ToastContextType>(null);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = React.useState(memoryState);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [state]);

  const contextValue = React.useMemo(() => {
    return {
      toasts: state.toasts,
      toast,
      dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId })
    };
  }, [state.toasts]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
    </ToastContext.Provider>
  );
};

export function useToast() {
  const context = React.useContext(ToastContext);
  
  if (context === null) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  
  return context;
}

export { toast };
