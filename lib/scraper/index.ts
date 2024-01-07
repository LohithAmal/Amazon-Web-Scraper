import axios from "axios";
import * as cheerio from "cheerio";
import { extractCurrency, extractPrice } from "./utils";

export async function scrapeAmazonProduct(url: string) {
  if (!url) return;

  // BrightData Proxy Configuration
  const username = String(process.env.BRIGHT_DATA_USERNAME);
  const password = String(process.env.BRIGHT_DATA_PASSWORD);
  const port = 22225;
  const session_id = (1000000 * Math.random()) | 0;
  const options = {
    auth: {
      username: `${username}-session-${session_id}`,
      password,
    },
    host: "brd.superproxy.io",
    port,
    rejectUnauthorized: false,
  };
  try {
    //fetch the prodduct page
    const response = await axios.get(url, options);
    const $ = cheerio.load(response.data);
    const title = $("#productTitle").text().trim();
    const currentPrice = extractPrice(
      $(".priceTopay span.a-price-whole"),
      $(".a.size.base.a-color-price"),
      $(".a-button-selected .a-color-base"),
      $("span.a-price-whole")
    );
    const originalPrice = extractPrice(
      $("#priceblock_ourprice"),
      $("a.price.a-text-price span.a-offscreen"),
      $("#listPrice"),
      $("#priceblock_dealprice"),
      $("a-size-base.a-color-price"),
      $(
        "#corePriceDisplay_desktop_feature_div > div.a-section.a-spacing-small.aok-align-center > span > span.aok-relative > span > span > span.a-offscreen"
      )
    );
    console.log(originalPrice);
    const outOfStock = $("#availability span")
      .text()
      .trim()
      .toLowerCase()
      .includes("currently unavailable");
    const images =
      $("#imgBlkFront").attr("data-a-dynamic-image") ||
      $("#landingImage").attr("data-a-dynamic-image") ||
      "{}";
    const imageUrls = Object.keys(JSON.parse(images));
    const currency = extractCurrency($(".a-price-symbol"));
    const discountRate = $(".savingPriceOverride").text().replace(/[-%]/g, "");

    const formattedPrice = currentPrice.match(/^\d+(?=\.)/);
    const formattedOriginalPrice = originalPrice.match(/^\d+(?=\.)/);

    const data = {
      url,
      currency: currency || "$",
      Image: imageUrls[0],
      title,
      currentPrice: Number(formattedPrice),
      originalPrice: Number(formattedOriginalPrice),
      priceHistory: [],
      discountRate: Number(discountRate),
      category: "Category",
      reviewCount: 100,
      stars: 4.5,
      isOutOFStock: outOfStock,
    };
    //console.log(data);
  } catch (error: any) {
    throw new Error(`Failed to scrape product: ${error.message}`);
  }
}
