export default function Testimonial() {
  const testimonials = [
    {
      name: "Nguyễn Thị Mai Hương",
      content: "Bao bì rất đẹp và sang trọng! Thiết kế tinh tế, rất phù hợp để làm quà tặng. Khi mở hộp ra, cảm giác rất yên tâm về chất lượng. Sản phẩm tuyệt vời, xứng đáng với giá tiền!",
      rating: 5,
    },
    {
      name: "Trần Văn Đức",
      content: "Mua tặng mẹ nhân ngày sinh nhật. Mẹ rất thích vì FarMơ nguyên chất, sản phẩm đẹp và tinh tế. Đã mua lần thứ 3 rồi, lần nào chất lượng cũng đều rất tốt.",
      rating: 5,
    },
    {
      name: "Lê Thị Thanh Tâm",
      content: "Đóng gói rất cẩn thận, giao hàng nhanh. Sản phẩm FarMơ thơm ngon, chất lượng tuyệt vời. Sẽ tiếp tục ủng hộ và giới thiệu cho bạn bè!",
      rating: 5,
    },
  ];

  return (
    <section className="py-20 bg-cream relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-burgundy/3" />
      <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-gold/5" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <p className="text-gold text-sm font-normal tracking-[0.3em] uppercase mb-3">Cảm Nhận</p>
          <h2 className="font-serif text-3xl sm:text-4xl text-burgundy mb-4">Khách Hàng Nói Gì</h2>
          <div className="w-20 h-[1px] bg-gold mx-auto" />
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-white rounded-2xl p-8 shadow-sm border border-gold/10 hover:shadow-lg hover:shadow-burgundy/5 transition-all duration-300 relative">
              <div className="absolute -top-3 left-8 w-8 h-8 bg-gold rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151C7.546 6.068 5.983 8.789 5.983 11H10v10H0z" />
                </svg>
              </div>
              <div className="flex gap-1 mb-4 mt-2">
                {Array.from({ length: t.rating }).map((_, s) => (
                  <svg key={s} className="w-4 h-4 text-gold" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 font-medium text-sm leading-relaxed mb-6 italic">&ldquo;{t.content}&rdquo;</p>
              <div className="flex items-center gap-3 pt-4 border-t border-gold/10">
                <div className="w-10 h-10 rounded-full bg-burgundy/10 flex items-center justify-center">
                  <span className="text-burgundy font-serif font-bold text-sm">{t.name.charAt(0)}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-burgundy">{t.name}</p>
                  <p className="text-xs text-gray-400 font-normal">Khách hàng thân thiết</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
