"use client";

import { useEffect, useRef, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";

type Props = {
  onSuccess: (res: { credential?: string }) => void;
  onError: () => void;
  text?: "signin_with" | "signup_with" | "continue_with";
};

export default function ResponsiveGoogleLogin({ onSuccess, onError, text = "signin_with" }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(368);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      setWidth(Math.floor(entry.contentRect.width));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={wrapperRef} className="w-full overflow-hidden">
      <GoogleLogin
        onSuccess={onSuccess}
        onError={onError}
        theme="filled_black"
        shape="rectangular"
        size="large"
        width={String(width)}
        text={text}
      />
    </div>
  );
}
