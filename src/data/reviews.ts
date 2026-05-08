export type Review = {
  id: string;
  author: string;
  rating: number;
  title?: string;
  content: string;
  date: string;
  verified: boolean;
  helpful: number;
};

export const mockReviews: Record<string, Review[]> = {
  "hop-qua-cuoi-happy-wedding-do": [
    {
      id: "r1",
      author: "Nguyễn Mai Anh",
      rating: 5,
      title: "Đẹp xuất sắc, đáng đồng tiền",
      content:
        "Mình mua làm quà cưới cho em gái. Hộp quà thiết kế tinh tế, họa tiết vàng nổi bật trên nền đỏ rất sang. Đóng gói cẩn thận, giao hàng đúng hẹn. 10 điểm!",
      date: "2026-04-28",
      verified: true,
      helpful: 23,
    },
    {
      id: "r2",
      author: "Trần Hữu Phúc",
      rating: 5,
      content:
        "Đặt 50 hộp cho đám cưới, GUNA GIFT hỗ trợ rất nhiệt tình, giảm giá tốt. Khách mời ai cũng khen hộp đẹp. Sẽ ủng hộ tiếp!",
      date: "2026-04-15",
      verified: true,
      helpful: 18,
    },
    {
      id: "r3",
      author: "Lê Thị Hồng",
      rating: 4,
      title: "Chất lượng tốt, hơi lâu giao",
      content: "Sản phẩm đúng như mô tả, chất lượng cao. Tuy nhiên giao hàng hơi chậm (4 ngày dù ở HCM). Mong shop cải thiện.",
      date: "2026-04-02",
      verified: true,
      helpful: 7,
    },
  ],
  "mat-ong-amber-whisper": [
    {
      id: "r4",
      author: "Phạm Quốc Khánh",
      rating: 5,
      title: "Mật ong nguyên chất, thơm tự nhiên",
      content:
        "Mình mua dùng tại nhà. Mật ong sánh vàng, thơm mùi hoa rừng, không bị lẫn vị đường. Chai thủy tinh đẹp, nhãn cổ điển nhìn rất sang.",
      date: "2026-05-01",
      verified: true,
      helpful: 31,
    },
    {
      id: "r5",
      author: "Đỗ Thanh Thảo",
      rating: 5,
      content: "Mua tặng sếp dịp Tết, sếp khen quá trời. Bao bì sang, hợp làm quà biếu cao cấp.",
      date: "2026-04-20",
      verified: true,
      helpful: 12,
    },
  ],
  "hop-qua-cuoi-happy-wedding-xanh": [
    {
      id: "r6",
      author: "Hoàng Mỹ Linh",
      rating: 5,
      title: "Phiên bản xanh tinh tế",
      content:
        "Đám cưới phong cách hiện đại nên mình chọn bản xanh. Họa tiết hoa lá vàng nổi rất tinh tế, khách trẻ rất thích. Hợp với menu các món Á Âu.",
      date: "2026-04-25",
      verified: true,
      helpful: 15,
    },
    {
      id: "r7",
      author: "Bùi Tuấn Kiệt",
      rating: 5,
      content: "Nhỏ gọn, xếp lên bàn tiệc đẹp. Giá hợp lý.",
      date: "2026-04-10",
      verified: true,
      helpful: 4,
    },
  ],
  "combo-qua-cuoi-do-xanh": [
    {
      id: "r8",
      author: "Vũ Hà My",
      rating: 5,
      content:
        "Mua combo cho 2 mâm cưới (1 truyền thống, 1 hiện đại). Cả 2 phiên bản đều đẹp, khách khen liên tục. Tiết kiệm được kha khá so với mua riêng.",
      date: "2026-04-18",
      verified: true,
      helpful: 22,
    },
  ],
  "set-qua-tang-mat-ong-banh": [
    {
      id: "r9",
      author: "Nguyễn Hoàng Nam",
      rating: 4,
      title: "Quà biếu đẹp, bánh hơi ngọt",
      content:
        "Set quà rất đẹp, mật ong ngon. Bánh truyền thống thì hơi ngọt với mình nhưng người lớn tuổi thích. Hợp làm quà Tết.",
      date: "2026-04-12",
      verified: true,
      helpful: 9,
    },
  ],
  "hop-qua-cuoi-xanh-nho": [
    {
      id: "r10",
      author: "Trịnh Mai Phương",
      rating: 5,
      title: "Mini nhưng vẫn sang",
      content:
        "Đám cưới mình mời 200 khách, chọn bản nhỏ vừa tiết kiệm vừa đẹp. Khách ai cũng khen, đặc biệt là khách nữ.",
      date: "2026-05-03",
      verified: true,
      helpful: 17,
    },
    {
      id: "r11",
      author: "Cao Thanh Tùng",
      rating: 5,
      content: "Giá tốt, chất lượng vẫn rất ổn. Recommend cho ai cần số lượng lớn.",
      date: "2026-04-22",
      verified: true,
      helpful: 6,
    },
  ],
};

export function getReviews(slug: string): Review[] {
  return mockReviews[slug] ?? [];
}
