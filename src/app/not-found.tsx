import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-7xl font-serif text-gold mb-4">404</div>
        <h1 className="font-serif text-2xl text-burgundy mb-3">Không tìm thấy trang</h1>
        <p className="text-gray-500 mb-8">Trang bạn đang tìm không tồn tại hoặc đã bị di chuyển.</p>
        <div className="flex gap-3 justify-center">
          <Link href="/" className="btn-gold">Về trang chủ</Link>
          <Link href="/products" className="btn-outline-gold">Xem sản phẩm</Link>
        </div>
      </div>
    </div>
  );
}
