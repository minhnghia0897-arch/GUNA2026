"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="vi">
      <body
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          background: "#FFF8F0",
          color: "#333",
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
        }}
      >
        <div style={{ maxWidth: 480, textAlign: "center" }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>⚠️</div>
          <h1 style={{ fontSize: 28, color: "#7A1B2D", marginBottom: 12 }}>
            Đã xảy ra lỗi nghiêm trọng
          </h1>
          <p style={{ color: "#666", marginBottom: 24, fontSize: 14, lineHeight: 1.6 }}>
            Trang web đang gặp sự cố. Vui lòng thử lại hoặc liên hệ hỗ trợ qua hotline{" "}
            <strong>0901 234 567</strong>.
          </p>
          {error.digest && (
            <p style={{ fontSize: 12, color: "#999", marginBottom: 24 }}>
              Mã lỗi: {error.digest}
            </p>
          )}
          <button
            onClick={reset}
            style={{
              background: "#C8A951",
              color: "#4A0E1C",
              border: "none",
              padding: "12px 32px",
              borderRadius: 4,
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Thử lại
          </button>
        </div>
      </body>
    </html>
  );
}
