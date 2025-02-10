import requests
import random
import string
import re

def generate_random_url():
    """Generates a random Catbox.moe file URL."""
    characters = string.ascii_lowercase + string.digits
    file_id = ''.join(random.choice(characters) for i in range(6))
    extensions = ["jpg", "png", "gif", "mp4", "webm", "txt", "pdf", "zip", "rar"]  # Add more as needed
    extension = random.choice(extensions)
    return f"https://files.catbox.moe/{file_id}.{extension}"

def scrape_url(url):
    """Scrapes a given URL, checking for 404 errors."""
    try:
        response = requests.get(url, timeout=5)  # Set a timeout to prevent hanging
        response.raise_for_status()  # Raise an exception for bad status codes (4xx or 5xx)
        if response.status_code == 200:
            print(f"Found valid URL: {url}")
            # Process the content if needed (e.g., download, extract data)
            # Example:
            # with open(f"{url.split('/')[-1]}", "wb") as f:
            #       f.write(response.content)

            return True  # URL is valid and accessible

        else:
            print(f"Unexpected status code for {url}: {response.status_code}")
            return False

    except requests.exceptions.RequestException as e:
        # Catch various request exceptions (e.g., connection errors, timeouts)
        print(f"Error scraping {url}: {e}")
        return False
    except Exception as e: # Catch any other unexpected exceptions
        print(f"An unexpected error occured: {e}")
        return False


def main():
    """Main function to generate and scrape URLs."""
    num_urls_to_scrape = 10  # Number of URLs to try

    for _ in range(num_urls_to_scrape):
        url = generate_random_url()
        scrape_url(url)

if __name__ == "__main__":
    main()