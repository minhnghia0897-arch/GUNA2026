export default function VideoSection() {
  return (
    <section id="guide" className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-gold text-sm font-normal tracking-[0.3em] uppercase mb-3">Hướng Dẫn</p>
          <h2 className="font-serif text-3xl sm:text-4xl text-burgundy mb-4">Cách Chế Biến FarMơ?</h2>
          <div className="w-20 h-[1px] bg-gold mx-auto" />
        </div>

        <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-burgundy/10 border border-gold/10">
          <div className="aspect-video bg-gradient-to-br from-burgundy-950 to-burgundy flex items-center justify-center relative">
            <div className="absolute inset-0 flex items-center justify-center opacity-10">
              <span className="text-gold font-serif text-[120px] font-bold">FarMơ</span>
            </div>
            <div className="relative z-10 text-center">
              <button className="w-20 h-20 bg-gold/90 hover:bg-gold rounded-full flex items-center justify-center shadow-xl shadow-gold/30 transition-all duration-300 hover:scale-110 mx-auto mb-4" aria-label="Phát video">
                <svg className="w-8 h-8 text-burgundy-950 ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
              <p className="text-white font-serif text-xl">Cách Chế Biến FarMơ Đúng Cách</p>
              <p className="text-white/50 text-sm font-normal mt-2">Xem video hướng dẫn chi tiết</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
