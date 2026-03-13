// Smart category suggestions based on keywords
export const CATEGORY_KEYWORDS = {
  "Food": [
    "pizza", "burger", "restaurant", "food", "lunch", "dinner", "breakfast", 
    "coffee", "starbucks", "mcdonalds", "subway", "kfc", "dominos", 
    "groceries", "supermarket", "walmart", "target", "whole foods", 
    "meal", "snack", "drink", "beverage", "water", "soda", "juice"
  ],
  "Transportation": [
    "uber", "lyft", "taxi", "cab", "gas", "petrol", "fuel", "parking", 
    "metro", "subway", "bus", "train", "ticket", "commute", "travel", 
    "flight", "airport", "rental car", "zipcar", "bike", "scooter"
  ],
  "Shopping": [
    "amazon", "shopping", "store", "mall", "clothes", "shoes", "electronics",
    "gadget", "phone", "laptop", "tv", "furniture", "home", "decor",
    "walmart", "target", "costco", "ikea", "best buy", "purchase"
  ],
  "Entertainment": [
    "movie", "cinema", "netflix", "spotify", "music", "concert", "theater",
    "game", "gaming", "playstation", "xbox", "nintendo", "sports", "ticket",
    "event", "show", "netflix", "hulu", "disney", "youtube premium"
  ],
  "Healthcare": [
    "doctor", "hospital", "clinic", "pharmacy", "medicine", "prescription",
    "dentist", "dental", "eye", "vision", "glasses", "insurance", "health",
    "medical", "checkup", "therapy", "fitness", "gym", "workout"
  ],
  "Utilities": [
    "electric", "electricity", "water", "gas", "internet", "wifi", "phone",
    "mobile", "cable", "tv", "rent", "mortgage", "property", "heat", "ac",
    "air conditioning", "utility", "bill", "subscription"
  ],
  "Education": [
    "school", "college", "university", "course", "class", "tuition", "book",
    "textbook", "study", "education", "learning", "online course", "certification",
    "training", "workshop", "seminar"
  ],
  "Personal": [
    "haircut", "salon", "spa", "massage", "gym", "fitness", "personal",
    "care", "beauty", "cosmetics", "skincare", "makeup", "clothing", "laundry",
    "dry cleaning", "gift", "present", "donation", "charity"
  ],
  "Bills": [
    "bill", "payment", "invoice", "fee", "charge", "subscription", "renewal",
    "membership", "insurance", "tax", "government", "license", "registration",
    "maintenance", "repair", "service"
  ],
  "Other": [
    "misc", "miscellaneous", "other", "cash", "atm", "bank", "transfer",
    "withdraw", "deposit", "interest", "investment", "savings", "emergency"
  ]
};

export function suggestCategory(title: string): string | null {
  if (!title) return null;
  
  const lowerTitle = title.toLowerCase();
  
  // Check each category for keyword matches
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerTitle.includes(keyword)) {
        return category;
      }
    }
  }
  
  return null;
}

export function getCategorySuggestions(partialTitle: string): string[] {
  if (!partialTitle) return [];
  
  const lowerTitle = partialTitle.toLowerCase();
  const matchedCategories: string[] = [];
  
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (keyword.includes(lowerTitle) || lowerTitle.includes(keyword)) {
        if (!matchedCategories.includes(category)) {
          matchedCategories.push(category);
        }
        break; // Found a match for this category, move to next category
      }
    }
  }
  
  return matchedCategories;
}
