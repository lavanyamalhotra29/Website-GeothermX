import mongoose from "mongoose";
import { Resend } from "resend";

// 1. Mongo URI from env
const MONGO_URI = process.env.MONGO_URI;

// 2. Mongoose schema & model
const contactSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  message: String,
});

// Prevent model overwrite
const Contact =
  mongoose.models.Contact || mongoose.model("Contact", contactSchema);

// 3. Reuse DB connection
async function connectDB() {
  if (mongoose.connection.readyState === 1) return; // already connected
  if (!MONGO_URI) {
    console.error("MONGO_URI env var is missing");
    throw new Error("Database not configured");
  }
  await mongoose.connect(MONGO_URI);
}

// 4. Netlify Function handler
export default async (req, context) => {
  try {
    // Only allow POST
    if (req.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    // Parse JSON from frontend
    const { firstName, lastName, email, message } = await req.json();

    // Basic validation
    if (!firstName || !email || !message) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 1️⃣ Connect to DB
    await connectDB();

    // 2️⃣ Save to MongoDB
    const newContact = new Contact({ firstName, lastName, email, message });
    await newContact.save();

    // 3️⃣ Get API key from env and create Resend client LATE (no crash at top)
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      console.error("RESEND_API_KEY env var is missing");
      // We STILL return success for saving to DB, but warn about email
      return new Response(
        JSON.stringify({
          success: true,
          message:
            "Message saved, but email service is not configured on server.",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    const resend = new Resend(apiKey);

    // 4️⃣ Send email via Resend
    await resend.emails.send({
      from: "GeoThermX <onboarding@resend.dev>",
      to: "llavanya_be24@thapar.edu",
      subject: `their email : ${email}`,
      text: `message from them :\n\n"${message}"\n\n`,
    });

    // 5️⃣ Reply to frontend
    return new Response(
      JSON.stringify({ success: true, message: "Message saved & email sent" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Failed to save message or send email",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
