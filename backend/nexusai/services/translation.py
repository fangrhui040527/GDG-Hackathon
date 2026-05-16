from nexusai.config import Settings


class TranslationService:
    def translate_text(self, text: str, target_language: str = "en") -> str:
        raise NotImplementedError


class NoopTranslationService(TranslationService):
    def translate_text(self, text: str, target_language: str = "en") -> str:
        return text


class GoogleCloudTranslationService(TranslationService):
    def __init__(self, settings: Settings) -> None:
        self.settings = settings

    def translate_text(self, text: str, target_language: str = "en") -> str:
        try:
            from google.cloud import translate_v3 as translate
        except ImportError:
            return text

        client = translate.TranslationServiceClient()
        parent = f"projects/{self.settings.google_cloud_project}/locations/{self.settings.google_cloud_location}"
        response = client.translate_text(
            request={
                "parent": parent,
                "contents": [text],
                "mime_type": "text/plain",
                "target_language_code": target_language,
            }
        )
        if not response.translations:
            return text
        return response.translations[0].translated_text
