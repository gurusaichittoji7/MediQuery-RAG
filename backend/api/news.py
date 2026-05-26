import os
from newsapi import NewsApiClient
from datetime import datetime, timedelta

def fetch_health_news(query: str, max_results: int = 5) -> list[dict]:
    api_key = os.getenv("NEWS_API_KEY")
    if not api_key:
        return []

    try:
        client = NewsApiClient(api_key=api_key)
        from_date = (datetime.now() - timedelta(days=7)).strftime("%Y-%m-%d")

        response = client.get_everything(
            q=query,
            language="en",
            sort_by="publishedAt",
            from_param=from_date,
            page_size=max_results,
            domains="who.int,cdc.gov,nih.gov,webmd.com,healthline.com,medicalnewstoday.com,reuters.com,bbc.com"
        )

        articles = []
        for article in response.get("articles", []):
            title = article.get("title", "")
            description = article.get("description", "") or ""
            source = article.get("source", {}).get("name", "")
            url = article.get("url", "")
            published = article.get("publishedAt", "")[:10]

            if not title or "[Removed]" in title:
                continue

            articles.append({
                "text": f"[LIVE NEWS - {published}] {source}: {title}. {description}",
                "source": url,
                "category": "live-news",
            })

        return articles

    except Exception as e:
        print(f"[NewsAPI] Failed: {e}")
        return []

def is_current_events_query(question: str) -> bool:
    keywords = [
        "latest", "recent", "current", "today", "now", "outbreak",
        "news", "update", "2024", "2025", "2026", "new", "emerging",
        "live", "happening", "cases", "surge", "spread"
    ]
    q = question.lower()
    return any(k in q for k in keywords)