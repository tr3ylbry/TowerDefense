"""Offline asset-format experiment; never writes game assets or generation originals.

Requires locally installed Pillow with WebP support; it is not a runtime dependency.
Usage: python3 scripts/research/compression-0.5.py /absolute/frozen/dist /absolute/tmp/output
"""
import hashlib
import json
import math
import pathlib
import sys

from PIL import Image, ImageChops, ImageStat, __version__, features

source = pathlib.Path(sys.argv[1]).resolve()
output = pathlib.Path(sys.argv[2]).resolve()
output.mkdir(parents=True, exist_ok=True)
rows = []
for file in sorted((source / "art/expedition").glob("*.png")):
    original = Image.open(file).convert("RGBA")
    width, height = original.size
    for maximum in (None, 384, 320):
        size = (width, height)
        if maximum:
            scale = min(1, maximum / max(width, height))
            size = (round(width * scale), round(height * scale))
        for quality in ("lossless", 85, 90):
            tag = f"{maximum or 'full'}-{quality}"
            destination = output / tag / (file.stem + ".webp")
            destination.parent.mkdir(exist_ok=True)
            encoding = {"format": "WEBP", "method": 6, "exact": True,
                        "lossless": quality == "lossless", "quality": 100 if quality == "lossless" else quality,
                        "alpha_quality": 100}
            prepared = original.resize(size, Image.Resampling.LANCZOS) if maximum else original
            prepared.save(destination, **encoding)
            decoded = Image.open(destination).convert("RGBA")
            row = {
                "file": file.name, "sourceBytes": file.stat().st_size,
                "sourceSha256": hashlib.sha256(file.read_bytes()).hexdigest(),
                "variant": tag, "dimensions": decoded.size,
                "bytes": destination.stat().st_size,
                "sha256": hashlib.sha256(destination.read_bytes()).hexdigest(),
                "encoding": encoding,
            }
            if not maximum:
                difference = ImageChops.difference(original, decoded)
                row["exactRgbaPixels"] = not any(high for low, high in difference.getextrema())
                row["exactAlphaPixels"] = not difference.getchannel("A").getbbox()
                # Premultiply before comparing so hidden RGB cannot dominate a visual error statistic.
                premultiplied = []
                for image in (original, decoded):
                    alpha = image.getchannel("A")
                    premultiplied.append(Image.merge("RGB", tuple(ImageChops.multiply(channel, alpha) for channel in image.split()[:3])))
                stats = ImageStat.Stat(ImageChops.difference(*premultiplied))
                row["premultipliedRgbMeanAbsoluteError"] = sum(stats.mean) / 3
                mse = sum(value * value for value in stats.rms) / 3
                row["premultipliedRgbPsnrDb"] = 10 * math.log10(255 * 255 / mse) if mse else None
            rows.append(row)
    print(f"Encoded {file.name}", flush=True)

canyon = source / "art/expedition/canyon.webp"
image = Image.open(canyon)
size = (1080, round(image.height * 1080 / image.width))
canyon_output = output / "canyon-1080-q85.webp"
encoding = {"format": "WEBP", "method": 6, "quality": 85}
image.resize(size, Image.Resampling.LANCZOS).save(canyon_output, **encoding)
result = {
    "sourceBuild": str(source), "outputDirectory": str(output),
    "codecVersion": {"Pillow": __version__, "libwebp": features.version("webp")},
    "notes": "Full-resolution lossless must match every decoded RGBA pixel. Lossy WebP keeps full-resolution alpha exact but changes RGB. Resized variants use proportional Pillow LANCZOS; visual review required, not implied by byte counts or PSNR. Premultiplied PSNR is only a diagnostic, not a quality guarantee. Sources never rewritten. Installed cwebp executable could not run on this ARM64 host (Bad CPU type); existing Pillow/libwebp was used without installing anything.",
    "originalCutoutBytes": sum(file.stat().st_size for file in (source / "art/expedition").glob("*.png")),
    "totals": {variant: sum(row["bytes"] for row in rows if row["variant"] == variant) for variant in sorted({row["variant"] for row in rows})},
    "canyon": {"sourceBytes": canyon.stat().st_size, "sourceDimensions": image.size,
               "sourceSha256": hashlib.sha256(canyon.read_bytes()).hexdigest(),
               "variantBytes": canyon_output.stat().st_size, "variantDimensions": size,
               "variantSha256": hashlib.sha256(canyon_output.read_bytes()).hexdigest(), "encoding": encoding},
    "variants": rows,
}
(output / "compression-candidates.json").write_text(json.dumps(result, indent=2) + "\n")
print(json.dumps({key: result[key] for key in ("originalCutoutBytes", "totals", "canyon")}, indent=2))
