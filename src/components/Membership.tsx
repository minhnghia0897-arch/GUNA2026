export default function Membership() {
  return (
    <section id="membership" className="py-20 bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-gold text-sm font-normal tracking-[0.3em] uppercase mb-3">Đặc Quyền</p>
          <h2 className="font-serif text-3xl sm:text-4xl text-burgundy mb-4">Tham Gia Thành Viên</h2>
          <div className="w-20 h-[1px] bg-gold mx-auto" />
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl overflow-hidden border border-gold/10 shadow-sm hover:shadow-xl hover:shadow-burgundy/5 transition-all duration-500 group">
            <div className="bg-gradient-to-br from-burgundy to-burgundy-900 p-8 text-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-4 right-4 w-24 h-24 rounded-full border border-gold/30" />
                <div className="absolute bottom-4 left-4 w-16 h-16 rounded-full border border-gold/20" />
              </div>
              <div className="relative z-10">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gold/20 border-2 border-gold/40 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                  </svg>
                </div>
                <h3 className="text-gold font-serif text-xl mb-1">Tích & Đổi Điểm</h3>
                <p className="text-white/60 text-sm font-normal">Tích điểm mỗi đơn hàng</p>
              </div>
            </div>
            <div className="p-6">
              <ul className="space-y-3">
                {["Tích 1 điểm cho mỗi 10.000đ", "Đổi điểm lấy quà tặng hấp dẫn", "Ưu đãi sinh nhật đặc biệt", "Giảm giá độc quyền cho thành viên"].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700 font-medium text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-2xl overflow-hidden border border-gold/10 shadow-sm hover:shadow-xl hover:shadow-burgundy/5 transition-all duration-500 group">
            <div className="bg-gradient-to-br from-gold to-gold-600 p-8 text-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-4 right-4 w-24 h-24 rounded-full border border-white/30" />
                <div className="absolute bottom-4 left-4 w-16 h-16 rounded-full border border-white/20" />
              </div>
              <div className="relative z-10">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-white font-serif text-xl mb-1">Giới Thiệu Bạn Bè</h3>
                <p className="text-white/70 text-sm font-normal">Nhận thưởng khi giới thiệu</p>
              </div>
            </div>
            <div className="p-6">
              <ul className="space-y-3">
                {["Nhận 50.000đ cho mỗi lần giới thiệu", "Bạn bè được giảm 10% đơn đầu", "Không giới hạn số lần giới thiệu", "Thăng hạng VIP nhanh chóng"].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700 font-medium text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
