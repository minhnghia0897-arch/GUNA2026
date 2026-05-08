"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-gold/10 p-10 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-50 flex items-center justify-center">
          <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <h1 className="font-serif text-2xl text-burgundy mb-3">Đã xảy ra lỗi</h1>
        <p className="text-gray-500 text-sm mb-2">
          Xin lỗi, đã có sự cố không mong muốn. Đội ngũ kỹ thuật đã được thông báo.
        </p>
        {error.digest && (
          <p className="text-xs text-gray-400 mb-6">Mã lỗi: {error.digest}</p>
        )}
        <div className="flex gap-3 justify-center flex-wrap mt-6">
          <button onClick={reset} className="btn-gold">
            Thử lại
          </button>
          <Link href="/" className="btn-outline-gold">
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
