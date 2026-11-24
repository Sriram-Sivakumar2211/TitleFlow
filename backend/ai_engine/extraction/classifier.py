import re
from typing import Tuple
from app.models.document import DocumentCategory

CATEGORY_PATTERNS = {
    DocumentCategory.PROPERTY_DEED: [
        r"warranty deed", r"special warranty deed", r"quitclaim deed", r"grant deed",
        r"bargain and sale deed", r"convey and warrant", r"grantor", r"grantee", r"witnesseth"
    ],
    DocumentCategory.TITLE_REPORT: [
        r"preliminary title report", r"title commitment", r"commitment for title insurance",
        r"schedule a", r"schedule b", r"title insurance policy", r"alta commitment"
    ],
    DocumentCategory.MORTGAGE_DOCUMENT: [
        r"deed of trust", r"mortgage", r"promissory note", r"security instrument",
        r"borrower", r"lender", r"fannie mae", r"freddie mac", r"principal sum"
    ],
    DocumentCategory.LIEN_DOCUMENT: [
        r"mechanic'?s lien", r"notice of federal tax lien", r"judgment lien",
        r"claim of lien", r"lis pendens", r"abstract of judgment", r"encumbrance"
    ],
    DocumentCategory.TAX_RECORD: [
        r"property tax", r"tax assessment", r"county tax collector", r"ad valorem tax",
        r"millage rate", r"assessed valuation", r"tax bill", r"delinquent taxes"
    ],
    DocumentCategory.PURCHASE_AGREEMENT: [
        r"purchase and sale agreement", r"residential purchase agreement",
        r"contract for sale and purchase", r"buyer agrees to buy", r"earnest money deposit",
        r"inspection contingency", r"closing date shall be"
    ]
}

def classify_document(text: str) -> Tuple[DocumentCategory, float]:
    """
    Classifies raw document text into standard title & escrow categories.
    Returns (DocumentCategory, confidence_score).
    """
    if not text or len(text.strip()) == 0:
        return DocumentCategory.OTHER, 0.1

    lower_text = text.lower()
    scores = {}

    for cat, patterns in CATEGORY_PATTERNS.items():
        score = 0
        for pattern in patterns:
            matches = len(re.findall(pattern, lower_text))
            score += matches * 2
            # Extra weight if matched in first 1000 characters (title / header)
            if re.search(pattern, lower_text[:1000]):
                score += 5
        scores[cat] = score

    best_category = max(scores, key=scores.get)
    max_score = scores[best_category]

    if max_score == 0:
        return DocumentCategory.OTHER, 0.3

    # Normalize confidence between 0.65 and 0.98 based on match strength
    confidence = min(0.98, max(0.65, 0.60 + (max_score * 0.05)))
    return best_category, round(confidence, 2)
