from PIL import Image, ImageEnhance, ImageFilter
import pytesseract, os, re, csv
from datetime import datetime

# Set Tesseract path
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

dataset_root = "expiry_dataset"

# Regex patterns for date recognition
date_patterns = [
    r'\b(?:exp(?:iry)?[:=\s]*)?(\d{1,2}[\s\/\-\.]{0,2}\d{1,2}[\s\/\-\.]{0,2}\d{2,4})\b',
    r'\b(?:exp(?:iry)?[:=\s]*)?((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[ \-\.]?\d{1,2}[ \-\.]?\d{2,4})\b',
    r'\b(?:exp(?:iry)?[:=\s]*)?(\d{1,2}[ \-\.]?(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[ \-\.]?\d{2,4})\b',
    r'\b(?:exp(?:iry)?[:=\s]*)?((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[ \-\.]?\d{2,4})\b',
    r'\b(?:exp(?:iry)?[:=\s]*)?(\d{4}[-/\.](?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[-/\.]?\d{1,2})\b',
    r'\b(?:exp(?:iry)?[:=\s]*)?((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[=,:\s\.]?\d{2,4})\b',
    r'\b(?:exp(?:iry)?[:=\s]*)?(\d{4}[,\.:-]\d{1,2})\b',
    r'\b(?:exp(?:iry)?[:=\s]*)?(exp\d{1,2}[\.:-]\d{1,2})\b',
    r'\b(\d{1,2}[\/\-]\d{2,4})\b',
]

# Supported date formats
date_formats = [
    "%m/%y", "%m-%y", "%m.%y", "%y/%m", "%y-%m",
    "%d/%m/%Y", "%d-%m-%Y", "%d.%m.%Y",
    "%d/%m/%y", "%d-%m-%y", "%d.%m.%y",
    "%b.%d.%y", "%b-%d-%Y", "%b %d %Y", "%d %b %Y", "%d %b %y",
    "%Y-%m-%d", "%Y/%m/%d",
    "%b %Y", "%b %y", "%B %Y", "%B %y",
    "%Y,%m", "%Y.%m", "%Y-%b-%d", "%b-%Y", "%b=%Y"
]

# Preprocess image
def preprocess_image(image):
    image = image.convert("L")
    image = image.resize((image.width * 2, image.height * 2))
    image = ImageEnhance.Contrast(image).enhance(2.0)
    image = image.filter(ImageFilter.SHARPEN)
    image = image.point(lambda x: 0 if x < 160 else 255, '1')
    return image

# OCR + date extraction
def extract_expiry_date(image_path):
    try:
        image = Image.open(image_path)
        image = preprocess_image(image)
        text = pytesseract.image_to_string(image, config="--psm 6")
        print(f"\n📄 OCR Text from image:\n{text.strip()}")

        text_lower = text.lower()
        mfg_date = None
        exp_date = None

        for pattern in date_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                if isinstance(match, tuple):
                    match = " ".join(match)
                cleaned = match.strip().replace("—", "-").replace("|", "").replace("–", "-").replace("=", "-").replace(",", "-").replace("  ", " ")

                for fmt in date_formats:
                    try:
                        parsed_date = datetime.strptime(cleaned, fmt)
                        iso_date = parsed_date.strftime('%Y-%m-%d')
                        print(f"🎯 Match: '{match}' → Parsed as: {iso_date} using format: {fmt}")

                        if "mfg" in text_lower or "manufacturing" in text_lower:
                            if mfg_date is None and re.search(r"(mfg|manufacturing).{0,10}" + re.escape(match), text_lower):
                                mfg_date = iso_date
                        if "exp" in text_lower or "expiry" in text_lower:
                            if exp_date is None and re.search(r"(exp|expiry).{0,10}" + re.escape(match), text_lower):
                                exp_date = iso_date

                        if exp_date is None:
                            exp_date = iso_date
                        if mfg_date is None and "mfg" not in text_lower:
                            mfg_date = iso_date
                        break
                    except Exception:
                        continue

        return {
            "mfg_date": mfg_date if mfg_date else "Not found",
            "exp_date": exp_date if exp_date else "Not found"
        }

    except Exception as e:
        return {"error": str(e)}

# Process all images and write to CSV
def scan_all_images(root_folder):
    with open("extracted_dates.csv", mode="w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["Dataset", "Filename", "MFG Date", "EXP Date"])

        for subset in ["train", "test"]:
            folder_path = os.path.join(root_folder, subset)
            if not os.path.exists(folder_path):
                print(f"❌ Folder not found: {folder_path}")
                continue

            print(f"\n🔍 Scanning '{subset}' dataset...\n")
            total = 0
            found = 0

            for img_file in os.listdir(folder_path):
                if img_file.lower().endswith(('.png', '.jpg', '.jpeg')):
                    img_path = os.path.join(folder_path, img_file)
                    result = extract_expiry_date(img_path)
                    writer.writerow([subset, img_file, result.get("mfg_date"), result.get("exp_date")])
                    print(f"{subset}/{img_file}: {result}")
                    total += 1
                    if result.get("mfg_date") != "Not found" or result.get("exp_date") != "Not found":
                        found += 1

            print(f"\n✅ Summary for '{subset}': {found}/{total} images had dates extracted.\n")

# Run it
if __name__ == "__main__":
    scan_all_images(dataset_root)
