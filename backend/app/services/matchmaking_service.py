import math
from typing import List, Tuple
from app.models.schemas import ItemResponse, ItemType, MatchSuggestion
from app.services.firestore_service import item_service

def calculate_haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Tính khoảng cách đường chim bay giữa 2 tọa độ (km)."""
    R = 6371.0  # Bán kính trái đất km
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = math.sin(delta_phi / 2.0) ** 2 + \
        math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)

class MatchmakingService:
    """
    Thuật toán ghép cặp thông minh giữa người cho và người nhận
    dựa trên nhu cầu, môn học/khối lớp và khoảng cách địa lý.
    """

    def find_all_matches(self, min_score: int = 50) -> List[MatchSuggestion]:
        all_items = item_service.list_items()
        givers = [i for i in all_items if i.type == ItemType.GIVE]
        receivers = [i for i in all_items if i.type == ItemType.RECEIVE]

        suggestions: List[MatchSuggestion] = []

        for giver in givers:
            for receiver in receivers:
                score, reasons, distance = self._evaluate_pair(giver, receiver)
                if score >= min_score:
                    suggestions.append(
                        MatchSuggestion(
                            giver_item=giver,
                            receiver_item=receiver,
                            match_score=min(score, 100),
                            distance_km=distance,
                            match_reasons=reasons
                        )
                    )

        # Sắp xếp theo điểm tương đồng cao nhất
        suggestions.sort(key=lambda s: s.match_score, reverse=True)
        return suggestions

    def _evaluate_pair(self, giver: ItemResponse, receiver: ItemResponse) -> Tuple[int, List[str], float]:
        score = 0
        reasons: List[str] = []

        # 1. Danh mục trùng khớp (Textbook, Uniform, Stationery...)
        if giver.category == receiver.category:
            score += 40
            cat_vn = {
                "TEXTBOOK": "Cùng danh mục Sách giáo khoa",
                "UNIFORM": "Cùng danh mục Đồng phục học sinh",
                "STATIONERY": "Cùng danh mục Dụng cụ học tập",
                "OTHER": "Cùng danh mục Đồ dùng học đường"
            }.get(giver.category.value, "Trùng danh mục")
            reasons.append(cat_vn)
        else:
            return 0, [], 999.0  # Không ghép nếu khác hoàn toàn danh mục

        # 2. Khối lớp trùng khớp
        if giver.grade and receiver.grade:
            if giver.grade == receiver.grade:
                score += 25
                reasons.append(f"Cùng khối Lớp {giver.grade}")
            elif abs(giver.grade - receiver.grade) == 1:
                score += 10
                reasons.append("Khối lớp lân cận phù hợp")

        # 3. Phân tích từ khóa tiêu đề (Toán, Văn, Chân Trời, Kết Nối, Cánh Diều, Casio...)
        giver_tokens = set(giver.title.lower().split() + [t.lower() for t in giver.tags])
        receiver_tokens = set(receiver.title.lower().split() + [t.lower() for t in receiver.tags])
        common_words = giver_tokens.intersection(receiver_tokens)
        stopwords = {"và", "cho", "xin", "cần", "bộ", "sgk", "em", "bạn", "lớp"}
        meaningful_common = [w for w in common_words if w not in stopwords and len(w) > 2]

        if meaningful_common:
            score += min(len(meaningful_common) * 10, 25)
            reasons.append(f"Khớp từ khóa quan trọng: {', '.join(meaningful_common[:3])}")

        # 4. Khoảng cách địa lý giữa 2 trường / địa điểm
        dist = calculate_haversine_distance(
            giver.location.latitude, giver.location.longitude,
            receiver.location.latitude, receiver.location.longitude
        )

        if dist <= 2.0:
            score += 15
            reasons.append(f"Rất gần nhau ({dist} km, cùng khu vực thuận tiện hẹn gặp)")
        elif dist <= 5.0:
            score += 10
            reasons.append(f"Khoảng cách gần ({dist} km)")
        elif dist <= 10.0:
            score += 5
            reasons.append(f"Cùng thành phố ({dist} km)")

        return score, reasons, dist

matchmaking_service = MatchmakingService()
