// Netlify Function – creates a Stripe Checkout Session
// Secret key is read from environment variable STRIPE_SECRET_KEY

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  // Only allow POST
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const data = JSON.parse(event.body);
    const { items, freePatch, freeMysteryShirt, freeShipping, discountAmount, discountCode } = data;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "No items in cart" }),
      };
    }

    // Build line items for Stripe
    const line_items = items.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: `${item.name} (Size: ${item.size})`,
          images: item.image ? [item.image] : [],
        },
        unit_amount: Math.round(item.price * 100), // Stripe uses cents
      },
      quantity: item.qty,
    }));

    // Add free gifts as $0 line items so they show on the receipt
    if (freePatch) {
      line_items.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: "Free Patch (Spend $40+ reward)",
          },
          unit_amount: 0,
        },
        quantity: 1,
      });
    }

    if (freeMysteryShirt) {
      line_items.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: "Mystery Shirt (Spend $75+ reward)",
          },
          unit_amount: 0,
        },
        quantity: 1,
      });
    }

    // Shipping options
    const shipping_options = freeShipping
      ? [
          {
            shipping_rate_data: {
              type: "fixed_amount",
              fixed_amount: { amount: 0, currency: "usd" },
              display_name: "Free Shipping ($75+ reward)",
            },
          },
        ]
      : [
          {
            shipping_rate_data: {
              type: "fixed_amount",
              fixed_amount: { amount: 800, currency: "usd" }, // $8.00
              display_name: "Standard Shipping",
            },
          },
        ];

    // Create the Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items,
      shipping_options,
      shipping_address_collection: {
        allowed_countries: ["US", "CA"], // expand later if needed
      },
      success_url: `${process.env.URL || "https://ache-83f088.netlify.app"}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.URL || "https://ache-83f088.netlify.app"}/cart.html`,
      metadata: {
        discount_code: discountCode || "",
        discount_amount: discountAmount ? String(discountAmount) : "0",
      },
      // Optional: apply a coupon if you create one in Stripe later
      // discounts: discountAmount > 0 ? [{ coupon: "..." }] : [],
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ url: session.url }),
    };
  } catch (err) {
    console.error("Stripe error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};