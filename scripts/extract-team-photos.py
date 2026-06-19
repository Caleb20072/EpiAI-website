"""Extract portrait crops from the mentors org chart (1024x579)."""
from PIL import Image
from pathlib import Path

SRC = Path(__file__).parent.parent / "public/assets/team/charts/mentors.png"
OUT = Path(__file__).parent.parent / "public/assets/team/members"

# (filename, left, top, right, bottom) — tuned for 1024x579 chart
CROPS = {
    "sergino-bradford.jpg": (430, 55, 590, 175),
    "aime-rick-lotsu.jpg": (55, 195, 195, 335),
    "izzoudine-kanta.jpg": (280, 195, 420, 335),
    "yann-neris.jpg": (505, 195, 645, 335),
    "fabrice-tokoudagba.jpg": (730, 195, 870, 335),
    "hospice-hounfodji.jpg": (55, 355, 195, 495),
    "gilchris-houekpo.jpg": (280, 355, 420, 495),
    "farel-ganlaky.jpg": (505, 355, 645, 495),
    "maqsoud-tawaliou.jpg": (730, 355, 870, 495),
}

def main():
    OUT.mkdir(parents=True, exist_ok=True)
    img = Image.open(SRC).convert("RGB")
    for name, box in CROPS.items():
        crop = img.crop(box)
        size = max(crop.size)
        crop = crop.resize((400, 400), Image.LANCZOS)
        crop.save(OUT / name, quality=92)
        print(f"Wrote {name}")

if __name__ == "__main__":
    main()
