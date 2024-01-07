"use client";
import { scrapeAndStoreProduct } from "@/lib/actions";
import { FormEvent, useState } from "react";

const isValidAmazonProductURL = (url: string) => {
  try {
    const parsedURL = new URL(url);
    const hostname = parsedURL.hostname;
    // check if amazon.in amazom.ca .com
    if (
      hostname.includes("amazon.ca") ||
      hostname.includes("amazon.") ||
      hostname.endsWith("amazon")
    ) {
      return true;
    } else {
      alert("No a valid Link Amigo");
      return false;
    }
  } catch (error) {
    return false;
  }
};
const Searchbar = () => {
  const [searchPrompt, setSearchPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const isValidLink = isValidAmazonProductURL(searchPrompt);
    if (!isValidLink) return alert("Please enter a valid Amazon Link");
    try {
      setIsLoading(true);
      //scrape the page
      const product = await scrapeAndStoreProduct(searchPrompt);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap gap-4 mt-12">
      <input
        value={searchPrompt}
        onChange={(e) => setSearchPrompt(e.target.value)}
        type="text"
        placeholder="Enter Product link"
        className="searchbar-input"
      />
      <button
        className="searchbar-btn"
        disabled={searchPrompt === ""}
        type="submit"
      >
        {isLoading ? "Searching ..." : "Search"}
      </button>
    </form>
  );
};

export default Searchbar;
