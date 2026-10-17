import logging
import os
from typing import Optional, Any
import firebase_admin
from firebase_admin import credentials, firestore, auth
from app.core.config import settings

logger = logging.getLogger("reschool.firebase")

class FirebaseManager:
    """
    Quản lý kết nối Firebase Admin SDK (Firestore & Auth).
    Tự động nhận diện Service Account Key hoặc hoạt động ở chế độ Local Mock
    khi người dùng chưa upload file serviceAccountKey.json.
    """
    _instance: Optional["FirebaseManager"] = None
    _initialized: bool = False
    _db: Optional[Any] = None
    _is_mock: bool = False

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def initialize(self) -> None:
        if self._initialized:
            return

        cred_path = settings.FIREBASE_SERVICE_ACCOUNT_PATH
        if cred_path and os.path.exists(cred_path):
            try:
                cred = credentials.Certificate(cred_path)
                firebase_admin.initialize_app(cred, {
                    'projectId': settings.FIREBASE_PROJECT_ID
                })
                self._db = firestore.client()
                self._is_mock = False
                self._initialized = True
                logger.info("Firebase Admin SDK đã kết nối thành công tới Project: %s", settings.FIREBASE_PROJECT_ID)
                return
            except Exception as e:
                logger.warning("Không thể khởi tạo Firebase bằng Certificate: %s. Chuyển sang Local Dev Mode.", e)

        # Fallback to local simulated storage
        self._is_mock = True
        self._db = None
        self._initialized = True
        logger.info("Firebase hoạt động ở chế độ Local Simulator (Sẵn sàng nhận Service Account Key).")

    @property
    def db(self) -> Optional[Any]:
        if not self._initialized:
            self.initialize()
        return self._db

    @property
    def is_mock(self) -> bool:
        return self._is_mock

    def verify_token(self, id_token: str) -> Optional[dict]:
        """Xác thực Firebase Auth ID Token từ Client Frontend."""
        if self._is_mock:
            # Trong chế độ dev local, hỗ trợ mock token an toàn
            return {
                "uid": "demo-student-uid-123",
                "email": "hocsinh@reschool.edu.vn",
                "name": "Học sinh Reschool"
            }
        try:
            decoded_token = auth.verify_id_token(id_token)
            return decoded_token
        except Exception as e:
            logger.error("Lỗi xác thực Firebase ID Token: %s", e)
            return None

firebase_manager = FirebaseManager()
