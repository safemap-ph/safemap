import pypdf
import sys

pdf_path = sys.argv[1]
with open(pdf_path, 'rb') as f:
    reader = pypdf.PdfReader(f)
    text = ""
    for page in reader.pages:
        text += page.extract_text() + "\n"

with open('pdf_output.txt', 'w', encoding='utf-8') as out:
    out.write(text)
