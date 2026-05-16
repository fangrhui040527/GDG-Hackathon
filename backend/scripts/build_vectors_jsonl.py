import argparse
import json
import os
import sys
from pathlib import Path

sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from app.config import settings
from app.models import VertexEmbeddingsRequest
from app.services.vertex_embeddings import embed_texts


def main() -> None:
    parser = argparse.ArgumentParser(description="Build JSONL with embeddings")
    parser.add_argument("--input", required=True, help="Text file, one line per doc")
    parser.add_argument("--output", required=True, help="Output JSONL path")
    args = parser.parse_args()

    input_path = Path(args.input)
    output_path = Path(args.output)

    if not input_path.exists():
        raise FileNotFoundError(input_path)

    lines = [line.strip() for line in input_path.read_text(encoding="utf-8").splitlines() if line.strip()]
    if not lines:
        raise ValueError("Input file is empty")

    embeddings = embed_texts(settings, VertexEmbeddingsRequest(texts=lines)).embeddings

    with output_path.open("w", encoding="utf-8") as handle:
        for idx, (text, vector) in enumerate(zip(lines, embeddings), start=1):
            record = {
                "doc_id": str(idx),
                "content": text,
                "metadata": {},
                "embedding": vector,
            }
            handle.write(json.dumps(record) + "\n")


if __name__ == "__main__":
    main()
